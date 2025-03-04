import { subscriptionQueries } from "../db/subscription_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

const subscriptionId1 = 1;

const subscription1 = {
  endpoint: "https://random-push-service.com/unique-id-1234/",
  keys: {
    p256dh:
      "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
    auth: "tBHItJI5svbpez7KI4CCXg==",
  },
};
describe("subscriptionQueries", () => {
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
  });
});
