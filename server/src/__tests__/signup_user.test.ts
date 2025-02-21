import bcrypt from "bcryptjs";
import express from "express";
import request from "supertest";

import { signup_user } from "../controllers/user_controller";
import { userQueries } from "../db/user_queries";
import { variables } from "../config/variables";
import { emailExists } from "../utils/email_exists";

const { SALT } = variables;

jest.mock("../utils/email_exists", () => ({
  emailExists: jest.fn().mockImplementation(async () => {
    return undefined;
  }),
}));

describe("signup_user", () => {
  const app = express();
  app.use(express.json());
  app.post("/api/users", signup_user);

  it("creates user with hashed password and returns message after user signs up", async () => {
    const body = {
      email: "email@protonmail.com",
      password: "password",
    };
    const user = {
      id: "1",
      auto: false,
      email: body.email,
      confirmed: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const hashSpy = jest.spyOn(bcrypt, "hash");
    const createUserMock = jest
      .spyOn(userQueries, "create")
      .mockImplementation(async () => {
        return user;
      });

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      },
    });
    expect(emailExists).toHaveBeenCalledTimes(1);
    expect(hashSpy).toHaveBeenCalledTimes(1);
    expect(hashSpy).toHaveBeenCalledWith(body.password, Number(SALT));
    expect(createUserMock).toHaveBeenCalledTimes(1);
    expect(createUserMock).toHaveBeenCalledWith({
      email: body.email,
      password: expect.any(String),
    });
  });
});
