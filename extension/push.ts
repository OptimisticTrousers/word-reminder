if (!("serviceWorker" in navigator)) {
  // Service Worker isn't supported on this browser, disable or hide UI.
  return;
}

if (!("PushManager" in window)) {
  // Push isn't supported on this browser, disable or hide UI.
  return;
}

function registerServiceWorker() {
  return navigator.serviceWorker
    .register("service-worker.ts")
    .then(function (registration) {
      console.log("Service worker successfully registered.");
      return registration;
    })
    .catch(function (err) {
      console.error("Unable to register service worker.", err);
    });
}

function askPermission() {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then(function (permissionResult) {
    if (permissionResult !== "granted") {
      throw new Error("We weren't granted permission.");
    }
  });
}

function subscribeUserToPush() {
  return getSWRegistration()
    .then(function (registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
        ),
      };

      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(function (pushSubscription) {
      console.log(
        "Received PushSubscription: ",
        JSON.stringify(pushSubscription)
      );
      return pushSubscription;
    });
}

// save subscription to the database by sending a server req

// use slack's method of having a custom ui that asks the user for
// notification permissions

// use slack's method of sending a 'Nice, notifications are enabled!.'

// Use Google's settings panel to enable and disable push messaging.
// checking on checkbox displays permission prompt.
// can disable and enable notis at any time.

//slack custom notification preferences like sounds and when to show notis.

// notification toggle switch option

// want to allow the user to disable and know how to disable notis

// retrive subscription from the database
// use web-push to trigger push messages to the user
// use a triggerpushmsg from the server using 'webpush.sendNotification()