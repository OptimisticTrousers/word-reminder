import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { UserQueries } from "../db/user_queries";
import { validateUserId } from "../middleware/validate_user_id";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("validateUserId", () => {
  const message = "message";

  const userQueries = new UserQueries();

  const user = {
    id: "1",
  };

  const app = express();
  app.use(express.json());
  app.delete(
    "/api/users/:userId",
    asyncHandler(async (req, res, next) => {
      req.user = user;
      next();
    }),
    validateUserId,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  it("returns a 400 status code with the invalid user id message", async () => {
    const response = await request(app)
      .delete("/api/users/bob")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid user ID.",
    });
  });

  it("returns a 401 status code when the userId in req.params does not match the session user", async () => {
    app.get(
      "/api/users/:userId",
      asyncHandler(async (req, res, next) => {
        req.user = { id: "3" };
        next();
      }),
      validateUserId,
      asyncHandler(async (req, res, next) => {
        res.status(200).json({ message });
      })
    );

    const response = await request(app)
      .get(`/api/users/${user.id}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Unauthorized.",
    });
  });

  it("returns a 404 status code with user not found message", async () => {
    const response = await request(app)
      .delete(`/api/users/${user.id}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found.",
    });
  });

  it("calls the following request handler when the user exists and the user id is valid", async () => {
    const user = await userQueries.create({
      email: "email@protonmail.com",
      password: "password",
    });

    const response = await request(app)
      .delete(`/api/users/${user!.id}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message,
    });
  });
});
