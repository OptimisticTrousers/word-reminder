/// <reference types="chrome" />
/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { subscriptionService } from "../services/subscription_service";
import { userWordService } from "../services/user_word_service";

type HandleNavigate = (resource: string, id: string) => Promise<void>;

type CreateWebPushService = (
  self: ServiceWorkerGlobalScope,
  handleNavigate: HandleNavigate
) => {
  subscribe: () => Promise<PushSubscription | null>;
  handlePush: (event: PushEvent) => void;
  handlePushSubscriptionChange: () => Promise<void>;
};

export const createWebpushService: CreateWebPushService = (
  self,
  handleNavigate
) => {
  function urlB64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function subscribe() {
    try {
      const SERVER_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      const applicationServerKey = urlB64ToUint8Array(SERVER_PUBLIC_KEY);
      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log(`Subscribed: ${JSON.stringify(subscription, null, 2)}`);

      return subscription;
    } catch (error) {
      console.error(`Subscribe error: `, error);
      return null;
    }
  }

  function handlePush(event: PushEvent) {
    if (!event.data) {
      return;
    }

    const json = event.data.json();
    const words = json.words;
    const wordReminderId = json.id;
    const options: NotificationOptions & {
      actions?: {
        action: string;
        title: string;
        icon: string;
      }[];
    } = {
      body: words,
      icon: "/favicon/web-app-manifest-192x192.png",
    };

    if ("actions" in Notification.prototype) {
      // Action buttons are supported.
      options.actions = [
        {
          action: "navigate-to-word-reminder",
          title: "Navigate to Word Reminder",
          icon: "/images/navigation.png",
        },
      ];
    }

    self.addEventListener("notificationclick", async (event) => {
      const clickedNotification = event.notification;

      if (!event.action) {
        // Was a normal notification click
        return;
      }

      try {
        await handleNavigate("wordReminders", wordReminderId);
      } catch (error) {
        console.error("Notification click error: ", error);
      }
      clickedNotification.close();
    });

    const promiseChain = self.registration.showNotification(
      `Word Reminder Chrome Extension: your active word reminder has these words:`,
      options
    );

    event.waitUntil(promiseChain);
  }

  async function handlePushSubscriptionChange() {
    const subscription = await subscribe();

    if (!subscription) {
      return;
    }

    const result = await chrome.storage.sync.get(["userId"]);
    const userId = result.userId;

    if (userId) {
      await subscriptionService.createSubscription({
        subscription,
        userId,
      });
    }
  }

  return { subscribe, handlePush, handlePushSubscriptionChange };
};

type CreateContextMenuService = (
  userId: string,
  handleNavigate: HandleNavigate
) => {
  onClickedCallback: (info: chrome.contextMenus.OnClickData) => Promise<void>;
};

export const createContextMenuService: CreateContextMenuService = (
  userId,
  handleNavigate
) => {
  chrome.contextMenus.create({
    id: "84",
    title: "Add Word",
    contexts: ["selection"],
    type: "normal",
    enabled: true,
    visible: true,
  });

  async function onClickedCallback(info: chrome.contextMenus.OnClickData) {
    const selectionText = info.selectionText;
    if (!selectionText) {
      return;
    }
    const formData = new FormData();
    formData.append("word", selectionText);
    try {
      const response = await userWordService.createUserWord({
        userId,
        formData,
      });
      await handleNavigate("userWords", response.json.userWord.id);
    } catch (error) {
      console.error("Context menu error: ", error);
    }
  }

  return { onClickedCallback };
};

type CreateServiceWorkerService = (
  createWebPushService: CreateWebPushService,
  createContextMenuService: CreateContextMenuService,
  self: ServiceWorkerGlobalScope
) => void;

export const startServiceWorkerService: CreateServiceWorkerService = (
  createWebpushService,
  createContextMenuService,
  self
) => {
  async function handleNavigate(resource: string, id: string) {
    await chrome.action.openPopup();
    await chrome.runtime.sendMessage({
      resource,
      id,
    });
  }

  const webpushService = createWebpushService(self, handleNavigate);

  self.addEventListener("push", webpushService.handlePush);
  self.addEventListener(
    "pushsubscriptionchange",
    webpushService.handlePushSubscriptionChange
  );

  chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onMessage.addListener(async (_message, sender) => {
      if (sender.url && sender.url.startsWith(`${sender.origin}/index.html`)) {
        const result = await chrome.storage.sync.get(["userId"]);
        const userId = result.userId;

        const contextMenuService = createContextMenuService(
          userId,
          handleNavigate
        );

        chrome.contextMenus.onClicked.addListener(
          contextMenuService.onClickedCallback
        );

        const subscription = await webpushService.subscribe();

        if (!subscription) {
          return;
        }

        await subscriptionService.createSubscription({
          subscription,
          userId,
        });
      }
    });
  });
};
