import { getMessaging } from "firebase-admin/messaging";
import { fcmTokenQueries } from "../db/fcm_token_queries";

// This registration token comes from the client FCM SDKs.
export async function triggerFirebaseMsg({
  userId,
  title,
  body,
}: {
  userId: number;
  title: string;
  body: string;
}) {
  const fcmTokens = await fcmTokenQueries.getByUserId(userId);
  if (fcmTokens.length === 0) {
    return;
  }
  const messaging = getMessaging();

  for (const fcmToken of fcmTokens) {
    const message = {
      notification: {
        title,
        body,
      },
      token: fcmToken.token,
    };

    try {
      // Send a message to the device corresponding to the provided
      // registration token.
      const response = await messaging.send(message);
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    } catch (error: unknown) {
      console.log("Error sending message:", error);
    }
  }
}
