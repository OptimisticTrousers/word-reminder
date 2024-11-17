import asyncHandler from "express-async-handler";
import express from "express";
import request from "supertest";

import { validateUser } from "../middleware/validateUser";

describe("validateUser", () => {
  const message = "Success!";
  const app = express();
  app.use(express.json());
  app.post(
    "/api/users",
    validateUser,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  it("returns 400 status code when the username is not provided", async () => {
    const user = {
      username: undefined,
      password: "password",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "Username must be specified.",
        path: "username",
        type: "field",
        value: "",
      },
    ]);
  });

  it("returns 400 status code when the password is not provided", async () => {
    const user = {
      username: "username",
      password: undefined,
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "Password must be specified.",
        path: "password",
        type: "field",
        value: "",
      },
    ]);
  });

  it("returns 400 status code when the username is greater than 255 characters", async () => {
    const username = new Array(256).fill("a").join("");
    const user = {
      username,
      password: "password",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "Username cannot be greater than 255 characters.",
        path: "username",
        type: "field",
        value:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    ]);
  });

  it("returns 400 status code when the password is greater than 72 characters", async () => {
    const password = new Array(73).fill("a").join("");
    const user = {
      username: "username",
      password,
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "Password cannot be greater than 72 characters.",
        path: "password",
        type: "field",
        value:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    ]);
  });

  it("returns 400 status code when the username is greater than 255 characters and password is greater than 72 characters", async () => {
    const username = new Array(256).fill("a").join("");
    const password = new Array(73).fill("a").join("");
    const user = {
      username,
      password,
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "Username cannot be greater than 255 characters.",
        path: "username",
        type: "field",
        value:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
      {
        location: "body",
        msg: "Password cannot be greater than 72 characters.",
        path: "password",
        type: "field",
        value:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    ]);
  });

  it("the next request handler is called", async () => {
    const user = {
      username: "username",
      password: "password",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(message);
  });
});
