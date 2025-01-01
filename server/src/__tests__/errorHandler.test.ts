import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import { errorHandler } from "../middleware/errorHandler";

describe("errorHandler", () => {
  const app = express();
  app.use(express.json());

  app.get("/user-error", (req: Request, res: Response, next: NextFunction) => {
    const error = new Error("User error occurred") as Error & {
      status: number;
    };
    error.status = 400;
    next(error);
  });

  app.get(
    "/server-error",
    (req: Request, res: Response, next: NextFunction) => {
      next(new Error());
    }
  );

  app.use(errorHandler);

  describe("User error", () => {
    it("should handle user errors and return status 400", async () => {
      const response = await request(app).get("/user-error");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "User error occurred",
        stack: expect.any(String),
      });
      expect(response.body.stack.includes("Error: User error occurred")).toBe(
        true
      );
    });
  });

  describe("Server error", () => {
    it("should handle server errors and return status 500", async () => {
      const response = await request(app).get("/server-error");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Internal Server Error.",
        stack: expect.any(String),
      });
      expect(response.body.stack.includes("Error:")).toBe(true);
    });
  });
});
