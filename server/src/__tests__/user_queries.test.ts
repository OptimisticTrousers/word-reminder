import { userQueries } from "../db/user_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

const userId = 1;
const userParams = {
  email: "email@protonmail.com",
  password: "password",
};

describe("userQueries", () => {
  describe("getByEmail", () => {
    it("returns a correct user by email", async () => {
      await userQueries.create(userParams);

      const user = await userQueries.getByEmail(userParams.email);

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        email: userParams.email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns undefined when the user with email does not exist", async () => {
      const user = await userQueries.getByEmail(userParams.email);

      expect(user).toBeUndefined();
    });
  });

  describe("create", () => {
    it("creates a user", async () => {
      const user = await userQueries.create(userParams);

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        email: userParams.email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns null when a user creates a user that already exists", async () => {
      const newUser = {
        email: "email@protonmail.com",
        password: "password",
      };

      await userQueries.create({
        email: newUser.email,
        password: newUser.password,
      });
      const user = await userQueries.create({
        email: newUser.email,
        password: newUser.password,
      });

      expect(user).toEqual(null);
    });
  });

  describe("updateById", () => {
    it("updates the user fields with the 'confirmed' field", async () => {
      await userQueries.create(userParams);

      const updatedUser = await userQueries.updateById(userId, {
        confirmed: true,
      });

      const createdAtTimestamp = new Date(updatedUser!.created_at).getTime();
      const updatedAtTimestamp = new Date(updatedUser!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(updatedUser).toEqual({
        id: 1,
        email: userParams.email,
        confirmed: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("updates the user fields with the 'email' field", async () => {
      await userQueries.create(userParams);

      const email = "new@protonmail.com";
      const updatedUser = await userQueries.updateById(userId, {
        email,
      });

      const createdAtTimestamp = new Date(updatedUser!.created_at).getTime();
      const updatedAtTimestamp = new Date(updatedUser!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(updatedUser).toEqual({
        id: 1,
        email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("updates the user fields with the 'password' field", async () => {
      await userQueries.create(userParams);

      const updatedUser = await userQueries.updateById(userId, {
        password: "newpassword",
      });

      const createdAtTimestamp = new Date(updatedUser!.created_at).getTime();
      const updatedAtTimestamp = new Date(updatedUser!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(updatedUser).toEqual({
        id: 1,
        email: userParams.email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("getByIdWithPassword", () => {
    it("returns the user with password by id", async () => {
      await userQueries.create(userParams);

      const user = await userQueries.getByIdWithPassword(userId);

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        email: userParams.email,
        password: userParams.password,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });
});
