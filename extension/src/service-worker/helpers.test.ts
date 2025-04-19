/* eslint-disable @typescript-eslint/no-explicit-any */
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
        } as unknown as ServiceWorkerGlobalScope;

        const webpushService = createWebpushService(mockSelf);
        const subscription = await webpushService.subscribe();

        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith({
          userVisibleOnly: true,
          applicationServerKey: expect.any(Uint8Array),
        });
        expect(subscription).toEqual(mockSubscription);
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
        } as unknown as ServiceWorkerGlobalScope;

        const webpushService = createWebpushService(mockSelf);
        const subscription = await webpushService.subscribe();

        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith({
          userVisibleOnly: true,
          applicationServerKey: expect.any(Uint8Array),
        });
        expect(subscription).toEqual(null);
      });
    });

    describe("Push Events", () => {
      it("handles responding to the 'push' event", async () => {
        const promise = Promise.resolve();
        const mockShowNotification = vi.fn().mockReturnValue(promise);
        const mockSelf = {
          registration: {
            showNotification: mockShowNotification,
          },
          navigator: {
            serviceWorker: {},
          },
        } as unknown as ServiceWorkerGlobalScope;

        const webpushService = createWebpushService(mockSelf);
        const words = ["hello", "welcome"];
        const mockWaitUntil = vi
          .fn()
          .mockImplementation(async (promiseChain) => {
            const promise1 = await promiseChain;
            const promise2 = await promise1;
            await promise2;
          });
        const wordReminderId = "1";
        const event = {
          data: {
            json: function () {
              return { words, wordReminderId };
            },
          },
          waitUntil: mockWaitUntil,
        } as unknown as PushEvent;
        webpushService.handlePush(event);

        expect(mockShowNotification).toHaveBeenCalledTimes(1);
        expect(mockShowNotification).toHaveBeenCalledWith(
          `Word Reminder Chrome Extension: your active word reminder has these words:`,
          {
            body: words,
            icon: "/favicon/web-app-manifest-192x192.png",
          }
        );
        expect(mockWaitUntil).toHaveBeenCalledTimes(1);
        expect(mockWaitUntil).toHaveBeenCalledWith(promise);
      });

      it("does not handle responding to the 'push' event when there is no payload", async () => {
        const promise = Promise.resolve();
        const mockShowNotification = vi.fn().mockReturnValue(promise);
        const mockSelf = {
          registration: {
            showNotification: mockShowNotification,
          },
          navigator: {
            serviceWorker: {},
          },
        } as unknown as ServiceWorkerGlobalScope;

        const webpushService = createWebpushService(mockSelf);
        const mockWaitUntil = vi.fn();
        const event = {
          data: null,
          waitUntil: mockWaitUntil,
        } as unknown as PushEvent;
        webpushService.handlePush(event);

        expect(mockShowNotification).not.toHaveBeenCalled();
        expect(mockWaitUntil).not.toHaveBeenCalled();
      });
    });
  });

  describe("Context Menus", () => {
    it("creates a context menu item", async () => {
      const mockCreate = vi.spyOn(chrome.contextMenus, "create");

      const userId = "1";
      createContextMenuService(userId);

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
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");
      const mockSendMessage = vi.spyOn(chrome.runtime, "sendMessage");
      const userWordId = "10";
      const mockCreateUserWord = vi
        .spyOn(userWordService, "createUserWord")
        .mockResolvedValue({
          json: { userWord: { id: userWordId } },
          status: 200,
        });

      const userId = "1";
      const contextMenuService = createContextMenuService(userId);
      const selectionText = "word";
      const info = {
        selectionText,
      } as unknown as chrome.contextMenus.OnClickData;
      const formData = new FormData();
      formData.append("word", selectionText);
      await contextMenuService.onClickedCallback(info);

      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({ userId, formData });
      expect(mockOpenPopup).toHaveBeenCalledTimes(1);
      expect(mockOpenPopup).toHaveBeenCalledWith();
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith({
        resource: "userWords",
        id: userWordId,
      });
    });

    it("does not create user word, opens popup, and sends message when select text is empty", async () => {
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");
      const mockSendMessage = vi.spyOn(chrome.runtime, "sendMessage");
      const userWordId = "10";
      const mockCreateUserWord = vi
        .spyOn(userWordService, "createUserWord")
        .mockResolvedValue({
          json: { userWord: { id: userWordId } },
          status: 200,
        });

      const userId = "1";
      const contextMenuService = createContextMenuService(userId);
      const selectionText = "";
      const info = {
        selectionText,
      } as unknown as chrome.contextMenus.OnClickData;
      const formData = new FormData();
      formData.append("word", selectionText);
      await contextMenuService.onClickedCallback(info);

      expect(mockCreateUserWord).not.toHaveBeenCalled();
      expect(mockOpenPopup).not.toHaveBeenCalled();
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe("Service Worker Init", () => {
    it("sets up the 'onMessage' listener when the 'onInstalled' event fires", async () => {
      const userId = "1";
      const mockOnInstalledAddListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "addListener"
      );
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
      const mockHandlePush = vi.fn();
      const mockCreateWebpushService = vi.fn().mockReturnValue({
        subscribe: mockSubscribe,
        handlePush: mockHandlePush,
      }) as any;
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi.fn().mockReturnValue({
        onClickedCallback: mockOnClickedCallback,
      }) as any;
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
        addEventListener: vi.fn().mockImplementation((_event, callback) => {
          callback(mockEvent);
        }),
        PushManager: class {},
      } as unknown as ServiceWorkerGlobalScope;
      startServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService,
        mockSelf
      );

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(mockOnInstalledAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnInstalledAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnMessageAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockHandlePush).toHaveBeenCalledTimes(1);
      expect(mockHandlePush).toHaveBeenCalledWith(mockEvent);
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(mockSelf);
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
      const mockHandlePush = vi.fn();
      const mockCreateWebpushService = vi.fn().mockReturnValue({
        subscribe: mockSubscribe,
        handlePush: mockHandlePush,
      }) as any;
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi.fn().mockReturnValue({
        onClickedCallback: mockOnClickedCallback,
      }) as any;
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
        PushManager: class {},
        addEventListener: vi.fn().mockImplementation((_event, callback) => {
          callback(mockEvent);
        }),
      } as unknown as ServiceWorkerGlobalScope;
      startServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService,
        mockSelf
      );

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(mockOnInstalledAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnInstalledAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnMessageAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockHandlePush).toHaveBeenCalledTimes(1);
      expect(mockHandlePush).toHaveBeenCalledWith(mockEvent);
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(mockSelf);
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
      const mockHandlePush = vi.fn();
      const mockCreateWebpushService = vi.fn().mockReturnValue({
        subscribe: mockSubscribe,
        handlePush: mockHandlePush,
      }) as any;
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi.fn().mockReturnValue({
        onClickedCallback: mockOnClickedCallback,
      }) as any;
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
        addEventListener: vi.fn().mockImplementation((_event, callback) => {
          callback(mockEvent);
        }),
      } as unknown as ServiceWorkerGlobalScope;
      startServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService,
        mockSelf
      );

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(mockOnInstalledAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnInstalledAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
      expect(mockOnMessageAddListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockHandlePush).toHaveBeenCalledTimes(1);
      expect(mockHandlePush).toHaveBeenCalledWith(mockEvent);
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(["userId"]);
      expect(mockCreateContextMenuService).toHaveBeenCalledTimes(1);
      expect(mockCreateContextMenuService).toHaveBeenCalledWith(userId);
      expect(mockOnClickedCallback).toHaveBeenCalledTimes(1);
      expect(mockOnClickedCallback).toHaveBeenCalledWith(mockInfo);
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(mockSelf);
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
      const mockHandlePush = vi.fn();
      const mockCreateWebpushService = vi.fn().mockReturnValue({
        subscribe: mockSubscribe,
        handlePush: mockHandlePush,
      }) as any;
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi.fn().mockReturnValue({
        onClickedCallback: mockOnClickedCallback,
      }) as any;
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
        addEventListener: vi.fn().mockImplementation((_event, callback) => {
          callback(mockEvent);
        }),
        PushManager: class {},
      } as unknown as ServiceWorkerGlobalScope;
      startServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService,
        mockSelf
      );

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
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
      expect(mockCreateContextMenuService).toHaveBeenCalledWith(userId);
      expect(mockOnClickedCallback).toHaveBeenCalledTimes(1);
      expect(mockOnClickedCallback).toHaveBeenCalledWith(mockInfo);
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(mockSelf);
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
      expect(mockHandlePush).toHaveBeenCalledTimes(1);
      expect(mockHandlePush).toHaveBeenCalledWith(mockEvent);
    });
  });
});
