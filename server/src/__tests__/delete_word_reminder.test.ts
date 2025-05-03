import express from "express";
import request from "supertest";

import { delete_word_reminder } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";

const queuePostfix = "word-reminder-queue";
const app = express();
app.use(express.json());
app.delete(
  "/api/users/:userId/wordReminders/:wordReminderId",
  (req, res, next) => {
    const userId = req.params.userId;
    res.locals.queueName = `${userId}-${queuePostfix}`;
    next();
  },
  delete_word_reminder
);

const userId = 1;

const wordReminder = {
  id: 1,
  user_id: userId,
  is_active: true,
  reminder: "* * * * *",
  has_reminder_onload: true,
  finish: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  created_at: new Date(),
  updated_at: new Date(),
};

const userWordId1 = 1;
const userWordId2 = 2;
const userWordId3 = 3;

const userWordsWordReminder1 = {
  id: 1,
  user_word_id: userWordId1,
  word_reminder_id: wordReminder.id,
};

const userWordsWordReminder2 = {
  id: 2,
  user_word_id: userWordId2,
  word_reminder_id: wordReminder.id,
};

const userWordsWordReminder3 = {
  id: 3,
  user_word_id: userWordId3,
  word_reminder_id: wordReminder.id,
};

const deletedUserWordsWordReminders = [
  userWordsWordReminder1,
  userWordsWordReminder2,
  userWordsWordReminder3,
];

describe("delete_word_reminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes a user's word reminders", async () => {
    const deleteByWordReminderIdMock = jest
      .spyOn(userWordsWordRemindersQueries, "deleteByWordReminderId")
      .mockResolvedValue(deletedUserWordsWordReminders);
    const deleteByIdMock = jest
      .spyOn(wordReminderQueries, "deleteById")
      .mockImplementation(async () => {
        return wordReminder;
      });

    const response = await request(app).delete(
      `/api/users/${userId}/wordReminders/${wordReminder.id}`
    );

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      wordReminder: {
        ...wordReminder,
        updated_at: wordReminder.updated_at.toISOString(),
        created_at: wordReminder.created_at.toISOString(),
        finish: wordReminder.finish.toISOString(),
      },
      userWordsWordReminders: deletedUserWordsWordReminders,
    });
    expect(deleteByWordReminderIdMock).toHaveBeenCalledTimes(1);
    expect(deleteByWordReminderIdMock).toHaveBeenCalledWith(wordReminder.id);
    expect(deleteByWordReminderIdMock).toHaveBeenCalledTimes(1);
    expect(deleteByWordReminderIdMock).toHaveBeenCalledWith(wordReminder.id);
    expect(deleteByIdMock).toHaveBeenCalledTimes(1);
    expect(deleteByIdMock).toHaveBeenCalledWith(wordReminder.id);
  });
});
