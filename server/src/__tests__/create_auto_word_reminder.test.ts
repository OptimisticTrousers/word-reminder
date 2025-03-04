import { SortMode } from "common";
import express from "express";
import request from "supertest";
import { Job } from "pg-boss";

import { create_auto_word_reminder } from "../controllers/auto_word_reminder_controller";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { boss } from "../db/boss";
import * as wordReminders from "../utils/word_reminder";
import { userWordQueries } from "../db/user_word_queries";

jest.spyOn(global.Date, "now").mockImplementation(() => {
  return new Date(0).valueOf();
});

const userId = 1;

const wordReminderId = 1;
const wordReminderParams = {
  user_id: userId,
  finish: new Date(),
  is_active: true,
  reminder: "* * * * *",
  has_reminder_onload: true,
  created_at: new Date(),
  updated_at: new Date(),
};

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

const userWords = [userWord1, userWord2, userWord3];

const queueName = `${userId}-auto-word-reminder-queue`;

const app = express();
app.use(express.json());
app.post("/api/users/:userId/autoWordReminders", create_auto_word_reminder);

describe("create_auto_word_reminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when 'create_now' is true", () => {
    it("calls the functions to create the auto word reminder", async () => {
      const mockAutoWordReminderCreate = jest
        .spyOn(autoWordReminderQueries, "create")
        .mockResolvedValue(autoWordReminder);

      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockCreateWordReminder = jest
        .spyOn(wordReminders, "createWordReminder")
        .mockResolvedValue({
          ...wordReminderParams,
          id: wordReminderId,
        });
      const mockSendAfter = jest
        .spyOn(boss, "sendAfter")
        .mockImplementation(jest.fn());
      let capturedCallback: any = async function (jobs: Job<unknown>[]) {};
      const mockWork = jest
        .spyOn(boss, "work")
        .mockImplementation(async (queueName, callback) => {
          capturedCallback = callback;
          capturedCallback();
          return "";
        });
      jest.spyOn(global.Date, "now").mockImplementation(() => {
        return new Date(0).valueOf();
      });

      const response = await request(app)
        .post(`/api/users/${userId}/autoWordReminders`)
        .set("Accept", "application/json")
        .send({ ...autoWordReminderParams, create_now: true });

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
      expect(mockUserWordGetByUserWords).toHaveBeenCalledTimes(2);
      expect(mockUserWordGetByUserWords).toHaveBeenCalledWith({
        user_id: userId,
        word_count: autoWordReminderParams.word_count,
        has_learned_words: autoWordReminderParams.has_learned_words,
        sort_mode: autoWordReminderParams.sort_mode,
      });
      expect(mockUserWordGetByUserWords).toHaveBeenCalledWith({
        user_id: userId,
        word_count: autoWordReminderParams.word_count,
        has_learned_words: autoWordReminderParams.has_learned_words,
        sort_mode: autoWordReminderParams.sort_mode,
      });
      expect(mockCreateWordReminder).toHaveBeenCalledTimes(2);
      expect(mockCreateWordReminder).toHaveBeenCalledWith({
        user_id: userId,
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        reminder: autoWordReminder.reminder,
        finish: new Date(autoWordReminderParams.duration),
        user_word_ids: [userWord1.id, userWord2.id, userWord3.id],
      });
      expect(mockCreateWordReminder).toHaveBeenCalledWith({
        user_id: userId,
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        reminder: autoWordReminder.reminder,
        finish: new Date(autoWordReminderParams.duration),
        user_word_ids: [userWord1.id, userWord2.id, userWord3.id],
      });
      expect(mockSendAfter).toHaveBeenCalledTimes(1);
      expect(mockSendAfter).toHaveBeenCalledWith(
        queueName,
        {},
        {},
        new Date(autoWordReminderParams.duration)
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    });
  });

  describe("when 'create_now' is false", () => {
    it("calls the functions to create the auto word reminder", async () => {
      const mockAutoWordReminderCreate = jest
        .spyOn(autoWordReminderQueries, "create")
        .mockResolvedValue(autoWordReminder);

      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockCreateWordReminder = jest
        .spyOn(wordReminders, "createWordReminder")
        .mockResolvedValue({
          ...wordReminderParams,
          id: wordReminderId,
        });
      const mockSendAfter = jest
        .spyOn(boss, "sendAfter")
        .mockImplementation(jest.fn());
      let capturedCallback: any = async function (jobs: Job<unknown>[]) {};
      const mockWork = jest
        .spyOn(boss, "work")
        .mockImplementation(async (queueName, callback) => {
          capturedCallback = callback;
          capturedCallback([]);
          return "";
        });

      const response = await request(app)
        .post(`/api/users/${userId}/autoWordReminders`)
        .set("Accept", "application/json")
        .send({ ...autoWordReminderParams, create_now: false });

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
      expect(mockUserWordGetByUserWords).toHaveBeenCalledTimes(1);
      expect(mockUserWordGetByUserWords).toHaveBeenCalledWith({
        user_id: userId,
        word_count: autoWordReminderParams.word_count,
        has_learned_words: autoWordReminderParams.has_learned_words,
        sort_mode: autoWordReminderParams.sort_mode,
      });
      expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
      expect(mockCreateWordReminder).toHaveBeenCalledWith({
        user_id: userId,
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        reminder: autoWordReminder.reminder,
        finish: new Date(autoWordReminderParams.duration),
        user_word_ids: [userWord1.id, userWord2.id, userWord3.id],
      });
      expect(mockSendAfter).toHaveBeenCalledTimes(1);
      expect(mockSendAfter).toHaveBeenCalledWith(
        queueName,
        {},
        {},
        new Date(autoWordReminderParams.duration)
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    });
  });
});
