import { SubscriptionParams } from "common";

import { service } from "../service";

export const subscriptionService = (function (service) {
  const { post, VITE_API_DOMAIN } = service;

  function createSubscription(subscription: SubscriptionParams) {
    return post({
      url: `${VITE_API_DOMAIN}/subscriptions`,
      options: {
        body: JSON.stringify(subscription),
        credentials: "include",
      },
    });
  }

  return { createSubscription };
})(service);
