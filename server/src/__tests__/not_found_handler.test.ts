import express from "express";
import request from "supertest";

import { errorHandler } from "../middleware/error_handler";
import { notFoundHandler } from "../middleware/not_found_handler";

describe("notFoundHandler", () => {
  const app = express();
  app.use(express.json());

  app.use(notFoundHandler);

  // Add the errorHandler middleware to catch and respond to errors
  app.use(errorHandler);

  describe("Not found handler", () => {
    it("should handle undefined routes and return status 404", async () => {
      const response = await request(app).get("/unknown");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Not found",
        stack: expect.any(String),
      });
      expect(response.body.stack.includes("NotFoundError: Not found")).toBe(
        true
      );
    });
  });
});
