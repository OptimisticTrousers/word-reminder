import { SubscriptionQueries } from "../db/subscription_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("subscriptionQueries", () => {
  const subscriptionQueries = new SubscriptionQueries();

  const subscriptionId1 = 1;

  const subscription1 = {
    endpoint: "https://random-push-service.com/unique-id-1234/",
    keys: {
      p256dh:
        "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
      auth: "tBHItJI5svbpez7KI4CCXg==",
    },
  };

  describe("create", () => {
    it("creates a subscription", async () => {
      const subscription = await subscriptionQueries.create(subscription1);

      expect(subscription).toEqual({
        id: subscriptionId1,
        endpoint: subscription1.endpoint,
        p256dh: subscription1.keys.p256dh,
        auth: subscription1.keys.auth,
      });
    });
  });

  describe("deleteById", () => {
    it("deletes a subscription", async () => {
      const subscription = await subscriptionQueries.create(subscription1);

      await subscriptionQueries.deleteById(subscription.id);

      const subscriptions = await subscriptionQueries.get();
      expect(subscriptions).toEqual([]);
    });

    it("no error is returned when the subscription does not exist", async () => {
      await subscriptionQueries.deleteById(subscriptionId1);

      const subscriptions = await subscriptionQueries.get();
      expect(subscriptions).toEqual([]);
    });
  });

  describe("get", () => {
    it("gets all subscriptions", async () => {
      await subscriptionQueries.create(subscription1);

      const subscriptions = await subscriptionQueries.get();

      expect(subscriptions).toEqual([
        {
          id: subscriptionId1,
          endpoint: subscription1.endpoint,
          p256dh: subscription1.keys.p256dh,
          auth: subscription1.keys.auth,
        },
      ]);
    });

    it("returns empty array when there are no subscriptions", async () => {
      const subscriptions = await subscriptionQueries.get();

      expect(subscriptions).toEqual([]);
    });
  });
});
