import express from "express";
import request from "supertest";

import { delete_word_reminders } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";

const app = express();
app.use(express.json());
app.delete("/api/users/:userId/wordReminders", delete_word_reminders);

const userId = 1;

const wordReminder = {
  id: 1,
  user_id: userId,
  reminder: "* * * * *",
  is_active: true,
  has_reminder_onload: true,
  finish: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  created_at: new Date(),
  updated_at: new Date(),
};

const userWordsWordReminder1 = {
  id: 1,
  user_word_id: 1,
  word_reminder_id: wordReminder.id,
};

const userWordsWordReminder2 = {
  id: 2,
  user_word_id: 2,
  word_reminder_id: wordReminder.id,
};

const userWordsWordReminder3 = {
  id: 3,
  user_word_id: 3,
  word_reminder_id: wordReminder.id,
};

const wordReminders = [wordReminder];
const userWordsWordReminders = [
  userWordsWordReminder1,
  userWordsWordReminder2,
  userWordsWordReminder3,
];

describe("delete_word_reminders", () => {
  const mockUserWordsWordRemindersDeleteById = jest
    .spyOn(userWordsWordRemindersQueries, "deleteByUserId")
    .mockResolvedValue(userWordsWordReminders);
  const mockWordReminderDeleteByUserId = jest
    .spyOn(wordReminderQueries, "deleteByUserId")
    .mockResolvedValue(wordReminders);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes all of the user's word reminders", async () => {
    const response = await request(app)
      .delete(`/api/users/${userId}/wordReminders`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userWordsWordReminders,
      wordReminders: [
        {
          id: wordReminder.id,
          user_id: wordReminder.id,
          reminder: wordReminder.reminder,
          is_active: wordReminder.is_active,
          has_reminder_onload: wordReminder.has_reminder_onload,
          finish: wordReminder.finish.toISOString(),
          created_at: wordReminder.created_at.toISOString(),
          updated_at: wordReminder.updated_at.toISOString(),
        },
      ],
    });
    expect(mockUserWordsWordRemindersDeleteById).toHaveBeenCalledTimes(1);
    expect(mockUserWordsWordRemindersDeleteById).toHaveBeenCalledWith(userId);
    expect(mockWordReminderDeleteByUserId).toHaveBeenCalledTimes(1);
    expect(mockWordReminderDeleteByUserId).toHaveBeenCalledWith(userId);
  });
});
