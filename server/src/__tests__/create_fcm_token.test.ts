import express from "express";
import request from "supertest";

import { create_fcm_token } from "../controllers/fcm_token_controller";
import { fcmTokenQueries } from "../db/fcm_token_queries";

describe("create_fcm_token", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const app = express();
  app.use(express.json());
  app.put("/api/users/:userId/fcmTokens", create_fcm_token);

  const userId = 1;
  const token = "token";

  it("creates the fcm token and returns success message", async () => {
    const mockCreate = jest
      .spyOn(fcmTokenQueries, "create")
      .mockImplementation(jest.fn());

    const response = await request(app)
      .put(`/api/users/${userId}/fcmTokens`)
      .set("Accept", "application/json")
      .send({ token });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { success: true } });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({ token, userId });
  });

  it("returns 400 status code when the 'token' value is not provided", async () => {
    const mockCreate = jest
      .spyOn(fcmTokenQueries, "create")
      .mockImplementation(jest.fn());

    const response = await request(app)
      .put(`/api/users/${userId}/fcmTokens`)
      .set("Accept", "application/json")
      .send({
        token: undefined,
      });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Token must be specified.",
          path: "token",
          type: "field",
          value: "",
        },
      ],
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
