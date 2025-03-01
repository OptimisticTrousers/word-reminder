import express from "express";
import request from "supertest";

import { delete_word_reminders } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { reminderQueries } from "../db/reminder_queries";

describe("delete_word_reminders", () => {
  const app = express();
  app.use(express.json());
  app.delete("/api/users/:userId/wordReminders", delete_word_reminders);

  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminder1 = {
    id: "1",
    user_id: sampleUser1.id,
    reminder: {
      minutes: 0,
      hours: 1,
      days: 0,
      weeks: 0,
      months: 0,
    },
    is_active: true,
    has_reminder_onload: true,
    finish: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWordsWordReminder1 = {
    id: "1",
    user_word_id: "1",
    word_reminder_id: wordReminder1.id,
  };

  const userWordsWordReminder2 = {
    id: "2",
    user_word_id: "2",
    word_reminder_id: wordReminder1.id,
  };

  const userWordsWordReminder3 = {
    id: "3",
    user_word_id: "3",
    word_reminder_id: wordReminder1.id,
  };

  const wordReminders = [wordReminder1];
  const userWordsWordReminders = [
    userWordsWordReminder1,
    userWordsWordReminder2,
    userWordsWordReminder3,
  ];

  const deleteAllByUserIdUserWordsWordRemindersMock = jest
    .spyOn(userWordsWordRemindersQueries, "deleteAllByUserId")
    .mockImplementation(async () => {
      return userWordsWordReminders;
    });
  const deleteAllByUserIdWordRemindersMock = jest
    .spyOn(wordReminderQueries, "deleteAllByUserId")
    .mockImplementation(async () => {
      return wordReminders;
    });
  const deleteAllByUserIdMock = jest
    .spyOn(reminderQueries, "deleteAllByUserId")
    .mockImplementation(async () => {
      return [
        {
          ...wordReminder1.reminder,
          id: "1",
          word_reminder_id: wordReminder1.id,
        },
      ];
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes all of the user's word reminders", async () => {
    const response = await request(app)
      .delete(`/api/users/${sampleUser1.id}/wordReminders`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userWordsWordReminders,
      reminders: [
        {
          ...wordReminder1.reminder,
          id: "1",
          word_reminder_id: wordReminder1.id,
        },
      ],
      wordReminders: [
        {
          id: wordReminder1.id,
          user_id: wordReminder1.id,
          reminder: wordReminder1.reminder,
          is_active: wordReminder1.is_active,
          has_reminder_onload: wordReminder1.has_reminder_onload,
          finish: wordReminder1.finish.toISOString(),
          created_at: wordReminder1.created_at.toISOString(),
          updated_at: wordReminder1.updated_at.toISOString(),
        },
      ],
    });
    expect(deleteAllByUserIdUserWordsWordRemindersMock).toHaveBeenCalledTimes(
      1
    );
    expect(deleteAllByUserIdUserWordsWordRemindersMock).toHaveBeenCalledWith(
      sampleUser1.id
    );
    expect(deleteAllByUserIdWordRemindersMock).toHaveBeenCalledTimes(1);
    expect(deleteAllByUserIdWordRemindersMock).toHaveBeenCalledWith(
      sampleUser1.id
    );
    expect(deleteAllByUserIdMock).toHaveBeenCalledTimes(1);
    expect(deleteAllByUserIdMock).toHaveBeenCalledWith(sampleUser1.id);
  });
});
