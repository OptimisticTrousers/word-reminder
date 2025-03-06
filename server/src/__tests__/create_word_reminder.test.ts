import express from "express";
import request from "supertest";

import { create_word_reminder } from "../controllers/word_reminder_controller";
import * as wordReminders from "../utils/word_reminder";

describe("create_word_reminder", () => {
  const userId = 1;

  const wordReminderParams = {
    user_id: userId,
    finish: new Date(),
    is_active: true,
    reminder: "* * * * *",
    has_reminder_onload: true,
  };
  const wordReminder = {
    ...wordReminderParams,
    id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const user_word_ids = [1, 2, 3];

  const mockCreateWordReminder = jest
    .spyOn(wordReminders, "createWordReminder")
    .mockImplementation(async () => {
      return wordReminder;
    });

  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/wordReminders", create_word_reminder);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to create the word reminder with the user words in it", async () => {
    const body = {
      user_id: userId,
      is_active: wordReminderParams.is_active,
      has_reminder_onload: wordReminderParams.has_reminder_onload,
      finish: wordReminderParams.finish,
      reminder: wordReminderParams.reminder,
      user_word_ids,
    };

    const response = await request(app)
      .post(`/api/users/${userId}/wordReminders`)
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
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      user_id: userId,
      is_active: body.is_active,
      has_reminder_onload: body.has_reminder_onload,
      user_word_ids,
      reminder: body.reminder,
      finish: body.finish.toISOString(),
    });
  });
});
