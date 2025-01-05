import { UserQueries } from "../db/user_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("userQueries", () => {
  const userQueries = new UserQueries();

  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  describe("getById", () => {
    it("returns a correct user by ID", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const user = await userQueries.getById(sampleUser1.id);

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        email: sampleUser1.email,
        confirmed: false,
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

  describe("getByEmail", () => {
    it("returns a correct user by email", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const user = await userQueries.getByEmail(sampleUser1.email);

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        email: sampleUser1.email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns undefined when the user with email does not exist", async () => {
      const user = await userQueries.getByEmail(sampleUser1.email);

      expect(user).toBeUndefined();
    });
  });

  describe("deleteById", () => {
    it("deletes a user", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      await userQueries.deleteById(sampleUser1.id);

      const user = await userQueries.getById(sampleUser1.id);
      expect(user).toBeUndefined();
    });

    it("no error is returned when the user does not exist", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const user = await userQueries.deleteById("2");

      expect(user).toBeUndefined();
    });
  });

  describe("create", () => {
    it("creates a user", async () => {
      const user = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        email: sampleUser1.email,
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
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const updatedUser = await userQueries.updateById(sampleUser1.id, {
        confirmed: true,
      });

      const createdAtTimestamp = new Date(updatedUser!.created_at).getTime();
      const updatedAtTimestamp = new Date(updatedUser!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(updatedUser).toEqual({
        id: 1,
        email: sampleUser1.email,
        confirmed: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("updates the user fields with the 'email' field", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const email = "new@protonmail.com";
      const updatedUser = await userQueries.updateById(sampleUser1.id, {
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
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const updatedUser = await userQueries.updateById(sampleUser1.id, {
        password: "newpassword",
      });

      const createdAtTimestamp = new Date(updatedUser!.created_at).getTime();
      const updatedAtTimestamp = new Date(updatedUser!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(updatedUser).toEqual({
        id: 1,
        email: sampleUser1.email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("get", () => {
    it("returns the user by email and password", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const user = await userQueries.get({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const createdAtTimestamp = new Date(user!.created_at).getTime();
      const updatedAtTimestamp = new Date(user!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(user).toEqual({
        id: 1,
        email: sampleUser1.email,
        confirmed: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });
});
