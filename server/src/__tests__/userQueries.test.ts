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

  describe("Get queries", () => {
    describe("getUserById", () => {
      it("returns a correct user by id", async () => {
        await userQueries.createUser(
          sampleUser1.username,
          sampleUser1.password
        );
        const user = await userQueries.getUserById(sampleUser1.id);

        expect(user.username).toBe(sampleUser1.username);
        expect(user.password).toBeUndefined();
        expect(new Date(user.created_at).getTime()).toBeLessThanOrEqual(
          Date.now()
        );
      });

      it("returns undefined when the user with id does not exist", async () => {
        const user = await userQueries.getUserById(sampleUser1.id);

        expect(user).toBeUndefined();
      });
    });

    describe("getUserByUsername", () => {
      it("returns a correct user by username", async () => {
        await userQueries.createUser(
          sampleUser1.username,
          sampleUser1.password
        );
        const user = await userQueries.getUserByUsername(sampleUser1.username);

        expect(user.username).toBe(sampleUser1.username);
        expect(user.password).toBeUndefined();
        expect(new Date(user.created_at).getTime()).toBeLessThanOrEqual(
          Date.now()
        );
      });

      it("returns undefined when the user with username does not exist", async () => {
        const user = await userQueries.getUserByUsername(sampleUser1.username);

        expect(user).toBeUndefined();
      });
    });
  });

  describe("deleteUserById", () => {
    it("deletes a user", async () => {
      await userQueries.createUser(sampleUser1.username, sampleUser1.password);

      await userQueries.deleteUserById(sampleUser1.id);
      const userExists = await userQueries.userExistsById(sampleUser1.id);
      expect(userExists).toBe(false);
    });

    it("no error is returned when the user does not exist", async () => {
      expect(async () => {
        await userQueries.deleteUserById(sampleUser1.id);
      }).not.toThrow();
      const userExists = await userQueries.userExistsById(sampleUser1.id);
      expect(userExists).toBe(false);
    });
  });

  describe("userExistsByUsername", () => {
    it("returns true when user exists", async () => {
      const newUser = {
        username: "newUsername",
        password: "password",
      };

      await userQueries.createUser(newUser.username, newUser.password);

      const userExists = await userQueries.userExistsByUsername(
        newUser.username
      );
      expect(userExists).toBe(true);
    });

    it("returns false when user does not exist", async () => {
      const newUser = {
        username: "newUsername",
        password: "password",
      };

      const userExists = await userQueries.userExistsByUsername(
        newUser.username
      );
      expect(userExists).toBe(false);
    });
  });

  describe("userExistsById", () => {
    it("returns true when user exists", async () => {
      const newUser = {
        username: "newUsername",
        password: "password",
      };

      const user = await userQueries.createUser(
        newUser.username,
        newUser.password
      );

      const userExists = await userQueries.userExistsById(user!.id);
      expect(userExists).toBe(true);
    });

    it("returns false when user does not exist", async () => {
      const userExists = await userQueries.userExistsById("1");
      expect(userExists).toBe(false);
    });
  });

  describe("createUser", () => {
    it("creates a user", async () => {
      const newUser = {
        username: "newUsername",
        password: "password",
      };

      const user = await userQueries.createUser(
        newUser.username,
        newUser.password
      );

      expect(user!.username).toBe(newUser.username);
      expect(user!.password).toBeUndefined();
      expect(new Date(user!.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it("returns null when a user creates a user that already exists", async () => {
      const newUser = {
        username: "username",
        password: "password",
      };

      await userQueries.createUser(newUser.username, newUser.password);
      const user = await userQueries.createUser(
        newUser.username,
        newUser.password
      );

      expect(user).toEqual(null);
    });
  });
});
