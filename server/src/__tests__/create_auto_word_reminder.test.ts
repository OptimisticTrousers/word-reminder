import { SortMode } from "common";
import express from "express";
import request from "supertest";

import { create_auto_word_reminder } from "../controllers/auto_word_reminder_controller";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { boss } from "../db/boss";

const userId = 1;

const autoWordReminderParams = {
  user_id: userId,
  is_active: true,
  has_reminder_onload: true,
  has_learned_words: true,
  reminder: "* * * * *",
  duration: 3600000,
  sort_mode: SortMode.Newest,
  word_count: 7,
};
const autoWordReminder = {
  id: 1,
  ...autoWordReminderParams,
  created_at: new Date(0),
  updated_at: new Date(0),
};

const queuePostfix = "auto-word-reminder-queue";

const app = express();
app.use(express.json());
app.post("/api/users/:userId/autoWordReminders", create_auto_word_reminder);

describe("create_auto_word_reminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to create the auto word reminder and create word reminder when 'create_now' is true", async () => {
    const mockAutoWordReminderCreate = jest
      .spyOn(autoWordReminderQueries, "create")
      .mockResolvedValue(autoWordReminder);
    const mockSendAfter = jest
      .spyOn(boss, "sendAfter")
      .mockImplementation(jest.fn());
    jest.spyOn(global.Date, "now").mockImplementation(() => {
      return new Date(0).valueOf();
    });

    const response = await request(app)
      .post(`/api/users/${userId}/autoWordReminders`)
      .set("Accept", "application/json")
      .send({ ...autoWordReminderParams, create_now: true });

    const queueName = `${userId}-${queuePostfix}`;
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      autoWordReminder: {
        ...autoWordReminder,
        created_at: autoWordReminder.created_at.toISOString(),
        updated_at: autoWordReminder.updated_at.toISOString(),
      },
    });
    expect(mockAutoWordReminderCreate).toHaveBeenCalledTimes(1);
    expect(mockAutoWordReminderCreate).toHaveBeenCalledWith(
      autoWordReminderParams
    );
    expect(mockSendAfter).toHaveBeenCalledTimes(1);
    expect(mockSendAfter).toHaveBeenCalledWith(
      queueName,
      {
        auto_word_reminder_id: autoWordReminder.id,
      },
      {},
      new Date(0)
    );
  });

  it("calls the functions to create the auto word reminder and does not create word reminder when 'create_now' is false", async () => {
    const mockAutoWordReminderCreate = jest
      .spyOn(autoWordReminderQueries, "create")
      .mockResolvedValue(autoWordReminder);
    const mockSendAfter = jest
      .spyOn(boss, "sendAfter")
      .mockImplementation(jest.fn());
    jest.spyOn(global.Date, "now").mockImplementation(() => {
      return new Date(0).valueOf();
    });

    const response = await request(app)
      .post(`/api/users/${userId}/autoWordReminders`)
      .set("Accept", "application/json")
      .send({ ...autoWordReminderParams, create_now: false });

    const queueName = `${userId}-${queuePostfix}`;
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      autoWordReminder: {
        ...autoWordReminder,
        created_at: autoWordReminder.created_at.toISOString(),
        updated_at: autoWordReminder.updated_at.toISOString(),
      },
    });
    expect(mockAutoWordReminderCreate).toHaveBeenCalledTimes(1);
    expect(mockAutoWordReminderCreate).toHaveBeenCalledWith(
      autoWordReminderParams
    );
    expect(mockSendAfter).toHaveBeenCalledTimes(1);
    expect(mockSendAfter).toHaveBeenCalledWith(
      queueName,
      {
        auto_word_reminder_id: autoWordReminder.id,
      },
      {},
      new Date(autoWordReminderParams.duration)
    );
  });
});
