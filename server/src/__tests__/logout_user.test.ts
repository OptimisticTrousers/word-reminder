/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import express, { NextFunction, Request, Response } from "express";
import request from "supertest";

import { logout_user } from "../controllers/session_controller";

describe("logout_user", () => {
  it("calls the functions to logout", async () => {
    let capturedCallback: Function = function () {};
    const mockLogout = jest.fn().mockImplementation((callback) => {
      callback();
      capturedCallback = callback;
    });
    const app = express();
    app.use(express.json());
    app.delete(
      "/api/sessions",
      (req: Request, res: Response, next: NextFunction) => {
        req.logout = mockLogout;
        next();
      },
      logout_user
    );
    const response = await request(app)
      .delete("/api/sessions")
      .set("Accept", "application/json");

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledWith(capturedCallback);
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("calls logout callback with error when there is an error", async () => {
    const error = new Error("logout failed");
    let capturedCallback: Function = function () {};
    const mockLogout = jest.fn().mockImplementation((callback) => {
      callback(error);
      capturedCallback = callback;
    });
    const app = express();
    app.use(express.json());
    app.delete(
      "/api/sessions",
      (req: Request, res: Response, next: NextFunction) => {
        req.logout = mockLogout;
        next();
      },
      logout_user
    );
    const response = await request(app)
      .delete("/api/sessions")
      .set("Accept", "application/json");

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledWith(capturedCallback);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({});
  });
});
