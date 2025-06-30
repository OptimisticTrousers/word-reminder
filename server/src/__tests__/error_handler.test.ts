/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import express from "express";
import request from "supertest";

import { CustomBadRequestError } from "../errors/custom_bad_request_error";
import { errorHandler } from "../middleware/error_handler";

const app = express();
app.use(express.json());

const userErrorMessage = "User error occured.";

app.get("/user-error", (req, res, next) => {
  next(new CustomBadRequestError(userErrorMessage));
});

const serverErrorMessage = "Internal Server Error.";

app.get("/server-error", (req, res, next) => {
  next(new Error(serverErrorMessage));
});

app.get("/unknown-server-error", (req, res, next) => {
  next(new Error());
});

app.use(errorHandler);

describe("errorHandler", () => {
  describe("User error", () => {
    it("should handle user errors and return status 400", async () => {
      const response = await request(app).get("/user-error");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: userErrorMessage,
        stack: expect.any(String),
      });
      expect(
        (response.body as { stack: string }).stack.includes(
          `Error: ${userErrorMessage}`
        )
      ).toBe(true);
    });
  });

  describe("Server error", () => {
    it("should handle server errors and return status 500", async () => {
      const response = await request(app).get("/server-error");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: serverErrorMessage,
        stack: expect.any(String),
      });
      expect(
        (response.body as { stack: string }).stack.includes(
          `Error: ${serverErrorMessage}`
        )
      ).toBe(true);
    });

    it("should handle unknown server errors and return status 500", async () => {
      const response = await request(app).get("/unknown-server-error");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: serverErrorMessage,
        stack: expect.any(String),
      });
    });
  });
});
