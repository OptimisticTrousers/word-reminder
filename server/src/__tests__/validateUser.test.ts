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

  it("returns 400 status code when the email is not provided", async () => {
    const user = {
      email: undefined,
      password: "password",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'email' must be specified.",
          path: "email",
          type: "field",
          value: "",
        },
      ],
    });
  });

  it("returns 400 status code when the email is not a valid email", async () => {
    const user = {
      email: "email",
      password: "password",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'email' must be a valid email.",
          path: "email",
          type: "field",
          value: "email",
        },
      ],
    });
  });

  it("returns 400 status code when the password is not provided", async () => {
    const user = {
      email: "email@protonmail.com",
      password: undefined,
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'password' must be specified.",
          path: "password",
          type: "field",
          value: "",
        },
      ],
    });
  });

  it("returns 400 status code when the email is greater than 255 characters", async () => {
    const email = new Array(256).fill("a").join("");
    const user = {
      email,
      password: "password",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'email' cannot be greater than 255 characters.",
          path: "email",
          type: "field",
          value:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      ],
    });
  });

  it("returns 400 status code when the password is greater than 72 characters", async () => {
    const password = new Array(73).fill("a").join("");
    const user = {
      email: "email@protonmail.com",
      password,
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'password' cannot be greater than 72 characters.",
          path: "password",
          type: "field",
          value:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      ],
    });
  });

  it("returns 400 status code when the email is greater than 255 characters and password is greater than 72 characters", async () => {
    const email = new Array(256).fill("a").join("");
    const password = new Array(73).fill("a").join("");
    const user = {
      email,
      password,
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'email' cannot be greater than 255 characters.",
          path: "email",
          type: "field",
          value:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
        {
          location: "body",
          msg: "'password' cannot be greater than 72 characters.",
          path: "password",
          type: "field",
          value:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      ],
    });
  });

  it("the next request handler is called", async () => {
    const user = {
      email: "email@protonmail.com",
      password: "password",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
  });
});
