/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import bcrypt from "bcryptjs";
import express from "express";
import request from "supertest";

import { signup_user } from "../controllers/user_controller";
import { userQueries } from "../db/user_queries";
import { variables } from "../config/variables";
import { emailDoesNotExist } from "../utils/email_does_not_exist";

const { SALT } = variables;

jest.mock("../utils/email_does_not_exist", () => ({
  emailDoesNotExist: jest.fn().mockReturnValue(true),
}));

const app = express();
app.use(express.json());
app.post("/api/users", signup_user);

describe("signup_user", () => {
  it("creates user with hashed password and returns message after user signs up", async () => {
    const body = {
      email: "email@protonmail.com",
      password: "password",
    };
    const user = {
      id: 1,
      email: body.email,
      confirmed: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const hashSpy = jest.spyOn(bcrypt, "hash");
    const mockCreateUser = jest
      .spyOn(userQueries, "create")
      .mockResolvedValue(user);

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
    expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
    expect(emailDoesNotExist).toHaveBeenCalledWith(user.email);
    expect(hashSpy).toHaveBeenCalledTimes(1);
    expect(hashSpy).toHaveBeenCalledWith(body.password, Number(SALT));
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
    expect(mockCreateUser).toHaveBeenCalledWith({
      email: body.email,
      password: expect.any(String),
    });
  });
});
