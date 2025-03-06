import express from "express";
import request from "supertest";

import { update_word_reminder } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";

describe("update_word_reminder", () => {
  const userId = 1;

  const wordReminder = {
    id: 1,
    user_id: userId,
    finish: new Date("December 17, 1995 03:24:00"),
    is_active: true,
    reminder: "* * * * *",
    has_reminder_onload: true,
    created_at: new Date("December 17, 1995 03:24:00"),
    updated_at: new Date("December 17, 1995 03:24:00"),
  };

  const wordId1 = 1;
  const wordId2 = 2;
  const wordId3 = 3;

  const userWord1 = {
    id: 1,
    user_id: userId,
    word_id: wordId1,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: 2,
    user_id: userId,
    word_id: wordId2,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord3 = {
    id: 3,
    user_id: userId,
    word_id: wordId3,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const user_word_ids = [userWord1.id, userWord2.id, userWord3.id];

  const userWordsWordReminders1 = {
    id: 1,
    user_word_id: userWord1.id,
    word_reminder_id: wordReminder.id,
  };
  const userWordsWordReminders2 = {
    id: 2,
    user_word_id: userWord2.id,
    word_reminder_id: wordReminder.id,
  };
  const userWordsWordReminders3 = {
    id: 3,
    user_word_id: userWord2.id,
    word_reminder_id: wordReminder.id,
  };

  const wordReminderUpdateMock = jest
    .spyOn(wordReminderQueries, "updateById")
    .mockResolvedValue(wordReminder);

  const userWordsWordRemindersMock = jest
    .spyOn(userWordsWordRemindersQueries, "create")
    .mockResolvedValueOnce(userWordsWordReminders1)
    .mockResolvedValueOnce(userWordsWordReminders2)
    .mockResolvedValueOnce(userWordsWordReminders3);

  const app = express();
  app.use(express.json());
  app.put(
    "/api/users/:userId/wordReminders/:wordReminderId",
    update_word_reminder
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to update the word reminder with the user words in it", async () => {
    const body = {
      finish: wordReminder.finish,
      user_word_ids,
      is_active: wordReminder.is_active,
      has_reminder_onload: wordReminder.has_reminder_onload,
      reminder: wordReminder.reminder,
    };

    const response = await request(app)
      .put(`/api/users/${userId}/wordReminders/${wordReminder.id}`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      wordReminder: {
        ...wordReminder,
        finish: wordReminder.finish.toISOString(),
        created_at: wordReminder.created_at.toISOString(),
        updated_at: wordReminder.updated_at.toISOString(),
      },
    });
    expect(wordReminderUpdateMock).toHaveBeenCalledTimes(1);
    expect(wordReminderUpdateMock).toHaveBeenCalledWith(wordReminder.id, {
      reminder: body.reminder,
      is_active: body.is_active,
      has_reminder_onload: body.has_reminder_onload,
      finish: body.finish.toISOString(),
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledTimes(3);
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord1.id,
      word_reminder_id: wordReminder.id,
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord2.id,
      word_reminder_id: wordReminder.id,
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord3.id,
      word_reminder_id: wordReminder.id,
    });
  });
});
