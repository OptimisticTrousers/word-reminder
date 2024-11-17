import asyncHandler from "express-async-handler";
import express from "express";
import request from "supertest";

import { UserQueries } from "../db/userQueries";
import { UserWordQueries } from "../db/userWordQueries";
import { delete_user } from "../controllers/userController";

describe("delete_user", () => {
  const message = "Success!";
  const app = express();
  app.use(express.json());
  app.delete(
    "/api/users/:userId",
    delete_user,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  it("calls the methods to delete the user and the user's user words", async () => {
    const deleteUserByIdMock = jest
      .spyOn(UserQueries.prototype, "deleteUserById")
      .mockImplementation(jest.fn());
    const deleteAllUserWordsMock = jest
      .spyOn(UserWordQueries.prototype, "deleteAllUserWords")
      .mockImplementation(jest.fn());
    const userId = "1";

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Accept", "application/json");

    expect(deleteUserByIdMock).toHaveBeenCalledTimes(1);
    expect(deleteUserByIdMock).toHaveBeenCalledWith(userId);
    expect(deleteAllUserWordsMock).toHaveBeenCalledTimes(1);
    expect(deleteAllUserWordsMock).toHaveBeenCalledWith(userId);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(message);
  });
});
