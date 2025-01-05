import asyncHandler from "express-async-handler";
import express from "express";
import request from "supertest";

import { errorValidationHandler } from "../middleware/error_validation_handler";
import { body } from "express-validator";

describe("errorValidationHandler", () => {
  const message = "Success!";
  const app = express();
  app.use(express.json());
  app.post(
    "/api/users",
    body("test").notEmpty(),
    errorValidationHandler,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  it("returns 400 status code when there are validation errors", async () => {
    const user = {
      test: undefined,
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: expect.any(Array),
    });
  });

  it("the next request handler is called", async () => {
    const user = {
      test: "test",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message,
    });
  });
});
