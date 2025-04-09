import { subscriptionService } from "../src/services/subscription_service/subscription_service";

self.addEventListener("push", function (event) {
  const json = event.data.json();
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
});

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function createContextMenus() {
  function onInstalledCallback() {
    chrome.contextMenus.create({
      title: "Add Word",
      contexts: ["selection"],
      type: "normal",
      enabled: true,
      visible: true,
    });
  }

  function onClickedCallback() {
    alert("hi there, it's me, your friendly neighborhood spiderman");
  }

  chrome.runtime.onInstalled.callback(onInstalledCallback);

  chrome.contextMenus.onClicked.addListener(onClickedCallback);
}

async function subscribe() {
  try {
    const SERVER_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const applicationServerKey = urlB64ToUint8Array(SERVER_PUBLIC_KEY);
    let subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log(`Subscribed: ${JSON.stringify(subscription, 0, 2)}`);

    return subscription;
  } catch (error) {
    console.error("Subscribe error: ", error);
  }
}

async function main() {
  createContextMenus();
  const subscription = await subscribe();
  const result = await chrome.storage.sync.get(["userId"]);
  if (result.userId) {
    const userId = result.userId;
    subscriptionService.createSubscription({ ...subscription, userId });
  }
}

main();
