import { UserQueries } from "../db/userQueries";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("userQueries", () => {
  const userQueries = new UserQueries();

  const sampleUser1 = {
    id: "1",
    username: "username",
    password: "password",
  };

  describe("getById", () => {
    it("returns a correct user by ID", async () => {
      await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });

      const user = await userQueries.getById(sampleUser1.id);

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        username: sampleUser1.username,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns undefined when the user does not exist", async () => {
      const user = await userQueries.getById(sampleUser1.id);

      expect(user).toBeUndefined();
    });
  });

  describe("getByUsername", () => {
    it("returns a correct user by username", async () => {
      await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });

      const user = await userQueries.getByUsername(sampleUser1.username);

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        username: sampleUser1.username,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns undefined when the user with username does not exist", async () => {
      const user = await userQueries.getByUsername(sampleUser1.username);

      expect(user).toBeUndefined();
    });
  });

  describe("deleteById", () => {
    it("deletes a user", async () => {
      await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });

      await userQueries.deleteById(sampleUser1.id);

      const user = await userQueries.getById(sampleUser1.id);
      expect(user).toBeUndefined();
    });

    it("no error is returned when the user does not exist", async () => {
      await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });

      const user = await userQueries.deleteById("2");

      expect(user).toBeUndefined();
    });
  });

  describe("create", () => {
    it("creates a user", async () => {
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        username: sampleUser1.username,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns null when a user creates a user that already exists", async () => {
      const newUser = {
        username: "username",
        password: "password",
      };

      await userQueries.create({
        username: newUser.username,
        password: newUser.password,
      });
      const user = await userQueries.create({
        username: newUser.username,
        password: newUser.password,
      });

      expect(user).toEqual(null);
    });
  });
});
