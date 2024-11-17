import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { UserQueries } from "../db/userQueries";
import { validateUserId } from "../middleware/validateUserId";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("validateUserId", () => {
  const message = "message";

  const userQueries = new UserQueries();

  const app = express();
  app.use(express.json());
  app.delete(
    "/api/users/:userId",
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
    expect(response.body.message).toBe("Invalid user ID.");
  });

  it("returns a 404 status code with user not found message", async () => {
    const response = await request(app)
      .delete("/api/users/1")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found.");
  });

  it("calls the following request handler when the user exists and the user id is valid", async () => {
    const user = await userQueries.createUser("username", "password");

    const response = await request(app)
      .delete(`/api/users/${user.id}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(message);
  });
});
