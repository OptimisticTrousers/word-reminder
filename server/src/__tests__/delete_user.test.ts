import express from "express";
import request from "supertest";

import { delete_user } from "../controllers/user_controller";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { userQueries } from "../db/user_queries";
import { userWordQueries } from "../db/user_word_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";

const userId = 1;
const message = "Success!";
const app = express();
app.use(express.json());
app.delete("/api/users/:userId", delete_user, (req, res) => {
  res.status(200).json({ message });
});

describe("delete_user", () => {
  it("calls the methods to delete the user and the user's user words", async () => {
    const mockUserWordDeleteByUserId = jest
      .spyOn(userWordQueries, "deleteByUserId")
      .mockImplementation(jest.fn());
    const mockWordReminderDeleteByUserId = jest
      .spyOn(wordReminderQueries, "deleteByUserId")
      .mockImplementation(jest.fn());
    const mockAutoWordReminderDeleteByUserId = jest
      .spyOn(autoWordReminderQueries, "deleteByUserId")
      .mockImplementation(jest.fn());
    const mockDeleteById = jest
      .spyOn(userQueries, "deleteById")
      .mockImplementation(jest.fn());

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
    expect(mockUserWordDeleteByUserId).toHaveBeenCalledTimes(1);
    expect(mockUserWordDeleteByUserId).toHaveBeenCalledWith(userId);
    expect(mockWordReminderDeleteByUserId).toHaveBeenCalledTimes(1);
    expect(mockWordReminderDeleteByUserId).toHaveBeenCalledWith(userId);
    expect(mockAutoWordReminderDeleteByUserId).toHaveBeenCalledTimes(1);
    expect(mockAutoWordReminderDeleteByUserId).toHaveBeenCalledWith(userId);
    expect(mockDeleteById).toHaveBeenCalledTimes(1);
    expect(mockDeleteById).toHaveBeenCalledWith(userId);
  });
});
