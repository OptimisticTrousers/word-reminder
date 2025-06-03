/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Import db setup and teardown functionality
import "../db/test_populatedb";
import { userQueries } from "../db/user_queries";

const userId = 1;
const userParams = {
  email: "bob@protonmail.com",
  password: "password",
};

describe("queries", () => {
  describe("getById", () => {
    it("gets user", async () => {
      await userQueries.create(userParams);
      const user = await userQueries.getById(userId);

      expect(user).toEqual({
        id: userId,
        email: userParams.email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });
  });

  describe("deleteById", () => {
    it("deletes user", async () => {
      await userQueries.create(userParams);
      const deletedUser = await userQueries.deleteById(userId);
      const user = await userQueries.getById(userId);

      expect(deletedUser).toEqual({
        id: userId,
        email: userParams.email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(user).toBeUndefined();
    });
  });
});
