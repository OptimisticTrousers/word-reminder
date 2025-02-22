import express from "express";
import request from "supertest";

import { get_word_reminder } from "../controllers/word_reminder_controller";
import { wordReminderQueries } from "../db/word_reminder_queries";

describe("get_word_reminder", () => {
  const app = express();
  app.use(express.json());
  app.get(
    "/api/users/:userId/wordReminders/:wordReminderId",
    get_word_reminder
  );

  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminder1 = {
    id: "1",
    user_id: sampleUser1.id,
    reminder: "2 hours",
    is_active: true,
    has_reminder_onload: true,
    finish: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockWordReminderGetById = jest
    .spyOn(wordReminderQueries, "getById")
    .mockImplementation(async () => {
      return wordReminder1;
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("it gets a word reminder", async () => {
    const response = await request(app).get(
      `/api/users/${sampleUser1.id}/wordReminders/${wordReminder1.id}`
    );

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      wordReminder: {
        ...wordReminder1,
        created_at: wordReminder1.created_at.toISOString(),
        updated_at: wordReminder1.updated_at.toISOString(),
        finish: wordReminder1.finish.toISOString(),
      },
    });
    expect(mockWordReminderGetById).toHaveBeenCalledTimes(1);
    expect(mockWordReminderGetById).toHaveBeenCalledWith(wordReminder1.id);
  });
});
