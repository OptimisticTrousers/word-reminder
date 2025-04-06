import { service } from "../service";

export const subscriptionService = (function (service) {
  const { post, VITE_API_DOMAIN } = service;

  function createSubscription({
    userId,
    subscription,
  }: {
    userId: string;
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    };
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/subscriptions`,
      options: {
        body: JSON.stringify(subscription),
        credentials: "include",
      },
    });
  }

  return { createSubscription };
})(service);
