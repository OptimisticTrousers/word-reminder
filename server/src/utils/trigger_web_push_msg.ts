import { Subscription } from "common";
import webpush from "web-push";

import { subscriptionQueries } from "../db/subscription_queries";

export async function triggerWebPushMsg(
  subscription: Subscription,
  dataToSend?: string | Buffer | null
): Promise<void> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      dataToSend
    );
  } catch (error: any) {
    if (error.statusCode === 410) {
      await subscriptionQueries.deleteById(subscription.id);
    } else {
      console.log("Subscription is no longer valid: ", error);
    }
  }
}
