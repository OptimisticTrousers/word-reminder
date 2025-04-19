/// <reference types="chrome" />
/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { subscriptionService } from "../services/subscription_service";
import { userWordService } from "../services/user_word_service";

type CreateWebPushService = (self: ServiceWorkerGlobalScope) => {
  subscribe: () => Promise<PushSubscription | null>;
  handlePush: (event: PushEvent) => void;
};

export const createWebpushService: CreateWebPushService = (self) => {
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
    const options = {
      body: words,
      icon: "/favicon/web-app-manifest-192x192.png",
    };

    const promiseChain = self.registration.showNotification(
      `Word Reminder Chrome Extension: your active word reminder has these words:`,
      options
    );

    event.waitUntil(promiseChain);
  }

  return { subscribe, handlePush };
};

type CreateContextMenuService = (userId: string) => {
  onClickedCallback: (info: chrome.contextMenus.OnClickData) => Promise<void>;
};

export const createContextMenuService: CreateContextMenuService = (userId) => {
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
      await chrome.action.openPopup();
      await chrome.runtime.sendMessage({
        resource: "userWords",
        id: response.json.userWord.id,
      });
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
  const webpushService = createWebpushService(self);

  self.addEventListener("push", webpushService.handlePush);

  chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onMessage.addListener(async (_message, sender) => {
      if (sender.url && sender.url.startsWith(`${sender.origin}/index.html`)) {
        const result = await chrome.storage.sync.get(["userId"]);
        const userId = result.userId;

        const contextMenuService = createContextMenuService(userId);

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
