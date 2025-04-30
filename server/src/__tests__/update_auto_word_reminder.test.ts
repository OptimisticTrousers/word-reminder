import { SortMode } from "common";
import express from "express";
import request from "supertest";

import { update_auto_word_reminder } from "../controllers/auto_word_reminder_controller";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { boss } from "../db/boss";
import * as wordReminders from "../utils/word_reminder";
import { userWordQueries } from "../db/user_word_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";

jest.spyOn(global.Date, "now").mockImplementation(() => {
  return new Date(0).valueOf();
});

const userId = 1;

const wordReminderParams = {
  user_id: userId,
  finish: new Date(),
  is_active: true,
  reminder: "* * * * *",
  has_reminder_onload: true,
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

const wordReminder = {
  id: 1,
  ...wordReminderParams,
  created_at: new Date(),
  updated_at: new Date(),
};
const userWordsWordReminders1 = {
  id: 1,
  word_reminder_id: wordReminder.id,
  user_word_id: userWord1.id,
};
const userWordsWordReminders2 = {
  id: 2,
  word_reminder_id: wordReminder.id,
  user_word_id: userWord2.id,
};

const userWords = [userWord1, userWord2];

const queuePostfix = "auto-word-reminder-queue";
const wordReminderQueuePostfix = "word-reminder-queue";

const app = express();
app.use(express.json());
app.put(
  "/api/users/:userId/autoWordReminders/:autoWordReminderId",
  (req, res, next) => {
    const userId = req.params.userId;
    res.locals.queueName = `${userId}-${queuePostfix}`;
    next();
  },
  update_auto_word_reminder
);

describe("update_auto_word_reminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when 'create_now' is true", () => {
    it("calls the functions to create the auto word reminder", async () => {
      const mockAutoWordReminderUpdateById = jest
        .spyOn(autoWordReminderQueries, "updateById")
        .mockResolvedValue(autoWordReminder);
      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockUserWordsWordRemindersCreate = jest
        .spyOn(userWordsWordRemindersQueries, "create")
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2)
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2);
      const mockWordReminderCreate = jest
        .spyOn(wordReminderQueries, "create")
        .mockResolvedValue(wordReminder);
      const mockPurgeQueue = jest
        .spyOn(boss, "purgeQueue")
        .mockImplementation(jest.fn());
      const mockSchedule = jest
        .spyOn(boss, "schedule")
        .mockImplementation(jest.fn());
      let capturedCallback: any;
      const workerId = "1";
      const mockWork = jest
        .spyOn(boss, "work")
        .mockImplementation(async (queueName, options, callback) => {
          capturedCallback = callback;
          // callback not called for test
          return workerId;
        });
      const mockNotifyWorker = jest
        .spyOn(boss, "notifyWorker")
        .mockImplementation(jest.fn());
      const mockScheduleWordReminder = jest
        .spyOn(wordReminders, "scheduleWordReminder")
        .mockImplementation(jest.fn());
      const mockOffWork = jest
        .spyOn(boss, "offWork")
        .mockImplementation(jest.fn());
      const mockDeactivate = jest
        .spyOn(wordReminderQueries, "deactivate")
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
      expect(mockUserWordGetByUserWords).toHaveBeenCalledTimes(1);
      expect(mockUserWordGetByUserWords).toHaveBeenCalledWith({
        user_id: userId,
        word_count: autoWordReminderParams.word_count,
        has_learned_words: autoWordReminderParams.has_learned_words,
        sort_mode: autoWordReminderParams.sort_mode,
      });
      expect(mockWordReminderCreate).toHaveBeenCalledTimes(1);
      expect(mockWordReminderCreate).toHaveBeenCalledWith({
        ...wordReminderParams,
        finish: new Date(autoWordReminderParams.duration),
      });
      expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledTimes(2);
      expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledWith({
        user_word_id: userWordsWordReminders1.user_word_id,
        word_reminder_id: userWordsWordReminders1.word_reminder_id,
      });
      expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledWith({
        user_word_id: userWordsWordReminders2.user_word_id,
        word_reminder_id: userWordsWordReminders2.word_reminder_id,
      });
      expect(mockScheduleWordReminder).toHaveBeenCalledTimes(1);
      expect(mockScheduleWordReminder).toHaveBeenCalledWith({
        user_id: String(userId),
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        user_words: [userWord1, userWord2],
        reminder: autoWordReminder.reminder,
        finish: new Date(autoWordReminder.duration),
        queueName,
        word_reminder_id: wordReminder.id,
      });
      expect(mockPurgeQueue).toHaveBeenCalledTimes(1);
      expect(mockPurgeQueue).toHaveBeenCalledWith(queueName);
      expect(mockSchedule).toHaveBeenCalledTimes(1);
      expect(mockSchedule).toHaveBeenCalledWith(
        queueName,
        autoWordReminder.reminder
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(
        queueName,
        {
          pollingIntervalSeconds: Math.round(autoWordReminder.duration / 1000),
        },
        capturedCallback
      );
      expect(mockNotifyWorker).toHaveBeenCalledTimes(1);
      expect(mockNotifyWorker).toHaveBeenCalledWith(workerId);
      expect(mockDeactivate).not.toHaveBeenCalled();
      expect(mockOffWork).not.toHaveBeenCalled();
    });

    it("calls the functions inside of scheduled work callback", async () => {
      const mockAutoWordReminderUpdateById = jest
        .spyOn(autoWordReminderQueries, "updateById")
        .mockResolvedValue(autoWordReminder);
      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockUserWordsWordRemindersCreate = jest
        .spyOn(userWordsWordRemindersQueries, "create")
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2)
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2);
      const mockWordReminderCreate = jest
        .spyOn(wordReminderQueries, "create")
        .mockResolvedValue(wordReminder);
      const mockPurgeQueue = jest
        .spyOn(boss, "purgeQueue")
        .mockImplementation(jest.fn());
      const mockSchedule = jest
        .spyOn(boss, "schedule")
        .mockImplementation(jest.fn());
      let capturedCallback: any;
      const workerId = "1";
      const mockWork = jest
        .spyOn(boss, "work")
        .mockImplementation(async (queueName, options, callback) => {
          capturedCallback = callback;
          capturedCallback();
          return workerId;
        });
      const mockScheduleWordReminder = jest
        .spyOn(wordReminders, "scheduleWordReminder")
        .mockImplementation(jest.fn());
      const mockNotifyWorker = jest
        .spyOn(boss, "notifyWorker")
        .mockImplementation(jest.fn());
      const mockOffWork = jest
        .spyOn(boss, "offWork")
        .mockImplementation(jest.fn());
      const mockDeactivate = jest
        .spyOn(wordReminderQueries, "deactivate")
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
      expect(mockWordReminderCreate).toHaveBeenCalledTimes(2);
      expect(mockWordReminderCreate).toHaveBeenNthCalledWith(1, {
        ...wordReminderParams,
        finish: new Date(autoWordReminderParams.duration),
      });
      expect(mockWordReminderCreate).toHaveBeenNthCalledWith(2, {
        ...wordReminderParams,
        finish: new Date(autoWordReminderParams.duration),
      });
      expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledTimes(4);
      expect(mockUserWordsWordRemindersCreate).toHaveBeenNthCalledWith(1, {
        user_word_id: userWordsWordReminders1.user_word_id,
        word_reminder_id: userWordsWordReminders1.word_reminder_id,
      });
      expect(mockUserWordsWordRemindersCreate).toHaveBeenNthCalledWith(2, {
        user_word_id: userWordsWordReminders2.user_word_id,
        word_reminder_id: userWordsWordReminders2.word_reminder_id,
      });
      expect(mockUserWordsWordRemindersCreate).toHaveBeenNthCalledWith(3, {
        user_word_id: userWordsWordReminders1.user_word_id,
        word_reminder_id: userWordsWordReminders1.word_reminder_id,
      });
      expect(mockUserWordsWordRemindersCreate).toHaveBeenNthCalledWith(4, {
        user_word_id: userWordsWordReminders2.user_word_id,
        word_reminder_id: userWordsWordReminders2.word_reminder_id,
      });
      expect(mockScheduleWordReminder).toHaveBeenCalledTimes(2);
      expect(mockScheduleWordReminder).toHaveBeenNthCalledWith(1, {
        user_id: String(userId),
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        user_words: [userWord1, userWord2],
        reminder: autoWordReminder.reminder,
        finish: new Date(Date.now() + autoWordReminder.duration),
        queueName,
        word_reminder_id: wordReminder.id,
      });
      expect(mockScheduleWordReminder).toHaveBeenNthCalledWith(2, {
        user_id: String(userId),
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        user_words: [userWord1, userWord2],
        reminder: autoWordReminder.reminder,
        finish: new Date(Date.now() + autoWordReminder.duration),
        queueName,
        word_reminder_id: wordReminder.id,
      });
      expect(mockPurgeQueue).toHaveBeenCalledTimes(1);
      expect(mockPurgeQueue).toHaveBeenCalledWith(queueName);
      expect(mockSchedule).toHaveBeenCalledTimes(1);
      expect(mockSchedule).toHaveBeenCalledWith(
        queueName,
        autoWordReminder.reminder
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(
        queueName,
        {
          pollingIntervalSeconds: Math.round(autoWordReminder.duration / 1000),
        },
        capturedCallback
      );
      expect(mockNotifyWorker).toHaveBeenCalledTimes(1);
      expect(mockNotifyWorker).toHaveBeenCalledWith(workerId);
      expect(mockDeactivate).toHaveBeenCalledTimes(1);
      expect(mockDeactivate).toHaveBeenCalledWith();
      expect(mockOffWork).toHaveBeenCalledTimes(1);
      expect(mockOffWork).toHaveBeenCalledWith(
        `${userId}-${wordReminderQueuePostfix}`
      );
    });
  });

  describe("when 'create_now' is false", () => {
    it("calls the functions to create the auto word reminder", async () => {
      const mockAutoWordReminderUpdateById = jest
        .spyOn(autoWordReminderQueries, "updateById")
        .mockResolvedValue(autoWordReminder);
      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockWordReminderCreate = jest
        .spyOn(wordReminderQueries, "create")
        .mockResolvedValue(wordReminder);
      const mockUserWordsWordRemindersCreate = jest
        .spyOn(userWordsWordRemindersQueries, "create")
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2)
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2);
      const mockPurgeQueue = jest
        .spyOn(boss, "purgeQueue")
        .mockImplementation(jest.fn());
      const mockSchedule = jest
        .spyOn(boss, "schedule")
        .mockImplementation(jest.fn());
      let capturedCallback: any;
      const workerId = "1";
      const mockWork = jest
        .spyOn(boss, "work")
        .mockImplementation(async (queueName, options, callback) => {
          capturedCallback = callback;
          return workerId;
        });
      const mockScheduleWordReminder = jest
        .spyOn(wordReminders, "scheduleWordReminder")
        .mockImplementation(jest.fn());
      const mockNotifyWorker = jest
        .spyOn(boss, "notifyWorker")
        .mockImplementation(jest.fn());
      const mockOffWork = jest
        .spyOn(boss, "offWork")
        .mockImplementation(jest.fn());
      const mockDeactivate = jest
        .spyOn(wordReminderQueries, "deactivate")
        .mockImplementation(jest.fn());

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
      expect(mockSchedule).toHaveBeenCalledTimes(1);
      expect(mockSchedule).toHaveBeenCalledWith(
        queueName,
        autoWordReminder.reminder
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(
        queueName,
        {
          pollingIntervalSeconds: Math.round(autoWordReminder.duration / 1000),
        },
        capturedCallback
      );
      expect(mockUserWordGetByUserWords).not.toHaveBeenCalled();
      expect(mockWordReminderCreate).not.toHaveBeenCalled();
      expect(mockUserWordsWordRemindersCreate).not.toHaveBeenCalled();
      expect(mockScheduleWordReminder).not.toHaveBeenCalled();
      expect(mockNotifyWorker).not.toHaveBeenCalled();
      expect(mockDeactivate).not.toHaveBeenCalled();
      expect(mockOffWork).not.toHaveBeenCalled();
    });

    it("calls the functions inside of scheduled work callback", async () => {
      const mockAutoWordReminderUpdateById = jest
        .spyOn(autoWordReminderQueries, "updateById")
        .mockResolvedValue(autoWordReminder);
      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockWordReminderCreate = jest
        .spyOn(wordReminderQueries, "create")
        .mockResolvedValue(wordReminder);
      const mockUserWordsWordRemindersCreate = jest
        .spyOn(userWordsWordRemindersQueries, "create")
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2)
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2);
      const mockPurgeQueue = jest
        .spyOn(boss, "purgeQueue")
        .mockImplementation(jest.fn());
      const mockSchedule = jest
        .spyOn(boss, "schedule")
        .mockImplementation(jest.fn());
      let capturedCallback: any;
      const workerId = "1";
      const mockWork = jest
        .spyOn(boss, "work")
        .mockImplementation(async (queueName, options, callback) => {
          capturedCallback = callback;
          capturedCallback([]);
          return workerId;
        });
      const mockScheduleWordReminder = jest
        .spyOn(wordReminders, "scheduleWordReminder")
        .mockImplementation(jest.fn());
      const mockNotifyWorker = jest
        .spyOn(boss, "notifyWorker")
        .mockImplementation(jest.fn());
      const mockOffWork = jest
        .spyOn(boss, "offWork")
        .mockImplementation(jest.fn());
      const mockDeactivate = jest
        .spyOn(wordReminderQueries, "deactivate")
        .mockImplementation(jest.fn());

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
      expect(mockUserWordGetByUserWords).toHaveBeenCalledTimes(1);
      expect(mockUserWordGetByUserWords).toHaveBeenCalledWith({
        user_id: userId,
        word_count: autoWordReminderParams.word_count,
        has_learned_words: autoWordReminderParams.has_learned_words,
        sort_mode: autoWordReminderParams.sort_mode,
      });
      expect(mockWordReminderCreate).toHaveBeenCalledTimes(1);
      expect(mockWordReminderCreate).toHaveBeenCalledWith({
        ...wordReminderParams,
        finish: new Date(autoWordReminder.duration),
      });
      expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledTimes(2);
      expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledWith({
        user_word_id: userWordsWordReminders1.user_word_id,
        word_reminder_id: userWordsWordReminders1.word_reminder_id,
      });
      expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledWith({
        user_word_id: userWordsWordReminders2.user_word_id,
        word_reminder_id: userWordsWordReminders2.word_reminder_id,
      });
      expect(mockScheduleWordReminder).toHaveBeenCalledTimes(1);
      expect(mockScheduleWordReminder).toHaveBeenCalledWith({
        user_id: String(userId),
        is_active: autoWordReminder.is_active,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        user_words: [userWord1, userWord2],
        reminder: autoWordReminder.reminder,
        finish: new Date(autoWordReminder.duration),
        queueName,
        word_reminder_id: wordReminder.id,
      });
      expect(mockPurgeQueue).toHaveBeenCalledTimes(1);
      expect(mockPurgeQueue).toHaveBeenCalledWith(queueName);
      expect(mockSchedule).toHaveBeenCalledTimes(1);
      expect(mockSchedule).toHaveBeenCalledWith(
        queueName,
        autoWordReminder.reminder
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(
        queueName,
        {
          pollingIntervalSeconds: Math.round(autoWordReminder.duration / 1000),
        },
        capturedCallback
      );
      expect(mockDeactivate).toHaveBeenCalledTimes(1);
      expect(mockDeactivate).toHaveBeenCalledWith();
      expect(mockOffWork).toHaveBeenCalledTimes(1);
      expect(mockOffWork).toHaveBeenCalledWith(
        `${userId}-${wordReminderQueuePostfix}`
      );
      expect(mockNotifyWorker).not.toHaveBeenCalled();
    });
  });
});
