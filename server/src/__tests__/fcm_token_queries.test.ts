import { fcmTokenQueries } from "../db/fcm_token_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";
import { userQueries } from "../db/user_queries";

describe("fcmTokenQueries", () => {
  const token1 = "token1";
  const token2 = "token2";
  const userId = 1;

  const userParams = {
    email: "email@protonmail.com",
    password: "password",
  };

  describe("create", () => {
    it("creates an fcm token and saves it in the database", async () => {
      await userQueries.create(userParams);

      const fcmToken = await fcmTokenQueries.create({ token: token1, userId });

      expect(fcmToken).toEqual({
        token: token1,
        user_id: userId,
      });
    });
  });

  describe("getByUserId", () => {
    it("returns the fcm token related to a user", async () => {
      await userQueries.create(userParams);
      await fcmTokenQueries.create({ token: token1, userId });
      await fcmTokenQueries.create({ token: token2, userId });

      const fcmTokens = await fcmTokenQueries.getByUserId(userId);

      expect(fcmTokens).toEqual([
        {
          token: token1,
          user_id: userId,
        },
        {
          token: token2,
          user_id: userId,
        },
      ]);
    });
  });

  it("returns empty array when the user has no fcm token", async () => {
    const fcmToken = await fcmTokenQueries.getByUserId(userId);

    expect(fcmToken).toEqual([]);
  });
});
