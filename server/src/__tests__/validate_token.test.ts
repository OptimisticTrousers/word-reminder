import asyncHandler from "express-async-handler";
import express from "express";
import request from "supertest";
import { validateToken } from "../middleware/validate_token";
import { tokenQueries } from "../db/token_queries";

describe("validate_token", () => {
  const message = "Success.";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 410 status code when the token is invalid and redirects to the 'failed-verification' page", async () => {
    const token = "invalidToken";
    const app = express();
    app.use(express.json());
    app.get(
      "/change-password/:token",
      validateToken,
      asyncHandler(async (req, res, next) => {
        res.json({ message });
      })
    );
    app.get(
      "/failed-verification",
      asyncHandler(async (req, res, next) => {
        res.json({ message });
      })
    );
    const mockVerify = jest
      .spyOn(tokenQueries, "verify")
      .mockImplementation(async () => {
        return false;
      });

    const response = await request(app).get(`/change-password/${token}`);

    expect(response.headers.location).toBe("/failed-verification");
    expect(response.status).toBe(303);
    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(mockVerify).toHaveBeenCalledWith(token);
  });

  it("calls the following request handler when the token is valid", async () => {
    const token = "validToken";
    const app = express();
    app.use(express.json());
    app.get(
      "/change-password/:token",
      validateToken,
      asyncHandler(async (req, res, next) => {
        res.json({ message });
      })
    );
    app.get(
      "/failed-verification",
      asyncHandler(async (req, res, next) => {
        res.json({ message });
      })
    );
    const mockVerify = jest
      .spyOn(tokenQueries, "verify")
      .mockImplementation(async () => {
        return true;
      });

    const response = await request(app)
      .get(`/change-password/${token}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message,
    });
    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(mockVerify).toHaveBeenCalledWith(token);
  });
});
