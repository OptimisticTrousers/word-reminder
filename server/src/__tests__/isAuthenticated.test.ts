import { Request, Response } from "express";
import request from "supertest";
import { app } from "../app";
import { isAuthenticated } from "../middleware/isAuthenticated";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("isAuthenticated", () => {
  app.get("/api/protected", isAuthenticated, (req: Request, res: Response) => {
    res.status(200).json({ message: "You are authenticated!" });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Unauthenticated user", () => {
    it("should return 401 and a message if the user is not authenticated", async () => {
      const response = await request(app)
        .get("/api/protected")
        .set("Accept", "application/json");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "User is unauthenticated." });
    });
  });

  describe("Authenticated user", () => {
    it("should allow access and return 200 for an authenticated user", async () => {
      const user = {
        email: "test_user@protonmail.com",
        password: "test_password",
      };
      // Simulate register
      await request(app)
        .post("/api/users")
        .send(user)
        .set("Accept", "application/json");
      // Simulate login
      const loginResponse = await request(app)
        .post("/api/sessions")
        .send(user)
        .set("Accept", "application/json");

      const cookies = loginResponse.headers["set-cookie"]; // Extract session cookies

      const response = await request(app)
        .get("/api/protected")
        .set("Cookie", cookies)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "You are authenticated!" });
    });
  });
});
