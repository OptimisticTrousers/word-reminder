import { SortMode } from "common";
import express from "express";
import request from "supertest";

import { update_auto_word_reminder } from "../controllers/auto_word_reminder_controller";
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
app.put(
  "/api/users/:userId/autoWordReminders/:autoWordReminderId",
  update_auto_word_reminder
);

describe("update_auto_word_reminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to create the auto word reminder and create word reminder when 'create_now' is true", async () => {
    const mockAutoWordReminderUpdateById = jest
      .spyOn(autoWordReminderQueries, "updateById")
      .mockResolvedValue(autoWordReminder);
    const mockPurgeQueue = jest
      .spyOn(boss, "purgeQueue")
      .mockImplementation(jest.fn());
    const mockSendAfter = jest
      .spyOn(boss, "sendAfter")
      .mockImplementation(jest.fn());
    jest.spyOn(global.Date, "now").mockImplementation(() => {
      return new Date(0).valueOf();
    });

    const response = await request(app)
      .put(`/api/users/${userId}/autoWordReminders/${autoWordReminder.id}`)
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
    expect(mockAutoWordReminderUpdateById).toHaveBeenCalledTimes(1);
    expect(mockAutoWordReminderUpdateById).toHaveBeenCalledWith(
      autoWordReminder.id,
      {
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        has_learned_words: autoWordReminder.has_learned_words,
        sort_mode: autoWordReminder.sort_mode,
        word_count: autoWordReminder.word_count,
        duration: autoWordReminder.duration,
        reminder: autoWordReminder.reminder,
      }
    );
    expect(mockPurgeQueue).toHaveBeenCalledTimes(1);
    expect(mockPurgeQueue).toHaveBeenCalledWith(queueName);
    expect(mockSendAfter).toHaveBeenCalledTimes(1);
    expect(mockSendAfter).toHaveBeenCalledWith(
      queueName,
      {
        duration: autoWordReminderParams.duration,
        has_learned_words: autoWordReminderParams.has_learned_words,
        has_reminder_onload: autoWordReminderParams.has_reminder_onload,
        is_active: autoWordReminderParams.is_active,
        reminder: autoWordReminderParams.reminder,
        sort_mode: autoWordReminderParams.sort_mode,
        word_count: autoWordReminderParams.word_count,
        userId: autoWordReminderParams.user_id,
        create_now: true,
      },
      {},
      new Date(0)
    );
  });

  it("calls the functions to create the auto word reminder and does create word reminder when 'create_now' is false", async () => {
    const mockAutoWordReminderUpdateById = jest
      .spyOn(autoWordReminderQueries, "updateById")
      .mockResolvedValue(autoWordReminder);
    const mockPurgeQueue = jest
      .spyOn(boss, "purgeQueue")
      .mockImplementation(jest.fn());
    const mockSendAfter = jest
      .spyOn(boss, "sendAfter")
      .mockImplementation(jest.fn());
    jest.spyOn(global.Date, "now").mockImplementation(() => {
      return new Date(0).valueOf();
    });

    const response = await request(app)
      .put(`/api/users/${userId}/autoWordReminders/${autoWordReminder.id}`)
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
    expect(mockAutoWordReminderUpdateById).toHaveBeenCalledTimes(1);
    expect(mockAutoWordReminderUpdateById).toHaveBeenCalledWith(
      autoWordReminder.id,
      {
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        has_learned_words: autoWordReminder.has_learned_words,
        sort_mode: autoWordReminder.sort_mode,
        word_count: autoWordReminder.word_count,
        duration: autoWordReminder.duration,
        reminder: autoWordReminder.reminder,
      }
    );
    expect(mockPurgeQueue).toHaveBeenCalledTimes(1);
    expect(mockPurgeQueue).toHaveBeenCalledWith(queueName);
    expect(mockSendAfter).toHaveBeenCalledTimes(1);
    expect(mockSendAfter).toHaveBeenCalledWith(
      queueName,
      {
        duration: autoWordReminderParams.duration,
        has_learned_words: autoWordReminderParams.has_learned_words,
        has_reminder_onload: autoWordReminderParams.has_reminder_onload,
        is_active: autoWordReminderParams.is_active,
        reminder: autoWordReminderParams.reminder,
        sort_mode: autoWordReminderParams.sort_mode,
        word_count: autoWordReminderParams.word_count,
        userId: autoWordReminderParams.user_id,
        create_now: false,
      },
      {},
      new Date(autoWordReminderParams.duration)
    );
  });
});
