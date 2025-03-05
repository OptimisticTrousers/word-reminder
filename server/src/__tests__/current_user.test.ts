import express, { NextFunction, Request, Response } from "express";
import request from "supertest";

import { current_user } from "../controllers/session_controller";

const user = {
  id: 1,
  confirmed: true,
  email: "email@protonmail.com",
  password: "password",
  created_at: new Date(),
  updated_at: new Date(),
};

const app = express();
app.use(express.json());
app.get(
  "/api/sessions",
  (req: Request, res: Response, next: NextFunction) => {
    req.user = user;
    next();
  },
  current_user
);

describe("current_user", () => {
  it("returns user when the user is logged in", async () => {
    const response = await request(app)
      .get("/api/sessions")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        id: user.id,
        confirmed: user.confirmed,
        email: user.email,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      },
    });
  });
});
