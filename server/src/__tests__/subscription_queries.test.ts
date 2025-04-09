import { subscriptionQueries } from "../db/subscription_queries";
import { userQueries } from "../db/user_queries";
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
const user1 = {
  email: "bob@gmail.com",
  password: "password",
};

describe("subscriptionQueries", () => {
  describe("create", () => {
    it("creates a subscription", async () => {
      const user = await userQueries.create(user1);
      const userId = user!.id;
      const subscription = await subscriptionQueries.create({
        userId,
        subscription: subscription1,
      });

      expect(subscription).toEqual({
        id: subscriptionId1,
        user_id: userId,
        endpoint: subscription1.endpoint,
        p256dh: subscription1.keys.p256dh,
        auth: subscription1.keys.auth,
      });
    });
  });

  describe("deleteByUserId", () => {
    it("deletes by user id", async () => {
      const user = await userQueries.create(user1);
      const userId = user!.id;
      await subscriptionQueries.create({ userId, subscription: subscription1 });

      const deletedSubscription = await subscriptionQueries.deleteByUserId(
        userId
      );

      expect(deletedSubscription).toEqual({
        id: subscriptionId1,
        user_id: userId,
        endpoint: subscription1.endpoint,
        p256dh: subscription1.keys.p256dh,
        auth: subscription1.keys.auth,
      });
    });
  });

  describe("getByUserId", () => {
    it("gets all subscriptions", async () => {
      const user = await userQueries.create(user1);
      const userId = user!.id;
      await subscriptionQueries.create({ userId, subscription: subscription1 });

      const subscription = await subscriptionQueries.getByUserId(userId);

      expect(subscription).toEqual({
        id: subscriptionId1,
        user_id: userId,
        endpoint: subscription1.endpoint,
        p256dh: subscription1.keys.p256dh,
        auth: subscription1.keys.auth,
      });
    });
  });
});
