import express from "express";
import request from "supertest";

import { variables } from "../config/variables";
import { verify_email } from "../controllers/email_controller";
import { tokenQueries } from "../db/token_queries";
import { userQueries } from "../db/user_queries";

const { FRONTEND_VERIFICATION, FRONTEND_URL } = variables;

describe("verifyEmail", () => {
  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/emails/:token", verify_email);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to verify the token, delete it, and send a failure redirect", async () => {
    const invalidToken = {
      token: "token",
      expires_at: new Date(),
    };
    const mockVerify = jest
      .spyOn(tokenQueries, "verify")
      .mockResolvedValue(false)
      .mockName("verify");

    const mockDeleteAll = jest
      .spyOn(tokenQueries, "deleteAll")
      .mockResolvedValue([invalidToken])
      .mockName("deleteAll");
    const userId = "1";
    const response = await request(app).post(
      `/api/users/${userId}/emails/${invalidToken.token}`
    );

    expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
    expect(response.status).toBe(302);
    expect(response.body).toEqual({});
    expect(response.headers.location).toBe(
      `${FRONTEND_URL}/failed-verification`
    );
    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(mockVerify).toHaveBeenCalledWith(invalidToken.token);
    expect(mockDeleteAll).not.toHaveBeenCalled();
  });

  it("calls the functions to verify the token, delete it, and send a success redirect when the user is not confirmed", async () => {
    const validToken = {
      token: "token",
      expires_at: new Date(),
    };
    const mockVerify = jest
      .spyOn(tokenQueries, "verify")
      .mockResolvedValue(true)
      .mockName("verify");

    const user = {
      id: "1",
      email: "bob@protonmail.com",
      auto: false,
      confirmed: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockGetById = jest
      .spyOn(userQueries, "getById")
      .mockResolvedValue(user)
      .mockName("updateById");
    const mockUpdateById = jest
      .spyOn(userQueries, "updateById")
      .mockImplementation(jest.fn())
      .mockName("updateById");

    const response = await request(app).post(
      `/api/users/${user.id}/emails/${validToken.token}`
    );

    expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
    expect(response.status).toBe(302);
    expect(response.body).toEqual({});
    expect(response.headers.location).toBe(
      `${FRONTEND_URL}/users/${user.id}/confirmation`
    );
    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(mockVerify).toHaveBeenCalledWith(validToken.token);
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(user.id);
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenCalledWith(user.id, { confirmed: true });
  });

  it("calls the functions to verify the token, delete it, and send a success redirect when the user is confirmed", async () => {
    const validToken = {
      token: "token",
      expires_at: new Date(),
    };
    const mockVerify = jest
      .spyOn(tokenQueries, "verify")
      .mockResolvedValue(true)
      .mockName("verify");

    const user = {
      id: "1",
      email: "bob@protonmail.com",
      auto: false,
      confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockGetById = jest
      .spyOn(userQueries, "getById")
      .mockResolvedValue(user)
      .mockName("updateById");
    const mockDeleteAll = jest
      .spyOn(tokenQueries, "deleteAll")
      .mockResolvedValue([validToken])
      .mockName("deleteAll");
    const response = await request(app).post(
      `/api/users/${user.id}/emails/${validToken.token}`
    );

    expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
    expect(response.status).toBe(302);
    expect(response.body).toEqual({});
    expect(response.headers.location).toBe(
      `${FRONTEND_URL}/users/${user.id}/${FRONTEND_VERIFICATION}`
    );
    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(mockVerify).toHaveBeenCalledWith(validToken.token);
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(user.id);
    expect(mockDeleteAll).toHaveBeenCalledTimes(1);
    expect(mockDeleteAll).toHaveBeenCalledWith([validToken.token]);
  });
});
