/// <reference types="vitest/globals" />
import { subscriptionService } from "../services/subscription_service";
import { userWordService } from "../services/user_word_service";
import * as helpers from "./helpers";

const {
  createContextMenuService,
  startServiceWorkerService,
  createWebpushService,
} = helpers;

describe("Service Worker Suite", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Web Push API", async () => {
    describe("Subscribing", () => {
      it("subscribes to the web push API and sends the subscription to the server", async () => {
        const mockSubscription = {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          getKey: function () {},
        } as unknown as PushSubscription;
        const mockSubscribe = vi.fn().mockResolvedValue(mockSubscription);
        const mockSelf = {
          registration: {
            pushManager: {
              subscribe: mockSubscribe,
            },
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi.fn(),
        } as unknown as ServiceWorkerGlobalScope;
        const mockHandleNavigate = vi.fn();

        const webpushService = createWebpushService(
          mockSelf,
          mockHandleNavigate
        );
        const subscription = await webpushService.subscribe();

        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith({
          userVisibleOnly: true,
          applicationServerKey: expect.any(Uint8Array),
        });
        expect(subscription).toEqual(mockSubscription);
        expect(mockHandleNavigate).not.toHaveBeenCalled();
      });

      it("does not create subscription or handle push event when subscription to web push fails", async () => {
        const mockSubscribe = vi.fn().mockImplementation(() => {
          throw new Error("subscription fails");
        });
        const mockSelf = {
          registration: {
            pushManager: {
              subscribe: mockSubscribe,
            },
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi.fn(),
        } as unknown as ServiceWorkerGlobalScope;
        const mockHandleNavigate = vi.fn();

        const webpushService = createWebpushService(
          mockSelf,
          mockHandleNavigate
        );
        const subscription = await webpushService.subscribe();

        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith({
          userVisibleOnly: true,
          applicationServerKey: expect.any(Uint8Array),
        });
        expect(subscription).toEqual(null);
        expect(mockHandleNavigate).not.toHaveBeenCalled();
      });
    });

    describe("Push Events", () => {
      it("handles responding to the 'push' event", async () => {
        const promise = Promise.resolve();
        const mockShowNotification = vi.fn().mockReturnValue(promise);
        const mockWaitUntil = vi.fn();
        const words = ["hello", "welcome"];
        const wordReminderId = "1";
        const mockSelf = {
          registration: {
            showNotification: mockShowNotification,
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi
            .fn()
            .mockImplementationOnce(async (_event, callback) => {
              const event = {
                data: {
                  json: function () {
                    return { words, id: wordReminderId };
                  },
                },
                waitUntil: mockWaitUntil,
              } as unknown as PushEvent;
              await callback(event);
            })
            .mockImplementation(vi.fn()),
        } as unknown as ServiceWorkerGlobalScope;

        const mockHandleNavigate = vi.fn();
        window.Notification = {
          prototype: {
            actions: [],
          },
        } as never;
        createWebpushService(mockSelf, mockHandleNavigate);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockWaitUntil).toHaveBeenCalledTimes(1);
        expect(mockWaitUntil).toHaveBeenCalledWith(promise);
        expect(mockShowNotification).toHaveBeenCalledTimes(1);
        expect(mockShowNotification).toHaveBeenCalledWith(
          `Word Reminder Chrome Extension: your active word reminder has these words:`,
          {
            body: words,
            icon: "/favicon/web-app-manifest-192x192.png",
            actions: [
              {
                action: "navigate-to-word-reminder",
                title: "Navigate to Word Reminder",
                icon: "/images/navigation.png",
              },
            ],
          }
        );
        expect(mockHandleNavigate).not.toHaveBeenCalled();
      });

      it("handles responding to the 'push' event when notification actions are not supported", async () => {
        const promise = Promise.resolve();
        const mockShowNotification = vi.fn().mockReturnValue(promise);
        const mockClose = vi.fn();
        const mockWaitUntil = vi.fn();
        const words = ["hello", "welcome"];
        const mockSelf = {
          registration: {
            showNotification: mockShowNotification,
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi
            .fn()
            .mockImplementationOnce(async (_event, callback) => {
              const wordReminderId = "1";
              const event = {
                data: {
                  json: function () {
                    return { words, id: wordReminderId };
                  },
                },
                waitUntil: mockWaitUntil,
              } as unknown as PushEvent;
              await callback(event);
            })
            .mockImplementation(vi.fn()),
        } as unknown as ServiceWorkerGlobalScope;

        const mockHandleNavigate = vi.fn();
        window.Notification = {
          prototype: {},
        } as never;
        createWebpushService(mockSelf, mockHandleNavigate);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockWaitUntil).toHaveBeenCalledTimes(1);
        expect(mockWaitUntil).toHaveBeenCalledWith(promise);
        expect(mockShowNotification).toHaveBeenCalledTimes(1);
        expect(mockShowNotification).toHaveBeenCalledWith(
          `Word Reminder Chrome Extension: your active word reminder has these words:`,
          {
            body: words,
            icon: "/favicon/web-app-manifest-192x192.png",
          }
        );
        expect(mockHandleNavigate).not.toBeCalled();
        expect(mockClose).not.toHaveBeenCalled();
      });

      it("does not handle responding to the 'push' event when there is no payload", async () => {
        const promise = Promise.resolve();
        const mockShowNotification = vi.fn().mockReturnValue(promise);
        const mockWaitUntil = vi.fn();
        const mockSelf = {
          registration: {
            showNotification: mockShowNotification,
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi
            .fn()
            .mockImplementationOnce(async (_event, callback) => {
              const event = {
                data: null,
                waitUntil: mockWaitUntil,
              } as unknown as PushEvent;

              await callback(event);
            })
            .mockImplementation(vi.fn()),
        } as unknown as ServiceWorkerGlobalScope;

        const mockHandleNavigate = vi.fn();
        createWebpushService(mockSelf, mockHandleNavigate);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockShowNotification).not.toHaveBeenCalled();
        expect(mockWaitUntil).not.toHaveBeenCalled();
      });
    });

    describe("Push Subscription Change Events", () => {
      it("handles responding to the 'pushsubscriptionchange' event", async () => {
        const userId = "1";
        const mockGet = vi
          .spyOn(chrome.storage.sync, "get")
          .mockImplementation(async () => {
            return { userId };
          });
        const mockCreateSubscription = vi
          .spyOn(subscriptionService, "createSubscription")
          .mockResolvedValue({
            json: { subscription: { id: "1" } },
            status: 200,
          });
        const mockSubscription = {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          getKey: function () {},
        } as unknown as PushSubscription;
        const mockSubscribe = vi.fn().mockResolvedValue(mockSubscription);
        const mockSelf = {
          registration: {
            pushManager: {
              subscribe: mockSubscribe,
            },
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi
            .fn()
            .mockImplementationOnce(vi.fn())
            .mockImplementationOnce(async (_event, callback) => {
              await callback();
            })
            .mockImplementationOnce(vi.fn()),
        } as unknown as ServiceWorkerGlobalScope;

        const mockHandleNavigate = vi.fn();
        createWebpushService(mockSelf, mockHandleNavigate);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith({
          userVisibleOnly: true,
          applicationServerKey: expect.any(Uint8Array),
        });
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledWith(["userId"]);
        expect(mockCreateSubscription).toHaveBeenCalledTimes(1);
        expect(mockCreateSubscription).toHaveBeenCalledWith({
          subscription: {
            endpoint: "https://random-push-service.com/unique-id-1234/",
            getKey: expect.any(Function),
          },
          userId,
        });
      });

      it("handles responding to the 'pushsubscriptionchange' event when the web push subscribe fails", async () => {
        const userId = "1";
        const mockGet = vi
          .spyOn(chrome.storage.sync, "get")
          .mockImplementation(async () => {
            return { userId };
          });
        const mockCreateSubscription = vi
          .spyOn(subscriptionService, "createSubscription")
          .mockResolvedValue({
            json: { subscription: { id: "1" } },
            status: 200,
          });
        const mockSubscribe = vi.fn().mockResolvedValue(null);
        const mockSelf = {
          registration: {
            pushManager: {
              subscribe: mockSubscribe,
            },
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi
            .fn()
            .mockImplementationOnce(vi.fn())
            .mockImplementationOnce(async (_event, callback) => {
              await callback();
            })
            .mockImplementationOnce(vi.fn()),
        } as unknown as ServiceWorkerGlobalScope;

        const mockHandleNavigate = vi.fn();
        createWebpushService(mockSelf, mockHandleNavigate);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith({
          userVisibleOnly: true,
          applicationServerKey: expect.any(Uint8Array),
        });
        expect(mockGet).not.toHaveBeenCalled();
        expect(mockCreateSubscription).not.toHaveBeenCalled();
      });

      it("handles responding to the 'pushsubscriptionchange' event when the user id is not in chrome storage sync", async () => {
        const mockGet = vi
          .spyOn(chrome.storage.sync, "get")
          .mockImplementation(async () => {
            return { userId: undefined };
          });
        const mockCreateSubscription = vi
          .spyOn(subscriptionService, "createSubscription")
          .mockResolvedValue({
            json: { subscription: { id: "1" } },
            status: 200,
          });
        const mockSubscription = {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          getKey: function () {},
        } as unknown as PushSubscription;
        const mockSubscribe = vi.fn().mockResolvedValue(mockSubscription);
        const mockSelf = {
          registration: {
            pushManager: {
              subscribe: mockSubscribe,
            },
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi
            .fn()
            .mockImplementationOnce(vi.fn())
            .mockImplementationOnce(async (_event, callback) => {
              await callback();
            })
            .mockImplementationOnce(vi.fn()),
        } as unknown as ServiceWorkerGlobalScope;

        const mockHandleNavigate = vi.fn();
        createWebpushService(mockSelf, mockHandleNavigate);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith({
          userVisibleOnly: true,
          applicationServerKey: expect.any(Uint8Array),
        });
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledWith(["userId"]);
        expect(mockCreateSubscription).not.toHaveBeenCalled();
      });
    });

    describe("Notification Click Events", () => {
      it("handles responding to the 'notificationclick' event", async () => {
        const mockSubscription = {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          getKey: function () {},
        } as unknown as PushSubscription;
        const mockSubscribe = vi.fn().mockResolvedValue(mockSubscription);
        const mockClose = vi.fn();
        const mockSelf = {
          registration: {
            pushManager: {
              subscribe: mockSubscribe,
            },
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi
            .fn()
            .mockImplementationOnce(vi.fn())
            .mockImplementationOnce(vi.fn())
            .mockImplementationOnce(async (_event, callback) => {
              const mockEvent = {
                action: "navigate-to-word-reminder",
                notification: {
                  close: mockClose,
                },
              };
              await callback(mockEvent);
            }),
        } as unknown as ServiceWorkerGlobalScope;

        const mockHandleNavigate = vi.fn();
        createWebpushService(mockSelf, mockHandleNavigate);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockHandleNavigate).toHaveBeenCalledTimes(1);
        expect(mockHandleNavigate).toHaveBeenCalledWith("wordReminders", "1");
        expect(mockClose).toHaveBeenCalledTimes(1);
        expect(mockClose).toHaveBeenCalledWith();
      });

      it("does nothing when 'notificationclick' is a normal notification click with no action", async () => {
        const mockClose = vi.fn();
        const mockSubscribe = vi.fn().mockResolvedValue(null);
        const mockSelf = {
          registration: {
            pushManager: {
              subscribe: mockSubscribe,
            },
          },
          navigator: {
            serviceWorker: {},
          },
          addEventListener: vi
            .fn()
            .mockImplementationOnce(vi.fn())
            .mockImplementationOnce(vi.fn())
            .mockImplementation(async (_event, callback) => {
              const mockEvent = {
                notification: {
                  close: mockClose,
                },
              };
              await callback(mockEvent);
            })
            .mockImplementationOnce(vi.fn()),
        } as unknown as ServiceWorkerGlobalScope;

        const mockHandleNavigate = vi.fn();
        createWebpushService(mockSelf, mockHandleNavigate);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockHandleNavigate).not.toHaveBeenCalled();
        expect(mockClose).not.toHaveBeenCalled();
      });
    });
  });

  describe("Context Menus", () => {
    it("creates a context menu item", async () => {
      const mockCreate = vi.spyOn(chrome.contextMenus, "create");

      const userId = "1";
      const mockHandleNavigate = vi.fn();
      createContextMenuService(userId, mockHandleNavigate);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        id: "84",
        title: "Add Word",
        contexts: ["selection"],
        type: "normal",
        enabled: true,
        visible: true,
      });
    });

    it("creates user word, opens popup, and sends message when the context menu callback is called", async () => {
      const userWordId = "10";
      const mockCreateUserWord = vi
        .spyOn(userWordService, "createUserWord")
        .mockResolvedValue({
          json: { userWord: { id: userWordId } },
          status: 200,
        });

      const userId = "1";
      const mockHandleNavigate = vi.fn();
      const contextMenuService = createContextMenuService(
        userId,
        mockHandleNavigate
      );
      const selectionText = "word";
      const info = {
        selectionText,
      } as unknown as chrome.contextMenus.OnClickData;
      const formData = new FormData();
      formData.append("word", selectionText);
      await contextMenuService.onClickedCallback(info);

      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({ userId, formData });
      expect(mockHandleNavigate).toHaveBeenCalledTimes(1);
      expect(mockHandleNavigate).toHaveBeenCalledWith("userWords", userWordId);
    });

    it("does not create user word, opens popup, and sends message when select text is empty", async () => {
      const userWordId = "10";
      const mockCreateUserWord = vi
        .spyOn(userWordService, "createUserWord")
        .mockResolvedValue({
          json: { userWord: { id: userWordId } },
          status: 200,
        });

      const userId = "1";
      const mockHandleNavigate = vi.fn();
      const contextMenuService = createContextMenuService(
        userId,
        mockHandleNavigate
      );
      const selectionText = "";
      const info = {
        selectionText,
      } as unknown as chrome.contextMenus.OnClickData;
      const formData = new FormData();
      formData.append("word", selectionText);
      await contextMenuService.onClickedCallback(info);

      expect(mockCreateUserWord).not.toHaveBeenCalled();
      expect(mockHandleNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Service Worker Init", () => {
    it("sets up the 'onMessage' listener when the 'onInstalled' event fires", async () => {
      const userId = "1";
      const mockOnInstalledAddListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "addListener"
      );
      const mockFocusedWindow = {
        id: "2",
      } as unknown as chrome.windows.Window;
      const mockUpdateWindow = {
        id: "3",
      } as unknown as chrome.windows.Window;
      const mockGetLastFocused = vi
        .spyOn(chrome.windows, "getLastFocused")
        .mockResolvedValue(mockFocusedWindow);
      const mockUpdate = vi
        .spyOn(chrome.windows, "update")
        .mockResolvedValue(mockUpdateWindow as never);
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");
      const mockSendMessage = vi.spyOn(chrome.runtime, "sendMessage");
      const mockOnMessageAddListener = vi
        .spyOn(chrome.runtime.onMessage, "addListener")
        .mockImplementation(vi.fn());
      const mockGet = vi
        .spyOn(chrome.storage.sync, "get")
        .mockImplementation(async () => {
          return { userId };
        });
      const mockSubscribe = vi.fn().mockImplementation(async () => {
        const mockSubscription = {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          getKey: vi.fn().mockImplementation((key) => {
            if (key === "p256dh") {
              return "BIPUL12DLfytvTajnryr2PRdAgXS3HGKiLqndGcJGabyhHheJYlNGCeXl1dn18gSJ1WAkAPIxr4gK0_dQds4yiI";
            } else if (key === "auth") {
              return "FPssNDTKnInHVndSTdbKFw==";
            }
          }),
        } as unknown as PushSubscription;
        return mockSubscription;
      });
      let handleNavigate = vi.fn();
      const mockCreateWebpushService = vi
        .fn()
        .mockImplementation((_self, callback) => {
          handleNavigate = callback;
          return {
            subscribe: mockSubscribe,
          };
        });
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi.fn().mockReturnValue({
        onClickedCallback: mockOnClickedCallback,
      });
      const mockCreateSubscription = vi
        .spyOn(subscriptionService, "createSubscription")
        .mockResolvedValue({
          json: { subscription: { id: "1" } },
          status: 200,
        });
      const mockInfo = {} as unknown as chrome.contextMenus.OnClickData;
      vi.spyOn(chrome.contextMenus.onClicked, "addListener").mockImplementation(
        (callback) => {
          callback(mockInfo);
        }
      );

      const words = ["hello", "welcome"];
      const mockWaitUntil = vi.fn();
      const wordReminderId = "1";
      const mockEvent = {
        data: {
          json: function () {
            return {
              words,
              id: wordReminderId,
            };
          },
        },
        waitUntil: mockWaitUntil,
      } as unknown as PushEvent;
      const mockSelf = {
        registration: {},
        navigator: {
          serviceWorker: {},
        },
        addEventListener: vi
          .fn()
          .mockImplementationOnce(async (_event, callback) => {
            await callback(mockEvent);
          })
          .mockImplementationOnce(async (_event, callback) => {
            await callback();
          }),
        PushManager: class {},
      } as unknown as ServiceWorkerGlobalScope;
      startServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService,
        mockSelf
      );
      const userWordId = "1";
      await handleNavigate("userWords", userWordId);

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(mockGetLastFocused).toHaveBeenCalledTimes(1);
      expect(mockGetLastFocused).toHaveBeenCalledWith();
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(mockFocusedWindow.id, {
        focused: true,
      });
      expect(mockOpenPopup).toHaveBeenCalledTimes(1);
      expect(mockOpenPopup).toHaveBeenCalledWith({
        windowId: mockUpdateWindow.id,
      });
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith({
        resource: "userWords",
        id: userWordId,
      });
      expect(mockOnInstalledAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnInstalledAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnMessageAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(
        mockSelf,
        expect.any(Function)
      );
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockCreateContextMenuService).not.toHaveBeenCalled();
      expect(mockOnClickedCallback).not.toHaveBeenCalled();
      expect(mockSubscribe).not.toHaveBeenCalled();
      expect(mockCreateSubscription).not.toHaveBeenCalled();
    });

    it("does not do anything if the message sender url is not the extension popup", async () => {
      const mockOnInstalledAddListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "addListener"
      );
      const mockFocusedWindow = {
        id: "2",
      } as unknown as chrome.windows.Window;
      const mockUpdateWindow = {
        id: "3",
      } as unknown as chrome.windows.Window;
      const mockGetLastFocused = vi
        .spyOn(chrome.windows, "getLastFocused")
        .mockResolvedValue(mockFocusedWindow);
      const mockUpdate = vi
        .spyOn(chrome.windows, "update")
        .mockResolvedValue(mockUpdateWindow as never);
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");
      const mockSendMessage = vi.spyOn(chrome.runtime, "sendMessage");
      const mockOnMessageAddListener = vi
        .spyOn(chrome.runtime.onMessage, "addListener")
        .mockImplementation((callback) => {
          callback(
            {},
            {
              id: "okplhmjkgoekmcnjbjjglmnpanfkgdfa",
              origin: "chrome-extension://okplhmjkgoekmcnjbjjglmnpanfkgdfa",
              url: "chrome-extension://okplhmjkgoekmcnjbjjglmnpanfkgdfa/service-worker.js",
            },
            vi.fn()
          );
        });
      const mockGet = vi
        .spyOn(chrome.storage.sync, "get")
        .mockImplementation(async () => {
          return { userId: null };
        });
      const mockSubscribe = vi.fn().mockImplementation(async () => {
        const mockSubscription = {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          getKey: vi.fn().mockImplementation((key) => {
            if (key === "p256dh") {
              return "BIPUL12DLfytvTajnryr2PRdAgXS3HGKiLqndGcJGabyhHheJYlNGCeXl1dn18gSJ1WAkAPIxr4gK0_dQds4yiI";
            } else if (key === "auth") {
              return "FPssNDTKnInHVndSTdbKFw==";
            }
          }),
        } as unknown as PushSubscription;
        return mockSubscription;
      });
      let handleNavigate = vi.fn();
      const mockCreateWebpushService = vi
        .fn()
        .mockImplementation((_self, callback) => {
          handleNavigate = callback;
          return {
            subscribe: mockSubscribe,
          };
        });
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi.fn().mockReturnValue({
        onClickedCallback: mockOnClickedCallback,
      });
      const mockCreateSubscription = vi
        .spyOn(subscriptionService, "createSubscription")
        .mockResolvedValue({
          json: { subscription: { id: "1" } },
          status: 200,
        });
      const mockInfo = {} as unknown as chrome.contextMenus.OnClickData;
      vi.spyOn(chrome.contextMenus.onClicked, "addListener").mockImplementation(
        (callback) => {
          callback(mockInfo);
        }
      );

      const words = ["hello", "welcome"];
      const wordReminderId = "1";
      const mockWaitUntil = vi.fn();
      const mockEvent = {
        data: {
          json: function () {
            return {
              words,
              id: wordReminderId,
            };
          },
        },
        waitUntil: mockWaitUntil,
      } as unknown as PushEvent;
      const mockSelf = {
        registration: {},
        navigator: {
          serviceWorker: {},
        },
        PushManager: class {},
        addEventListener: vi
          .fn()
          .mockImplementationOnce(async (_event, callback) => {
            await callback(mockEvent);
          })
          .mockImplementationOnce(async (_event, callback) => {
            await callback();
          }),
      } as unknown as ServiceWorkerGlobalScope;
      startServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService,
        mockSelf
      );
      const userWordId = "1";
      await handleNavigate("userWords", userWordId);

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(mockGetLastFocused).toHaveBeenCalledTimes(1);
      expect(mockGetLastFocused).toHaveBeenCalledWith();
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(mockFocusedWindow.id, {
        focused: true,
      });
      expect(mockOpenPopup).toHaveBeenCalledTimes(1);
      expect(mockOpenPopup).toHaveBeenCalledWith({
        windowId: mockUpdateWindow.id,
      });
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith({
        resource: "userWords",
        id: userWordId,
      });
      expect(mockOnInstalledAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnInstalledAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnMessageAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(
        mockSelf,
        expect.any(Function)
      );
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockCreateContextMenuService).not.toHaveBeenCalled();
      expect(mockOnClickedCallback).not.toHaveBeenCalled();
      expect(mockSubscribe).not.toHaveBeenCalled();
      expect(mockCreateSubscription).not.toHaveBeenCalled();
    });

    it("does not do anything if push subscription fails", async () => {
      const userId = "1";
      const mockOnInstalledAddListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "addListener"
      );
      const mockFocusedWindow = {
        id: "2",
      } as unknown as chrome.windows.Window;
      const mockUpdateWindow = {
        id: "3",
      } as unknown as chrome.windows.Window;
      const mockGetLastFocused = vi
        .spyOn(chrome.windows, "getLastFocused")
        .mockResolvedValue(mockFocusedWindow);
      const mockUpdate = vi
        .spyOn(chrome.windows, "update")
        .mockResolvedValue(mockUpdateWindow as never);
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");
      const mockSendMessage = vi.spyOn(chrome.runtime, "sendMessage");
      const mockOnMessageAddListener = vi
        .spyOn(chrome.runtime.onMessage, "addListener")
        .mockImplementation((callback) => {
          callback(
            {},
            {
              id: "okplhmjkgoekmcnjbjjglmnpanfkgdfa",
              origin: "chrome-extension://okplhmjkgoekmcnjbjjglmnpanfkgdfa",
              url: "chrome-extension://okplhmjkgoekmcnjbjjglmnpanfkgdfa/index.html?popup=false",
            },
            vi.fn()
          );
        });
      const mockGet = vi
        .spyOn(chrome.storage.sync, "get")
        .mockImplementation(async () => {
          return { userId };
        });
      // trying to subscribe to web push throws error, return null
      const mockSubscribe = vi.fn().mockImplementation(async () => {
        return null;
      });
      let handleNavigate = vi.fn();
      const mockCreateWebpushService = vi
        .fn()
        .mockImplementation((_self, callback) => {
          handleNavigate = callback;
          return {
            subscribe: mockSubscribe,
          };
        });
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi.fn().mockReturnValue({
        onClickedCallback: mockOnClickedCallback,
      });
      const mockCreateSubscription = vi
        .spyOn(subscriptionService, "createSubscription")
        .mockResolvedValue({
          json: { subscription: { id: "1" } },
          status: 200,
        });
      const mockInfo = {} as unknown as chrome.contextMenus.OnClickData;
      vi.spyOn(chrome.contextMenus.onClicked, "addListener").mockImplementation(
        (callback) => {
          callback(mockInfo);
        }
      );

      const words = ["hello", "welcome"];
      const mockWaitUntil = vi.fn();
      const mockEvent = {
        data: {
          text: function () {
            return words;
          },
        },
        waitUntil: mockWaitUntil,
      } as unknown as PushEvent;
      const mockSelf = {
        registration: {},
        navigator: {
          serviceWorker: {},
        },
        PushManager: class {},
        addEventListener: vi
          .fn()
          .mockImplementationOnce(async (_event, callback) => {
            await callback(mockEvent);
          })
          .mockImplementationOnce(async (_event, callback) => {
            await callback();
          }),
      } as unknown as ServiceWorkerGlobalScope;
      startServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService,
        mockSelf
      );
      const userWordId = "1";
      await handleNavigate("userWords", userWordId);

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(mockGetLastFocused).toHaveBeenCalledTimes(1);
      expect(mockGetLastFocused).toHaveBeenCalledWith();
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(mockFocusedWindow.id, {
        focused: true,
      });
      expect(mockOpenPopup).toHaveBeenCalledTimes(1);
      expect(mockOpenPopup).toHaveBeenCalledWith({
        windowId: mockUpdateWindow.id,
      });
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith({
        resource: "userWords",
        id: userWordId,
      });
      expect(mockOnInstalledAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnInstalledAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnMessageAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(["userId"]);
      expect(mockCreateContextMenuService).toHaveBeenCalledTimes(1);
      expect(mockCreateContextMenuService).toHaveBeenCalledWith(
        userId,
        expect.any(Function)
      );
      expect(mockOnClickedCallback).toHaveBeenCalledTimes(1);
      expect(mockOnClickedCallback).toHaveBeenCalledWith(mockInfo);
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(
        mockSelf,
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
      expect(mockSubscribe).toHaveBeenCalledWith();
      expect(mockCreateSubscription).not.toHaveBeenCalled();
    });

    it("calls all functions", async () => {
      const userId = "1";
      const mockOnInstalledAddListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "addListener"
      );
      const mockFocusedWindow = {
        id: "2",
      } as unknown as chrome.windows.Window;
      const mockUpdateWindow = {
        id: "3",
      } as unknown as chrome.windows.Window;
      const mockGetLastFocused = vi
        .spyOn(chrome.windows, "getLastFocused")
        .mockResolvedValue(mockFocusedWindow);
      const mockUpdate = vi
        .spyOn(chrome.windows, "update")
        .mockResolvedValue(mockUpdateWindow as never);
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");
      const mockSendMessage = vi.spyOn(chrome.runtime, "sendMessage");
      const mockOnMessageAddListener = vi
        .spyOn(chrome.runtime.onMessage, "addListener")
        .mockImplementation((callback) => {
          callback(
            {},
            {
              id: "okplhmjkgoekmcnjbjjglmnpanfkgdfa",
              origin: "chrome-extension://okplhmjkgoekmcnjbjjglmnpanfkgdfa",
              url: "chrome-extension://okplhmjkgoekmcnjbjjglmnpanfkgdfa/index.html?popup=true",
            },
            vi.fn()
          );
        });
      const mockGet = vi
        .spyOn(chrome.storage.sync, "get")
        .mockImplementation(async () => {
          return { userId };
        });
      const mockSubscribe = vi.fn().mockImplementation(async () => {
        const mockSubscription = {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          getKey: vi.fn().mockImplementation((key) => {
            if (key === "p256dh") {
              return "BIPUL12DLfytvTajnryr2PRdAgXS3HGKiLqndGcJGabyhHheJYlNGCeXl1dn18gSJ1WAkAPIxr4gK0_dQds4yiI";
            } else if (key === "auth") {
              return "FPssNDTKnInHVndSTdbKFw==";
            }
          }),
        } as unknown as PushSubscription;
        return mockSubscription;
      });
      let handleNavigate = vi.fn();
      const mockCreateWebpushService = vi
        .fn()
        .mockImplementation((_self, callback) => {
          handleNavigate = callback;
          return {
            subscribe: mockSubscribe,
          };
        });
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi.fn().mockReturnValue({
        onClickedCallback: mockOnClickedCallback,
      });
      const mockCreateSubscription = vi
        .spyOn(subscriptionService, "createSubscription")
        .mockResolvedValue({
          json: { subscription: { id: "1" } },
          status: 200,
        });
      const mockInfo = {} as unknown as chrome.contextMenus.OnClickData;
      vi.spyOn(chrome.contextMenus.onClicked, "addListener").mockImplementation(
        (callback) => {
          callback(mockInfo);
        }
      );

      const words = ["hello", "welcome"];
      const mockWaitUntil = vi.fn();
      const mockEvent = {
        data: {
          json: function () {
            return {
              words,
            };
          },
        },
        waitUntil: mockWaitUntil,
      } as unknown as PushEvent;
      const mockSelf = {
        registration: {},
        navigator: {
          serviceWorker: {},
        },
        addEventListener: vi
          .fn()
          .mockImplementationOnce(async (_event, callback) => {
            await callback(mockEvent);
          })
          .mockImplementationOnce(async (_event, callback) => {
            await callback();
          }),
        PushManager: class {},
      } as unknown as ServiceWorkerGlobalScope;
      startServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService,
        mockSelf
      );
      const userWordId = "1";
      await handleNavigate("userWords", userWordId);

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(mockGetLastFocused).toHaveBeenCalledTimes(1);
      expect(mockGetLastFocused).toHaveBeenCalledWith();
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(mockFocusedWindow.id, {
        focused: true,
      });
      expect(mockOpenPopup).toHaveBeenCalledTimes(1);
      expect(mockOpenPopup).toHaveBeenCalledWith({
        windowId: mockUpdateWindow.id,
      });
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith({
        resource: "userWords",
        id: userWordId,
      });
      expect(mockOnInstalledAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnInstalledAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnMessageAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(["userId"]);
      expect(mockCreateContextMenuService).toHaveBeenCalledTimes(1);
      expect(mockCreateContextMenuService).toHaveBeenCalledWith(
        userId,
        expect.any(Function)
      );
      expect(mockOnClickedCallback).toHaveBeenCalledTimes(1);
      expect(mockOnClickedCallback).toHaveBeenCalledWith(mockInfo);
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(
        mockSelf,
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
      expect(mockSubscribe).toHaveBeenCalledWith();
      expect(mockCreateSubscription).toHaveBeenCalledTimes(1);
      expect(mockCreateSubscription).toHaveBeenCalledWith({
        subscription: {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          getKey: expect.any(Function),
        },
        userId,
      });
    });
  });
});
