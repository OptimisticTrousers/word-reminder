// import { useEffect } from "react";

// import { subscriptionService } from "../../services/subscription_service";

// const { VITE_API_PUBLIC_KEY, VITE_API_DOMAIN } = import.meta.env;



// export function useWebPush() {
//   function subscribeUserToPush() {
//     if (!("PushManager" in window)) {
//       // Push isn't supported on this browser, disable or hide UI.
//       return;
//     }
//     return registerServiceWorker()
//       .then(function (registration) {
//         const subscribeOptions = {
//           userVisibleOnly: true,
//           applicationServerKey: urlBase64ToUint8Array(
//             import.meta.env.VITE_VAPID_PUBLIC_KEY
//           ),
//         };

//         return registration.pushManager.subscribe(subscribeOptions);
//       })
//       .then(function (pushSubscription) {
//         console.log(
//           "Received PushSubscription: ",
//           JSON.stringify(pushSubscription)
//         );
//         return pushSubscription;
//       });
//   }

//   function sendSubscriptionToBackEnd(subscription) {
//     return subscriptionService
//       .createSubscription(subscription)
//       .then(function (responseData) {
//         if (!(responseData.json.data && responseData.json.data.success)) {
//           throw new Error("Bad response from server.");
//         }
//       });
//   }

//   function getNotificationPermissionState() {
//     if (navigator.permissions) {
//       return navigator.permissions
//         .query({ name: "notifications" })
//         .then((result) => {
//           return result.state;
//         });
//     }

//     return new Promise((resolve) => {
//       resolve(Notification.permission);
//     });
//   }

//   if ("actions" in Notification.prototype) {
//     // Action buttons are supported.
//   } else {
//     // Action buttons are NOT supported.
//   }

//   return { askPermission, getNotificationPermissionState };
// }
