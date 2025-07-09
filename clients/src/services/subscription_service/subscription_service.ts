import { service } from "../service";

export const subscriptionService = (function (service) {
  const { post, VITE_API_DOMAIN } = service;

  function createSubscription({
    userId,
    subscription,
  }: {
    userId: string;
    subscription: PushSubscription;
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/subscriptions`,
      options: {
        body: JSON.stringify(subscription),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    });
  }

  return { createSubscription };
})(service);
