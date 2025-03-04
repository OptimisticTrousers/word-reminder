import express from "express";
import request from "supertest";

import { validateAuthorized } from "../middleware/validate_authorized";

const message = "Success.";
const userId = 1;

describe("validateAuthorized", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a 401 status code when user tries to change another user's data ", async () => {
    const differentUserId = 2;
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: differentUserId };
      next();
    });
    app.delete("/api/users/:userId", validateAuthorized, (req, res) => {
      res.status(200).json({ message });
    });

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "You are not allowed to change another user's data.",
    });
  });

  it("calls the following request handler when the user is authorized", async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: userId };
      next();
    });
    app.delete("/api/users/:userId", validateAuthorized, (req, res) => {
      res.status(200).json({ message });
    });

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
  });
});
