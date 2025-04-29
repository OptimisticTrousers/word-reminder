import express from "express";
import request from "supertest";
import path from "path";

import { confirm_account } from "../controllers/user_controller";
import { userQueries } from "../db/user_queries";

const user = {
  id: 1,
  email: "test@protonmail.com",
  confirmed: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const token = "token";

describe("confirmAccount", () => {
  const app = express();
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("view engine", "ejs");
  app.use(express.json());
  app.get("/api/users/:userId&token", confirm_account);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to get the user, update the user, and render the success page", async () => {
    const mockGetById = jest
      .spyOn(userQueries, "getById")
      .mockResolvedValue(user);
    const mockUpdateById = jest
      .spyOn(userQueries, "updateById")
      .mockResolvedValue(user);

    const response = await request(app).get(`/api/users/${user.id}&${token}`);

    const hasMessage = response.text.includes(
      "You have successfully confirmed your account!"
    );
    expect(hasMessage).toBe(true);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.status).toBe(200);
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(user.id);
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenCalledWith(user.id, { confirmed: true });
  });

  it("calls the functions to get the user and renders the errors page when the updating the user throws an error", async () => {
    const mockGetById = jest
      .spyOn(userQueries, "getById")
      .mockResolvedValue(user);
    const mockUpdateById = jest
      .spyOn(userQueries, "updateById")
      .mockImplementation(async () => {
        throw new Error("cannot confirm user");
      });

    const response = await request(app).get(`/api/users/${user.id}&${token}`);

    const hasMessage = response.text.includes(
      "Server Error. Unable to confirm your account. Please log into WordReminder and try again."
    );
    expect(hasMessage).toBe(true);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.status).toBe(200);
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(user.id);
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenCalledWith(user.id, { confirmed: true });
  });

  it("calls the functions to get the user, does not update the user when already confirmed, and send a success page", async () => {
    const mockGetById = jest
      .spyOn(userQueries, "getById")
      .mockResolvedValue({ ...user, confirmed: true });
    const mockUpdateById = jest
      .spyOn(userQueries, "updateById")
      .mockResolvedValue(user);

    const response = await request(app).get(`/api/users/${user.id}&${token}`);

    const hasMessage = response.text.includes(
      "You have successfully confirmed your account!"
    );
    expect(hasMessage).toBe(true);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.status).toBe(200);
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(user.id);
    expect(mockUpdateById).not.toHaveBeenCalled();
  });
});
