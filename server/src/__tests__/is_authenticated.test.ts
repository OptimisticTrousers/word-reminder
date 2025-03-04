import express, { NextFunction, Request, Response } from "express";
import request from "supertest";

import { isAuthenticated } from "../middleware/is_authenticated";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("isAuthenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Unauthenticated user", () => {
    it("should return 401 and a message if the user is not authenticated", async () => {
      const app = express();
      app.get(
        "/api/protected",
        (req: Request, res: Response, next: NextFunction) => {
          req.isUnauthenticated = function () {
            return true;
          } as any;
          next();
        },
        isAuthenticated,
        (req: Request, res: Response) => {
          res.status(200).json({ message: "You are authenticated!" });
        }
      );

      const response = await request(app)
        .get("/api/protected")
        .set("Accept", "application/json");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "User is unauthenticated." });
    });
  });

  describe("Authenticated user", () => {
    it("should allow access and return 200 for an authenticated user", async () => {
      const app = express();
      app.get(
        "/api/protected",
        (req: Request, res: Response, next: NextFunction) => {
          req.isUnauthenticated = function () {
            return false;
          } as any;
          next();
        },
        isAuthenticated,
        (req: Request, res: Response) => {
          res.status(200).json({ message: "You are authenticated!" });
        }
      );

      const response = await request(app)
        .get("/api/protected")
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "You are authenticated!" });
    });
  });
});
