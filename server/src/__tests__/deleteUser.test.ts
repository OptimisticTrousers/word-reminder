import asyncHandler from "express-async-handler";
import express from "express";
import request from "supertest";

import { delete_user } from "../controllers/userController";
import { UserQueries } from "../db/userQueries";
import { UserWordQueries } from "../db/userWordQueries";

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
      .spyOn(UserQueries.prototype, "deleteById")
      .mockImplementation(jest.fn())
      .mockName("deleteById");
    const deleteAllUserWordsMock = jest
      .spyOn(UserWordQueries.prototype, "deleteAllByUserId")
      .mockImplementation(jest.fn())
      .mockName("deleteAll");
    const userId = "1";

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
    expect(deleteUserByIdMock).toHaveBeenCalledTimes(1);
    expect(deleteUserByIdMock).toHaveBeenCalledWith(userId);
    expect(deleteAllUserWordsMock).toHaveBeenCalledTimes(1);
    expect(deleteAllUserWordsMock).toHaveBeenCalledWith(userId);
  });
});
