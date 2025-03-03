import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { userQueries } from "../db/user_queries";
import { validateUserId } from "../middleware/validate_user_id";

describe("validateUserId", () => {
  const message = "message";

  const userId = "1";

  const app = express();
  app.use(express.json());
  app.delete(
    "/users/:userId",
    asyncHandler(async (req, res, next) => {
      req.user = { id: userId };
      next();
    }),
    validateUserId,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a 400 status code with the invalid user id message", async () => {
    const response = await request(app)
      .delete("/users/bob")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid user ID.",
    });
  });

  it("returns a 404 status code with user not found message", async () => {
    const mockGetById = jest
      .spyOn(userQueries, "getById")
      .mockImplementation(async () => {
        return undefined;
      });

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found.",
    });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(userId);
  });

  it("calls the following request handler when the user exists and the user id is valid", async () => {
    const user = {
      id: userId,
      auto: true,
      email: "bob@gmail.com",
      confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockGetById = jest
      .spyOn(userQueries, "getById")
      .mockImplementation(async () => {
        return user;
      });

    const response = await request(app)
      .delete(`/users/${user!.id}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message,
    });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(userId);
  });
});
