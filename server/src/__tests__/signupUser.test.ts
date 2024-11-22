import bcrypt from "bcryptjs";
import express from "express";
import request from "supertest";

import { signup_user } from "../controllers/userController";
import { UserQueries } from "../db/userQueries";
import { variables } from "../utils/variables";

describe("signup_user", () => {
  const app = express();
  app.use(express.json());
  app.post("/api/users", signup_user);

  it("creates user with hashed password and returns message after user signs up", async () => {
    const user = {
      username: "username",
      password: "password",
    };
    const hashSpy = jest.spyOn(bcrypt, "hash");
    const createUserMock = jest
      .spyOn(UserQueries.prototype, "createUser")
      .mockImplementation(async () => {
        return { id: "1", username: user.username, created_at: new Date() };
      });

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(hashSpy).toHaveBeenCalledTimes(1);
    expect(hashSpy).toHaveBeenCalledWith(user.password, Number(variables.SALT));
    expect(createUserMock).toHaveBeenCalledTimes(1);
    expect(createUserMock).toHaveBeenCalledWith(
      user.username,
      expect.any(String)
    );
    expect(response.body.user.username).toBe(user.username);
    expect(response.body.user.created_at).toEqual(expect.any(String));
    expect(response.body.user.password).toBeUndefined();
  });
});
