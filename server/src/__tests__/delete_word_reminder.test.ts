import express from "express";
import request from "supertest";

import { delete_word_reminder } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { reminderQueries } from "../db/reminder_queries";

describe("delete_word_reminder", () => {
  const app = express();
  app.use(express.json());
  app.delete(
    "/api/users/:userId/wordReminders/:wordReminderId",
    delete_word_reminder
  );

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
      hours: 2,
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

  const deletedUserWordsWordReminders = [
    {
      ...wordReminder1,
      ...userWordsWordReminder1,
    },
    {
      ...wordReminder1,
      ...userWordsWordReminder2,
    },
    {
      ...wordReminder1,
      ...userWordsWordReminder3,
    },
  ];

  const deleteAllByWordReminderIdMock = jest
    .spyOn(userWordsWordRemindersQueries, "deleteAllByWordReminderId")
    .mockImplementation(async () => {
      return deletedUserWordsWordReminders;
    });
  const deleteByWordReminderIdMock = jest
    .spyOn(reminderQueries, "deleteByWordReminderId")
    .mockImplementation(async () => {
      return {
        ...wordReminder1.reminder,
        id: "1",
        word_reminder_id: wordReminder1.id,
      };
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes a user's word reminders", async () => {
    const response = await request(app).delete(
      `/api/users/${sampleUser1.id}/wordReminders/${wordReminder1.id}`
    );

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      reminders: {
        ...wordReminder1.reminder,
        id: "1",
        word_reminder_id: wordReminder1.id,
      },
      userWordsWordReminders: [
        {
          ...wordReminder1,
          ...userWordsWordReminder1,
          finish: wordReminder1.finish.toISOString(),
          created_at: wordReminder1.created_at.toISOString(),
          updated_at: wordReminder1.updated_at.toISOString(),
        },
        {
          ...wordReminder1,
          ...userWordsWordReminder2,
          finish: wordReminder1.finish.toISOString(),
          created_at: wordReminder1.created_at.toISOString(),
          updated_at: wordReminder1.updated_at.toISOString(),
        },
        {
          ...wordReminder1,
          ...userWordsWordReminder3,
          finish: wordReminder1.finish.toISOString(),
          created_at: wordReminder1.created_at.toISOString(),
          updated_at: wordReminder1.updated_at.toISOString(),
        },
      ],
    });
    expect(deleteAllByWordReminderIdMock).toHaveBeenCalledTimes(1);
    expect(deleteAllByWordReminderIdMock).toHaveBeenCalledWith(
      wordReminder1.id
    );
    expect(deleteByWordReminderIdMock).toHaveBeenCalledTimes(1);
    expect(deleteByWordReminderIdMock).toHaveBeenCalledWith(wordReminder1.id);
  });
});
