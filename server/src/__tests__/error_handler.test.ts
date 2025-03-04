import express from "express";
import request from "supertest";

import { CustomBadRequestError } from "../errors/custom_bad_request_error";
import { errorHandler } from "../middleware/error_handler";

const app = express();
app.use(express.json());

app.get("/user-error", (req, res, next) => {
  next(new CustomBadRequestError("User error occurred"));
});

app.get("/server-error", (req, res, next) => {
  next(new Error());
});

app.use(errorHandler);

describe("errorHandler", () => {
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
