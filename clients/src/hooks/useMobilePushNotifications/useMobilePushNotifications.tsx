import {
  PushNotifications,
  Token,
  ActionPerformed,
  RegistrationError,
} from "@capacitor/push-notifications";
import { useContext, useEffect } from "react";
import { NotificationContext } from "../../context/Notification";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { fcmTokenService } from "../../services/fcm_token_service";
import { Capacitor } from "@capacitor/core";

const addListeners = async (
  navigate: NavigateFunction,
  showNotification: (type: string, message: string) => void,
  userId: string
) => {
  // On success, we should be able to receive notifications
  await PushNotifications.addListener("registration", (token: Token) => {
    fcmTokenService.createFCMToken({ token, userId });
  });

  // Some issue with our setup and push will not work
  await PushNotifications.addListener(
    "registrationError",
    (error: RegistrationError) => {
      showNotification("error", error.error);
    }
  );

  // Method called when tapping on a notification
  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification: ActionPerformed) => {
      const wordReminderId = notification.notification.data.wordReminderId;
      navigate(`/wordReminders/${wordReminderId}`);
    }
  );
};

export function useMobilePushNotificationRegistration(userId: string) {
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  async function register() {
    if (Capacitor.getPlatform() === "web") {
      return;
    }
    // Register with Apple / Google to receive push via APNS/FCM
    const status = await PushNotifications.checkPermissions();

    if (status.receive !== "granted") {
      const requestStatus = await PushNotifications.requestPermissions();
      if (requestStatus.receive === "denied") {
        showNotification("error", "Push Notification permission denied.");
      } else {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        await addListeners(navigate, showNotification, userId);
      }
    }
  }

  return { register };
}

export function useMobilePushNotificationListeners(userId: string) {
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (Capacitor.getPlatform() === "web") {
        return;
      }
      const status = await PushNotifications.checkPermissions();
      if (status.receive === "granted") {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        await addListeners(navigate, showNotification, userId);
      }
    })();

    return () => {
      if (Capacitor.getPlatform() === "web") {
        return;
      }
      PushNotifications.removeAllListeners();
    };
  }, [navigate, showNotification, userId]);
}
