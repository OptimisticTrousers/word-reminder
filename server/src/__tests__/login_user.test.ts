/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { EMAIL_MAX, PASSWORD_MAX } from "common";
import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import request from "supertest";

import { login_user } from "../controllers/session_controller";
import { errorHandler } from "../middleware/error_handler";

const user = {
  id: "1",
  email: "email@protonmail.com",
  password: "password",
};

const strategy = "local";

let capturedAuthenticateCallback: any;

describe("login_user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the next function when authenticate contains an error", async () => {
    const errorMessage = "authenticate error";
    const error = new Error(errorMessage);
    const mockAuthenticate = jest
      .spyOn(passport, "authenticate")
      .mockImplementation((_, callback) => {
        capturedAuthenticateCallback = callback;
        return jest.fn().mockImplementation(() => {
          capturedAuthenticateCallback(error, null, { message: "" });
        });
      });
    const app = express();
    app.use(express.json());
    app.post("/api/sessions", login_user);
    app.use(errorHandler);

    const response = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: errorMessage,
      stack: expect.any(String),
    });
    expect(
      (response.body as { stack: string }).stack.includes(
        `Error: ${errorMessage}`
      )
    ).toBe(true);
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    expect(mockAuthenticate).toHaveBeenCalledWith(
      strategy,
      capturedAuthenticateCallback
    );
  });

  it("calls the next function when the user does not exist", async () => {
    const message = "User does not exist!";
    const mockAuthenticate = jest
      .spyOn(passport, "authenticate")
      .mockImplementation((_, callback) => {
        capturedAuthenticateCallback = callback;
        return jest.fn().mockImplementation(() => {
          capturedAuthenticateCallback(null, null, { message });
        });
      });
    const app = express();
    app.use(express.json());
    app.post("/api/sessions", login_user);

    const response = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ user: null, message });
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    expect(mockAuthenticate).toHaveBeenCalledWith(
      strategy,
      capturedAuthenticateCallback
    );
  });

  it("calls the next function when login function contains an error", async () => {
    const errorMessage = "login error";
    const error = new Error(errorMessage);
    const mockAuthenticate = jest
      .spyOn(passport, "authenticate")
      .mockImplementation((_, callback) => {
        capturedAuthenticateCallback = callback;
        return jest.fn().mockImplementation(() => {
          capturedAuthenticateCallback(null, user, { message: "" });
        });
      });
    let capturedLoginCallback;
    const mockLogin = jest.fn().mockImplementation((_, callback) => {
      capturedLoginCallback = callback;
      capturedLoginCallback(error);
    });
    const app = express();
    app.use(express.json());
    app.use((req: Request, res: Response, next: NextFunction) => {
      req.logIn = mockLogin;
      next();
    });
    app.post("/api/sessions", login_user);
    app.use(errorHandler);

    const response = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: errorMessage,
      stack: expect.any(String),
    });
    expect(
      (response.body as { stack: string }).stack.includes(
        `Error: ${errorMessage}`
      )
    ).toBe(true);
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    expect(mockAuthenticate).toHaveBeenCalledWith(
      strategy,
      capturedAuthenticateCallback
    );
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith(user, capturedLoginCallback);
  });

  it("returns 200 status code when the login is successful", async () => {
    const mockAuthenticate = jest
      .spyOn(passport, "authenticate")
      .mockImplementation((_, callback) => {
        capturedAuthenticateCallback = callback;
        return jest.fn().mockImplementation(() => {
          capturedAuthenticateCallback(null, user, { message: "Success!" });
        });
      });
    let capturedLoginCallback;
    const mockLogin = jest.fn().mockImplementation((_, callback) => {
      capturedLoginCallback = callback;
      capturedLoginCallback(null);
    });
    const app = express();
    app.use(express.json());
    app.use((req: Request, res: Response, next: NextFunction) => {
      req.logIn = mockLogin;
      next();
    });
    app.post("/api/sessions", login_user);

    const response = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user });
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    expect(mockAuthenticate).toHaveBeenCalledWith(
      strategy,
      capturedAuthenticateCallback
    );
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith(user, capturedLoginCallback);
  });

  describe("form validation", () => {
    it("returns 400 status code when the email is not provided", async () => {
      const user = {
        email: undefined,
        password: "password",
      };
      const app = express();
      app.use(express.json());
      app.post("/api/sessions", login_user);

      const response = await request(app)
        .post("/api/sessions")
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
      const app = express();
      app.use(express.json());
      app.post("/api/sessions", login_user);

      const response = await request(app)
        .post("/api/sessions")
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
      const app = express();
      app.use(express.json());
      app.post("/api/sessions", login_user);

      const response = await request(app)
        .post("/api/sessions")
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

    it(`returns 400 status code when the email is greater than ${EMAIL_MAX} characters`, async () => {
      const email = new Array(256).fill("a").join("");
      const user = {
        email,
        password: "password",
      };
      const app = express();
      app.use(express.json());
      app.post("/api/sessions", login_user);

      const response = await request(app)
        .post("/api/sessions")
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

    it(`returns 400 status code when the password is greater than ${PASSWORD_MAX} characters`, async () => {
      const password = new Array(73).fill("a").join("");
      const user = {
        email: "email@protonmail.com",
        password,
      };
      const app = express();
      app.use(express.json());
      app.post("/api/sessions", login_user);

      const response = await request(app)
        .post("/api/sessions")
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

    it(`returns 400 status code when the email is greater than ${EMAIL_MAX} characters and password is greater than ${PASSWORD_MAX} characters`, async () => {
      const email = new Array(256).fill("a").join("");
      const password = new Array(73).fill("a").join("");
      const user = {
        email,
        password,
      };
      const app = express();
      app.use(express.json());
      app.post("/api/sessions", login_user);

      const response = await request(app)
        .post("/api/sessions")
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
  });
});
