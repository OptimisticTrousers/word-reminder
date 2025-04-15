/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vitest/globals" />
import { subscriptionService } from "../services/subscription_service";
import { userWordService } from "../services/user_word_service";
import * as helpers from "./helpers";

const {
  createContextMenuService,
  createServiceWorkerService,
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
        const mockWaitUntil = vi.fn();
        const event = {
          data: {
            json: function () {
              return {
                words,
              };
            },
          },
          waitUntil: mockWaitUntil,
        } as unknown as PushEvent;
        webpushService.handlePush(event);

        expect(mockShowNotification).toHaveBeenCalledTimes(1);
        expect(mockShowNotification).toHaveBeenCalledWith(
          `Your active word reminder has these words:`,
          {
            body: words,
            icon: "/favicon/web-app-manifest-192x192.png",
          }
        );
        expect(mockWaitUntil).toHaveBeenCalledTimes(1);
        expect(mockWaitUntil).toHaveBeenCalledWith(promise);
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
      expect(mockSendMessage).toHaveBeenCalledWith(userWordId);
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
    it("does not do anything if service workers are not supported in the browser", async () => {
      const userId = "1";
      const mockGet = vi
        .spyOn(chrome.storage.sync, "get")
        .mockImplementation(async () => {
          return { userId };
        });
      const mockSubscribe = vi.fn().mockImplementation(() => {
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
      const mockCreateWebpushService = vi
        .spyOn(helpers, "createWebpushService")
        .mockReturnValue({
          subscribe: mockSubscribe,
          handlePush: mockHandlePush,
        }) as any;
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi
        .spyOn(helpers, "createContextMenuService")
        .mockReturnValue({
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
        // 'serviceWorker' property not defined on navigator for test
        navigator: {},
        addEventListener: vi.fn().mockImplementation((_event, callback) => {
          callback(mockEvent);
        }),
        PushManager: class {},
      } as unknown as ServiceWorkerGlobalScope;
      const serviceWorkerService = createServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService
      );
      await serviceWorkerService.__init__(mockSelf);

      expect(mockGet).not.toHaveBeenCalled();
      expect(mockCreateWebpushService).not.toHaveBeenCalled();
      expect(mockSubscribe).not.toHaveBeenCalled();
      expect(mockCreateContextMenuService).not.toHaveBeenCalled();
      expect(mockOnClickedCallback).not.toHaveBeenCalled();
      expect(mockCreateSubscription).not.toHaveBeenCalled();
      expect(mockHandlePush).not.toHaveBeenCalled();
    });

    it("only sets up context menu if web push is not supported in the browser", async () => {
      const userId = "1";
      const mockGet = vi
        .spyOn(chrome.storage.sync, "get")
        .mockImplementation(async () => {
          return { userId };
        });
      const mockSubscribe = vi.fn().mockImplementation(() => {
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
      const mockCreateWebpushService = vi
        .spyOn(helpers, "createWebpushService")
        .mockReturnValue({
          subscribe: mockSubscribe,
          handlePush: mockHandlePush,
        }) as any;
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi
        .spyOn(helpers, "createContextMenuService")
        .mockReturnValue({
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
          // 'PushManager' property not defined on window for test
        },
        addEventListener: vi.fn().mockImplementation((_event, callback) => {
          callback(mockEvent);
        }),
      } as unknown as ServiceWorkerGlobalScope;
      const serviceWorkerService = createServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService
      );
      await serviceWorkerService.__init__(mockSelf);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(["userId"]);
      expect(mockCreateContextMenuService).toHaveBeenCalledTimes(1);
      expect(mockCreateContextMenuService).toHaveBeenCalledWith(userId);
      expect(mockOnClickedCallback).toHaveBeenCalledTimes(1);
      expect(mockOnClickedCallback).toHaveBeenCalledWith(mockInfo);
      expect(mockCreateWebpushService).not.toHaveBeenCalled();
      expect(mockSubscribe).not.toHaveBeenCalled();
      expect(mockCreateSubscription).not.toHaveBeenCalled();
      expect(mockHandlePush).not.toHaveBeenCalled();
    });

    it("does not do anything if the chrome storage sync does not have a 'userId' ", async () => {
      // no 'userId' key in Chrome Storage Sync for test
      const mockGet = vi
        .spyOn(chrome.storage.sync, "get")
        .mockImplementation(async () => {
          return { userId: null };
        });
      const mockSubscribe = vi.fn().mockImplementation(() => {
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
      const mockCreateWebpushService = vi
        .spyOn(helpers, "createWebpushService")
        .mockReturnValue({
          subscribe: mockSubscribe,
          handlePush: mockHandlePush,
        }) as any;
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi
        .spyOn(helpers, "createContextMenuService")
        .mockReturnValue({
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
      const serviceWorkerService = createServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService
      );
      await serviceWorkerService.__init__(mockSelf);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(["userId"]);
      expect(mockCreateWebpushService).not.toHaveBeenCalled();
      expect(mockSubscribe).not.toHaveBeenCalled();
      expect(mockCreateContextMenuService).not.toHaveBeenCalled();
      expect(mockOnClickedCallback).not.toHaveBeenCalled();
      expect(mockCreateSubscription).not.toHaveBeenCalled();
      expect(mockHandlePush).not.toHaveBeenCalled();
    });

    it("calls all functions", async () => {
      const userId = "1";
      const mockGet = vi
        .spyOn(chrome.storage.sync, "get")
        .mockImplementation(async () => {
          return { userId };
        });
      const mockSubscribe = vi.fn().mockImplementation(() => {
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
      const mockCreateWebpushService = vi
        .spyOn(helpers, "createWebpushService")
        .mockReturnValue({
          subscribe: mockSubscribe,
          handlePush: mockHandlePush,
        }) as any;
      const mockOnClickedCallback = vi.fn();
      const mockCreateContextMenuService = vi
        .spyOn(helpers, "createContextMenuService")
        .mockReturnValue({
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
      const serviceWorkerService = createServiceWorkerService(
        mockCreateWebpushService,
        mockCreateContextMenuService
      );
      await serviceWorkerService.__init__(mockSelf);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(["userId"]);
      expect(mockCreateWebpushService).toHaveBeenCalledTimes(1);
      expect(mockCreateWebpushService).toHaveBeenCalledWith(mockSelf);
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
      expect(mockSubscribe).toHaveBeenCalledWith();
      expect(mockCreateContextMenuService).toHaveBeenCalledTimes(1);
      expect(mockCreateContextMenuService).toHaveBeenCalledWith(userId);
      expect(mockOnClickedCallback).toHaveBeenCalledTimes(1);
      expect(mockOnClickedCallback).toHaveBeenCalledWith(mockInfo);
      expect(mockCreateSubscription).toHaveBeenCalledTimes(1);
      expect(mockCreateSubscription).toHaveBeenCalledWith({
        subscription: {
          endpoint: "https://random-push-service.com/unique-id-1234/",
          keys: {
            p256dh:
              "BIPUL12DLfytvTajnryr2PRdAgXS3HGKiLqndGcJGabyhHheJYlNGCeXl1dn18gSJ1WAkAPIxr4gK0_dQds4yiI",
            auth: "FPssNDTKnInHVndSTdbKFw==",
          },
        },
        userId,
      });
      expect(mockHandlePush).toHaveBeenCalledTimes(1);
      expect(mockHandlePush).toHaveBeenCalledWith(mockEvent);
    });
  });
});
