/// <reference types="chrome" />
/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { subscriptionService } from "../services/subscription_service";
import { userWordService } from "../services/user_word_service";

type CreateWebPushService = (self: ServiceWorkerGlobalScope) => {
  subscribe: () => Promise<PushSubscription>;
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
    const SERVER_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const applicationServerKey = urlB64ToUint8Array(SERVER_PUBLIC_KEY);
    const subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log(`Subscribed: ${JSON.stringify(subscription, null, 2)}`);

    return subscription;
  }

  function handlePush(event: PushEvent) {
    const json = event.data!.json();
    const words = json.words;
    const options = {
      body: words,
      icon: "/favicon/web-app-manifest-192x192.png",
    };

    const promiseChain = self.registration.showNotification(
      `Your active word reminder has these words:`,
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
      await chrome.runtime.sendMessage(response.json.userWord.id);
    } catch (error) {
      console.error("Context menu error: ", error);
    }
  }

  return { onClickedCallback };
};

type CreateServiceWorkerService = (
  createWebPushService: CreateWebPushService,
  createContextMenuService: CreateContextMenuService
) => {
  __init__: (self: ServiceWorkerGlobalScope) => Promise<void>;
};

export const createServiceWorkerService: CreateServiceWorkerService = (
  createWebpushService,
  createContextMenuService
) => {
  async function __init__(self: ServiceWorkerGlobalScope) {
    if (!("serviceWorker" in self.navigator)) {
      // Service Worker isn't supported on this browser, disable or hide UI.
      return;
    }

    const result = await chrome.storage.sync.get(["userId"]);
    const userId = result.userId;

    if (!userId) {
      return;
    }

    const contextMenuService = createContextMenuService(userId);
    chrome.contextMenus.onClicked.addListener(
      contextMenuService.onClickedCallback
    );

    if (!("PushManager" in self)) {
      // Push isn't supported on this browser, disable or hide UI.
      return;
    }

    const webpushService = createWebpushService(self);

    const pushSubscription = await webpushService.subscribe();

    await subscriptionService.createSubscription({
      subscription: {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: String(pushSubscription.getKey("p256dh")),
          auth: String(pushSubscription.getKey("auth")),
        },
      },
      userId,
    });

    self.addEventListener("push", webpushService.handlePush);
  }

  return { __init__ };
};
