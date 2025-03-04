import express from "express";
import request from "supertest";

import { userQueries } from "../db/user_queries";
import { validateUserId } from "../middleware/validate_user_id";

const message = "message";
const userId = 1;

const app = express();
app.use(express.json());
app.delete(
  "/api/users/:userId",
  (req, res, next) => {
    req.user = { id: userId };
    next();
  },
  validateUserId,
  (req, res) => {
    res.status(200).json({ message });
  }
);

describe("validateUserId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("returns a 404 status code with user not found message", async () => {
    const mockUserGetById = jest
      .spyOn(userQueries, "getById")
      .mockResolvedValue(undefined);

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found.",
    });
    expect(mockUserGetById).toHaveBeenCalledTimes(1);
    expect(mockUserGetById).toHaveBeenCalledWith(userId);
  });

  it("calls the following request handler when the user exists and the user id is valid", async () => {
    const user = {
      id: userId,
      email: "bob@gmail.com",
      confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockUserGetById = jest
      .spyOn(userQueries, "getById")
      .mockResolvedValue(user);

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message,
    });
    expect(mockUserGetById).toHaveBeenCalledTimes(1);
    expect(mockUserGetById).toHaveBeenCalledWith(userId);
  });
});
