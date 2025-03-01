import express from "express";
import request from "supertest";

import { update_word_reminder } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { reminderQueries } from "../db/reminder_queries";

describe("update_word_reminder", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminder1 = {
    id: "1",
    user_id: sampleUser1.id,
    finish: new Date("December 17, 1995 03:24:00"),
    is_active: true,
    has_reminder_onload: true,
    created_at: new Date("December 17, 1995 03:24:00"),
    updated_at: new Date("December 17, 1995 03:24:00"),
  };

  const wordId1 = "1";

  const wordId2 = "2";

  const wordId3 = "3";

  const userWord1 = {
    id: "1",
    user_id: sampleUser1.id,
    word_id: wordId1,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: "2",
    user_id: sampleUser1.id,
    word_id: wordId2,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord3 = {
    id: "3",
    user_id: sampleUser1.id,
    word_id: wordId3,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const reminder1 = {
    minutes: 0,
    hours: 2,
    days: 0,
    weeks: 0,
    months: 0,
  };

  const userWordsWordReminders1 = {
    id: "1",
    user_word_id: userWord1.id,
    word_reminder_id: wordReminder1.id,
  };

  const deleteAllByWordReminderIdMock = jest
    .spyOn(userWordsWordRemindersQueries, "deleteAllByWordReminderId")
    .mockImplementation(async () => {
      return [userWordsWordReminders1];
    });

  const wordReminderUpdateMock = jest
    .spyOn(wordReminderQueries, "update")
    .mockImplementation(async () => {
      return wordReminder1;
    });

  const userWordsWordRemindersMock = jest
    .spyOn(userWordsWordRemindersQueries, "create")
    .mockImplementation(async () => {
      return userWordsWordReminders1;
    });

  const updateByWordReminderIdMock = jest
    .spyOn(reminderQueries, "updateByWordReminderId")
    .mockImplementation(async () => {
      return { ...reminder1, id: "1", word_reminder_id: wordReminder1.id };
    });

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
      finish: wordReminder1.finish,
      auto: false,
      user_words: [userWord1.id, userWord2.id, userWord3.id],
      is_active: false,
      has_reminder_onload: false,
      reminder: reminder1,
    };

    const response = await request(app)
      .put(`/api/users/${sampleUser1.id}/wordReminders/${wordReminder1.id}`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      wordReminder: {
        ...wordReminder1,
        reminder: { ...reminder1, id: "1", word_reminder_id: "1" },
        finish: wordReminder1.finish.toISOString(),
        created_at: wordReminder1.created_at.toISOString(),
        updated_at: wordReminder1.updated_at.toISOString(),
      },
    });
    expect(wordReminderUpdateMock).toHaveBeenCalledTimes(1);
    expect(wordReminderUpdateMock).toHaveBeenCalledWith({
      id: wordReminder1.id,
      is_active: body.is_active,
      has_reminder_onload: body.has_reminder_onload,
      finish: wordReminder1.finish.toISOString(),
    });
    expect(deleteAllByWordReminderIdMock).toHaveBeenCalledTimes(1);
    expect(deleteAllByWordReminderIdMock).toHaveBeenCalledWith(
      wordReminder1.id
    );
    expect(userWordsWordRemindersMock).toHaveBeenCalledTimes(3);
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord1.id,
      word_reminder_id: wordReminder1.id,
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord2.id,
      word_reminder_id: wordReminder1.id,
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord3.id,
      word_reminder_id: wordReminder1.id,
    });
    expect(updateByWordReminderIdMock).toHaveBeenCalledTimes(1);
    expect(updateByWordReminderIdMock).toHaveBeenCalledWith(
      wordReminder1.id,
      body.reminder
    );
  });
});
