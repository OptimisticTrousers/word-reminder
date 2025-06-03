/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import request from "supertest";

import { boss } from "../db/boss";
import { SortMode } from "common";
import { userWordQueries } from "../db/user_word_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { wordQueries } from "../db/word_queries";
import { subscriptionQueries } from "../db/subscription_queries";
import * as triggerWebPush from "../utils/trigger_web_push_msg";
import { tokenQueries } from "../db/token_queries";
import { Job } from "pg-boss";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { createWorkers } from "../middleware/create_workers";

const userId = 1;
const subscription1 = {
  id: 1,
  userId,
  endpoint: "https://random-push-service.com/unique-id-1234/",
  p256dh:
    "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
  auth: "tBHItJI5svbpez7KI4CCXg==",
};
const wordReminderParams = {
  user_id: userId,
  finish: new Date(10),
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

const word1 = {
  id: 1,
  details: [
    {
      word: "hello",
      phonetics: [
        {
          text: "hɛˈləʊ",
        },
      ],
      meanings: [
        {
          partOfSpeech: "exclamation",
          definitions: [
            {
              definition:
                "used as a greeting or to begin a phone conversation.",
              example: "hello there, Katie!",
              synonyms: [],
              antonyms: [],
            },
          ],
        },
      ],
    },
  ],
  created_at: new Date(),
};
const word2 = {
  id: 2,
  details: [
    {
      word: "clemency",
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [{ definition: "Mercy; lenience." }],
        },
      ],
      phonetics: [],
    },
  ],
  created_at: new Date(),
};
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

describe("createWorkers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const autoWordReminderQueueName = "auto-word-reminder-queue";
  const wordReminderQueueName = "word-reminder-queue";
  const emailQueueName = "email-queue";

  describe("when the queue is for auto word reminders", () => {
    it("setups worker for auto word reminders", async () => {
      const message = "Success!";
      const app = express();
      app.use(createWorkers);
      app.post("/api", (req, res) => {
        res.json({ message });
      });
      const mockCreateQueue = jest
        .spyOn(boss, "createQueue")
        .mockImplementation(jest.fn());
      const mockWork = jest.spyOn(boss, "work").mockImplementation(jest.fn());
      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockWordReminderCreate = jest
        .spyOn(wordReminderQueries, "create")
        .mockResolvedValue(wordReminder);
      const mockUserWordsWordRemindersCreate = jest
        .spyOn(userWordsWordRemindersQueries, "create")
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2);
      const mockUserWordQueriesGetById = jest
        .spyOn(userWordQueries, "getById")
        .mockResolvedValueOnce(userWord1)
        .mockResolvedValueOnce(userWord2);
      const mockWordQueriesGetById = jest
        .spyOn(wordQueries, "getById")
        .mockResolvedValueOnce(word1)
        .mockResolvedValueOnce(word2);
      const mockSchedule = jest
        .spyOn(boss, "schedule")
        .mockImplementation(jest.fn());
      const mockSendAfter = jest
        .spyOn(boss, "sendAfter")
        .mockImplementation(jest.fn());
      jest.spyOn(global.Date, "now").mockImplementation(() => {
        return new Date(0).valueOf();
      });

      const response = await request(app)
        .post("/api")
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message });
      expect(mockCreateQueue).toHaveBeenCalledTimes(3);
      expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
      expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
      expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
      expect(mockWork).toHaveBeenCalledTimes(3);
      expect(mockWork).toHaveBeenCalledWith(
        autoWordReminderQueueName,
        expect.any(Function)
      );
      expect(mockWork).toHaveBeenCalledWith(
        wordReminderQueueName,
        expect.any(Function)
      );
      expect(mockWork).toHaveBeenCalledWith(
        emailQueueName,
        expect.any(Function)
      );
      expect(mockUserWordGetByUserWords).not.toHaveBeenCalled();
      expect(mockWordReminderCreate).not.toHaveBeenCalled();
      expect(mockUserWordsWordRemindersCreate).not.toHaveBeenCalled();
      expect(mockUserWordQueriesGetById).not.toHaveBeenCalled();
      expect(mockWordQueriesGetById).not.toHaveBeenCalled();
      expect(mockSchedule).not.toHaveBeenCalled();
      expect(mockSendAfter).not.toHaveBeenCalled();
    });

    describe("calls functions inside of worker callback", () => {
      it("completes job when auto word reminder is undefined", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  create_now: true,
                  auto_word_reminder_id: autoWordReminder.id,
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce(jest.fn());
        const mockAutoWordReminderGetById = jest
          .spyOn(autoWordReminderQueries, "getById")
          .mockResolvedValue(undefined);
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockUserWordGetByUserWords = jest
          .spyOn(userWordQueries, "getUserWords")
          .mockResolvedValue(userWords);
        const mockWordReminderCreate = jest
          .spyOn(wordReminderQueries, "create")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordRemindersCreate = jest
          .spyOn(userWordsWordRemindersQueries, "create")
          .mockResolvedValueOnce(userWordsWordReminders1)
          .mockResolvedValueOnce(userWordsWordReminders2);
        const mockUserWordQueriesGetById = jest
          .spyOn(userWordQueries, "getById")
          .mockResolvedValueOnce(userWord1)
          .mockResolvedValueOnce(userWord2);
        const mockWordQueriesGetById = jest
          .spyOn(wordQueries, "getById")
          .mockResolvedValueOnce(word1)
          .mockResolvedValueOnce(word2);
        const mockSchedule = jest
          .spyOn(boss, "schedule")
          .mockImplementation(jest.fn());
        const mockSendAfter = jest
          .spyOn(boss, "sendAfter")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockAutoWordReminderGetById).toHaveBeenCalledTimes(1);
        expect(mockAutoWordReminderGetById).toHaveBeenCalledWith(
          autoWordReminder.id
        );
        expect(mockComplete).toHaveBeenCalledTimes(1);
        expect(mockComplete).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          jobId
        );
        expect(mockUserWordGetByUserWords).not.toHaveBeenCalled();
        expect(mockWordReminderCreate).not.toHaveBeenCalled();
        expect(mockUserWordsWordRemindersCreate).not.toHaveBeenCalled();
        expect(mockUserWordQueriesGetById).not.toHaveBeenCalled();
        expect(mockWordQueriesGetById).not.toHaveBeenCalled();
        expect(mockSchedule).not.toHaveBeenCalled();
        expect(mockSendAfter).not.toHaveBeenCalled();
      });

      it("calls function to schedule word reminder creation", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  auto_word_reminder_id: autoWordReminder.id,
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce(jest.fn());
        const mockAutoWordReminderGetById = jest
          .spyOn(autoWordReminderQueries, "getById")
          .mockResolvedValue(autoWordReminder);
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockUserWordGetByUserWords = jest
          .spyOn(userWordQueries, "getUserWords")
          .mockResolvedValue(userWords);
        const mockWordReminderCreate = jest
          .spyOn(wordReminderQueries, "create")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordRemindersCreate = jest
          .spyOn(userWordsWordRemindersQueries, "create")
          .mockResolvedValueOnce(userWordsWordReminders1)
          .mockResolvedValueOnce(userWordsWordReminders2);
        const mockUserWordQueriesGetById = jest
          .spyOn(userWordQueries, "getById")
          .mockResolvedValueOnce(userWord1)
          .mockResolvedValueOnce(userWord2);
        const mockWordQueriesGetById = jest
          .spyOn(wordQueries, "getById")
          .mockResolvedValueOnce(word1)
          .mockResolvedValueOnce(word2);
        const mockSchedule = jest
          .spyOn(boss, "schedule")
          .mockImplementation(jest.fn());
        const mockSendAfter = jest
          .spyOn(boss, "sendAfter")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockAutoWordReminderGetById).toHaveBeenCalledTimes(1);
        expect(mockAutoWordReminderGetById).toHaveBeenCalledWith(
          autoWordReminder.id
        );
        expect(mockComplete).not.toHaveBeenCalled();
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
        expect(mockUserWordQueriesGetById).toHaveBeenCalledTimes(2);
        expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord1.id);
        expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord2.id);
        expect(mockWordQueriesGetById).toHaveBeenCalledTimes(2);
        expect(mockWordQueriesGetById).toHaveBeenCalledWith(word1.id);
        expect(mockWordQueriesGetById).toHaveBeenCalledWith(word2.id);
        expect(mockSchedule).toHaveBeenCalledTimes(1);
        expect(mockSchedule).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          autoWordReminderParams.reminder,
          {
            word_reminder_id: wordReminder.id,
            user_id: userId,
            words: [word1.details[0].word, word2.details[0].word],
            finish: new Date(autoWordReminderParams.duration),
            has_reminder_onload: autoWordReminderParams.has_reminder_onload,
            reminder: autoWordReminderParams.reminder,
          }
        );
        expect(mockSendAfter).toHaveBeenCalledTimes(1);
        expect(mockSendAfter).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          {
            auto_word_reminder_id: autoWordReminder.id,
          },
          {},
          new Date(autoWordReminderParams.duration)
        );
      });
    });
  });

  describe("when the queue is for word reminders", () => {
    it("setups worker for auto word reminders", async () => {
      const message = "Success!";
      const app = express();
      app.use(createWorkers);
      app.post("/api", (req, res) => {
        res.json({ message });
      });
      const mockCreateQueue = jest
        .spyOn(boss, "createQueue")
        .mockImplementation(jest.fn());
      const mockWork = jest.spyOn(boss, "work").mockImplementation(jest.fn());
      const mockWordRemindersGetById = jest
        .spyOn(wordReminderQueries, "getById")
        .mockResolvedValue(wordReminder);
      const mockComplete = jest
        .spyOn(boss, "complete")
        .mockImplementation(jest.fn());
      const mockWordReminderUpdateById = jest
        .spyOn(wordReminderQueries, "updateById")
        .mockResolvedValue(wordReminder);
      const mockUserWordsWordReminderGetByWordReminderId = jest
        .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
        .mockResolvedValue({
          ...wordReminder,
          user_words: [
            {
              details: word1.details,
              learned: userWord1.learned,
            },
            {
              details: word2.details,
              learned: userWord2.learned,
            },
          ],
        });
      const mockSubscriptionQueriesGetByUserId = jest
        .spyOn(subscriptionQueries, "getByUserId")
        .mockResolvedValue(subscription1);
      const mockTriggerWebPushMsg = jest
        .spyOn(triggerWebPush, "triggerWebPushMsg")
        .mockImplementation(jest.fn());
      jest.spyOn(global.Date, "now").mockImplementation(() => {
        return new Date(0).valueOf();
      });

      const response = await request(app)
        .post("/api")
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message });
      expect(mockCreateQueue).toHaveBeenCalledTimes(3);
      expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
      expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
      expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
      expect(mockWork).toHaveBeenCalledTimes(3);
      expect(mockWork).toHaveBeenCalledWith(
        autoWordReminderQueueName,
        expect.any(Function)
      );
      expect(mockWork).toHaveBeenCalledWith(
        wordReminderQueueName,
        expect.any(Function)
      );
      expect(mockWork).toHaveBeenCalledWith(
        emailQueueName,
        expect.any(Function)
      );
      expect(mockWordRemindersGetById).not.toHaveBeenCalled();
      expect(mockComplete).not.toHaveBeenCalled();
      expect(mockWordReminderUpdateById).not.toHaveBeenCalled();
      expect(
        mockUserWordsWordReminderGetByWordReminderId
      ).not.toHaveBeenCalled();
      expect(mockSubscriptionQueriesGetByUserId).not.toHaveBeenCalled();
      expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
    });

    describe("calls functions inside of worker callback", () => {
      it("completes job when word reminder is undefined", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  word_reminder_id: wordReminder.id,
                  reminder: wordReminder.reminder,
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn());
        const mockWordRemindersGetById = jest
          .spyOn(wordReminderQueries, "getById")
          .mockResolvedValue(undefined);
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockWordReminderUpdateById = jest
          .spyOn(wordReminderQueries, "updateById")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordReminderGetByWordReminderId = jest
          .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
          .mockResolvedValue({
            ...wordReminder,
            user_words: [
              {
                details: word1.details,
                learned: userWord1.learned,
              },
              {
                details: word2.details,
                learned: userWord2.learned,
              },
            ],
          });
        const mockSubscriptionQueriesGetByUserId = jest
          .spyOn(subscriptionQueries, "getByUserId")
          .mockResolvedValue(subscription1);
        const mockTriggerWebPushMsg = jest
          .spyOn(triggerWebPush, "triggerWebPushMsg")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockWordRemindersGetById).toHaveBeenCalledTimes(1);
        expect(mockWordRemindersGetById).toHaveBeenCalledWith(wordReminder.id);
        expect(mockComplete).toHaveBeenCalledTimes(1);
        expect(mockComplete).toHaveBeenCalledWith(wordReminderQueueName, jobId);
        expect(mockWordReminderUpdateById).not.toHaveBeenCalled();
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).not.toHaveBeenCalled();
        expect(mockSubscriptionQueriesGetByUserId).not.toHaveBeenCalled();
        expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
      });

      it("completes job when word reminder reminder is different from the reminder sent through the data for when the word reminder is updated", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  word_reminder_id: wordReminder.id,
                  reminder: "0 15 * * *",
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn());
        const mockWordRemindersGetById = jest
          .spyOn(wordReminderQueries, "getById")
          .mockResolvedValue(undefined);
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockWordReminderUpdateById = jest
          .spyOn(wordReminderQueries, "updateById")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordReminderGetByWordReminderId = jest
          .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
          .mockResolvedValue({
            ...wordReminder,
            user_words: [
              {
                details: word1.details,
                learned: userWord1.learned,
              },
              {
                details: word2.details,
                learned: userWord2.learned,
              },
            ],
          });
        const mockSubscriptionQueriesGetByUserId = jest
          .spyOn(subscriptionQueries, "getByUserId")
          .mockResolvedValue(subscription1);
        const mockTriggerWebPushMsg = jest
          .spyOn(triggerWebPush, "triggerWebPushMsg")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockWordRemindersGetById).toHaveBeenCalledTimes(1);
        expect(mockWordRemindersGetById).toHaveBeenCalledWith(wordReminder.id);
        expect(mockComplete).toHaveBeenCalledTimes(1);
        expect(mockComplete).toHaveBeenCalledWith(wordReminderQueueName, jobId);
        expect(mockWordReminderUpdateById).not.toHaveBeenCalled();
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).not.toHaveBeenCalled();
        expect(mockSubscriptionQueriesGetByUserId).not.toHaveBeenCalled();
        expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
      });

      it("returns when word reminder is not active", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  word_reminder_id: wordReminder.id,
                  reminder: wordReminder.reminder,
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn());
        const mockWordRemindersGetById = jest
          .spyOn(wordReminderQueries, "getById")
          .mockResolvedValue({ ...wordReminder, is_active: false });
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockWordReminderUpdateById = jest
          .spyOn(wordReminderQueries, "updateById")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordReminderGetByWordReminderId = jest
          .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
          .mockResolvedValue({
            ...wordReminder,
            user_words: [
              {
                details: word1.details,
                learned: userWord1.learned,
              },
              {
                details: word2.details,
                learned: userWord2.learned,
              },
            ],
          });
        const mockSubscriptionQueriesGetByUserId = jest
          .spyOn(subscriptionQueries, "getByUserId")
          .mockResolvedValue(subscription1);
        const mockTriggerWebPushMsg = jest
          .spyOn(triggerWebPush, "triggerWebPushMsg")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockWordRemindersGetById).toHaveBeenCalledTimes(1);
        expect(mockWordRemindersGetById).toHaveBeenCalledWith(wordReminder.id);
        expect(mockComplete).not.toHaveBeenCalled();
        expect(mockWordReminderUpdateById).not.toHaveBeenCalled();
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).not.toHaveBeenCalled();
        expect(mockSubscriptionQueriesGetByUserId).not.toHaveBeenCalled();
        expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
      });

      it("updates word reminder when it has finished and is active", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  word_reminder_id: wordReminder.id,
                  reminder: wordReminder.reminder,
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn());
        const mockWordRemindersGetById = jest
          .spyOn(wordReminderQueries, "getById")
          .mockResolvedValue({
            ...wordReminder,
            finish: new Date(0),
            is_active: true,
          });
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockWordReminderUpdateById = jest
          .spyOn(wordReminderQueries, "updateById")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordReminderGetByWordReminderId = jest
          .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
          .mockResolvedValue({
            ...wordReminder,
            user_words: [
              {
                details: word1.details,
                learned: userWord1.learned,
              },
              {
                details: word2.details,
                learned: userWord2.learned,
              },
            ],
          });
        const mockSubscriptionQueriesGetByUserId = jest
          .spyOn(subscriptionQueries, "getByUserId")
          .mockResolvedValue(subscription1);
        const mockTriggerWebPushMsg = jest
          .spyOn(triggerWebPush, "triggerWebPushMsg")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockWordRemindersGetById).toHaveBeenCalledTimes(1);
        expect(mockWordRemindersGetById).toHaveBeenCalledWith(wordReminder.id);
        expect(mockComplete).not.toHaveBeenCalled();
        expect(mockWordReminderUpdateById).toHaveBeenCalledTimes(1);
        expect(mockWordReminderUpdateById).toHaveBeenCalledWith(
          wordReminder.id,
          {
            is_active: false,
            has_reminder_onload: wordReminderParams.has_reminder_onload,
            reminder: wordReminderParams.reminder,
            finish: new Date(0),
          }
        );
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).not.toHaveBeenCalled();
        expect(mockSubscriptionQueriesGetByUserId).not.toHaveBeenCalled();
        expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
      });

      it("updates word reminder when it has finished and is not active", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  word_reminder_id: wordReminder.id,
                  reminder: wordReminder.reminder,
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn());
        const mockWordRemindersGetById = jest
          .spyOn(wordReminderQueries, "getById")
          .mockResolvedValue({
            ...wordReminder,
            finish: new Date(0),
            is_active: false,
          });
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockWordReminderUpdateById = jest
          .spyOn(wordReminderQueries, "updateById")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordReminderGetByWordReminderId = jest
          .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
          .mockResolvedValue({
            ...wordReminder,
            user_words: [
              {
                details: word1.details,
                learned: userWord1.learned,
              },
              {
                details: word2.details,
                learned: userWord2.learned,
              },
            ],
          });
        const mockSubscriptionQueriesGetByUserId = jest
          .spyOn(subscriptionQueries, "getByUserId")
          .mockResolvedValue(subscription1);
        const mockTriggerWebPushMsg = jest
          .spyOn(triggerWebPush, "triggerWebPushMsg")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockWordRemindersGetById).toHaveBeenCalledTimes(1);
        expect(mockWordRemindersGetById).toHaveBeenCalledWith(wordReminder.id);
        expect(mockComplete).not.toHaveBeenCalled();
        expect(mockWordReminderUpdateById).not.toHaveBeenCalled();
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).not.toHaveBeenCalled();
        expect(mockSubscriptionQueriesGetByUserId).not.toHaveBeenCalled();
        expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
      });

      it("sends web push notification with 2 days TTL when user wants to see the reminder when they load their browser", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  word_reminder_id: wordReminder.id,
                  reminder: wordReminder.reminder,
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn());
        const mockWordRemindersGetById = jest
          .spyOn(wordReminderQueries, "getById")
          .mockResolvedValue({
            ...wordReminder,
            has_reminder_onload: true,
            finish: new Date(1000),
          });
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockWordReminderUpdateById = jest
          .spyOn(wordReminderQueries, "updateById")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordReminderGetByWordReminderId = jest
          .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
          .mockResolvedValue({
            ...wordReminder,
            user_words: [
              {
                details: word1.details,
                learned: userWord1.learned,
              },
              {
                details: word2.details,
                learned: userWord2.learned,
              },
            ],
          });
        const mockSubscriptionQueriesGetByUserId = jest
          .spyOn(subscriptionQueries, "getByUserId")
          .mockResolvedValue(subscription1);
        const mockTriggerWebPushMsg = jest
          .spyOn(triggerWebPush, "triggerWebPushMsg")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockWordRemindersGetById).toHaveBeenCalledTimes(1);
        expect(mockWordRemindersGetById).toHaveBeenCalledWith(wordReminder.id);
        expect(mockComplete).not.toHaveBeenCalled();
        expect(mockWordReminderUpdateById).not.toHaveBeenCalled();
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).toHaveBeenCalledTimes(1);
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).toHaveBeenCalledWith(wordReminder.id);
        expect(mockSubscriptionQueriesGetByUserId).toHaveBeenCalledTimes(1);
        expect(mockSubscriptionQueriesGetByUserId).toHaveBeenCalledWith(userId);
        expect(mockTriggerWebPushMsg).toHaveBeenCalledTimes(1);
        expect(mockTriggerWebPushMsg).toHaveBeenCalledWith(
          subscription1,
          JSON.stringify({
            id: wordReminder.id,
            words: `${word1.details[0].word}, ${word2.details[0].word}`,
          }),
          { TTL: 172800 }
        );
      });

      it("sends web push notification with 0 seconds TTL when the user does not want to see queued notifications", async () => {
        const message = "Success!";
        const app = express();
        app.use(createWorkers);
        app.post("/api", (req, res) => {
          res.json({ message });
        });
        const mockCreateQueue = jest
          .spyOn(boss, "createQueue")
          .mockImplementation(jest.fn());
        const jobId = "1";
        const mockWork = jest
          .spyOn(boss, "work")
          .mockImplementationOnce(jest.fn())
          .mockImplementationOnce((queueName, callback: any) => {
            callback([
              {
                data: {
                  word_reminder_id: wordReminder.id,
                  reminder: wordReminder.reminder,
                },
                id: jobId,
              },
            ]);
            return Promise.resolve("");
          })
          .mockImplementationOnce(jest.fn());
        const mockWordRemindersGetById = jest
          .spyOn(wordReminderQueries, "getById")
          .mockResolvedValue({
            ...wordReminder,
            has_reminder_onload: false,
            finish: new Date(1000),
          });
        const mockComplete = jest
          .spyOn(boss, "complete")
          .mockImplementation(jest.fn());
        const mockWordReminderUpdateById = jest
          .spyOn(wordReminderQueries, "updateById")
          .mockResolvedValue(wordReminder);
        const mockUserWordsWordReminderGetByWordReminderId = jest
          .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
          .mockResolvedValue({
            ...wordReminder,
            user_words: [
              {
                details: word1.details,
                learned: userWord1.learned,
              },
              {
                details: word2.details,
                learned: userWord2.learned,
              },
            ],
          });
        const mockSubscriptionQueriesGetByUserId = jest
          .spyOn(subscriptionQueries, "getByUserId")
          .mockResolvedValue(subscription1);
        const mockTriggerWebPushMsg = jest
          .spyOn(triggerWebPush, "triggerWebPushMsg")
          .mockImplementation(jest.fn());
        jest.spyOn(global.Date, "now").mockImplementation(() => {
          return new Date(0).valueOf();
        });

        const response = await request(app)
          .post("/api")
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message });
        expect(mockCreateQueue).toHaveBeenCalledTimes(3);
        expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
        expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
        expect(mockWork).toHaveBeenCalledTimes(3);
        expect(mockWork).toHaveBeenCalledWith(
          autoWordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          wordReminderQueueName,
          expect.any(Function)
        );
        expect(mockWork).toHaveBeenCalledWith(
          emailQueueName,
          expect.any(Function)
        );
        expect(mockWordRemindersGetById).toHaveBeenCalledTimes(1);
        expect(mockWordRemindersGetById).toHaveBeenCalledWith(wordReminder.id);
        expect(mockComplete).not.toHaveBeenCalled();
        expect(mockWordReminderUpdateById).not.toHaveBeenCalled();
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).toHaveBeenCalledTimes(1);
        expect(
          mockUserWordsWordReminderGetByWordReminderId
        ).toHaveBeenCalledWith(wordReminder.id);
        expect(mockSubscriptionQueriesGetByUserId).toHaveBeenCalledTimes(1);
        expect(mockSubscriptionQueriesGetByUserId).toHaveBeenCalledWith(userId);
        expect(mockTriggerWebPushMsg).toHaveBeenCalledTimes(1);
        expect(mockTriggerWebPushMsg).toHaveBeenCalledWith(
          subscription1,
          JSON.stringify({
            id: wordReminder.id,
            words: `${word1.details[0].word}, ${word2.details[0].word}`,
          }),
          { TTL: 0 }
        );
      });
    });
  });

  describe("when the queue is for emails", () => {
    it("setups worker for emails", async () => {
      const message = "Success!";
      const app = express();
      app.use(createWorkers);
      app.post("/api", (req, res) => {
        res.json({ message });
      });
      const mockCreateQueue = jest
        .spyOn(boss, "createQueue")
        .mockImplementation(jest.fn());
      const mockWork = jest.spyOn(boss, "work").mockImplementation(jest.fn());
      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockWordReminderCreate = jest
        .spyOn(wordReminderQueries, "create")
        .mockResolvedValue(wordReminder);
      const mockUserWordsWordRemindersCreate = jest
        .spyOn(userWordsWordRemindersQueries, "create")
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2);
      const mockUserWordQueriesGetById = jest
        .spyOn(userWordQueries, "getById")
        .mockResolvedValueOnce(userWord1)
        .mockResolvedValueOnce(userWord2);
      const mockWordQueriesGetById = jest
        .spyOn(wordQueries, "getById")
        .mockResolvedValueOnce(word1)
        .mockResolvedValueOnce(word2);
      const mockSchedule = jest
        .spyOn(boss, "schedule")
        .mockImplementation(jest.fn());
      const mockSendAfter = jest
        .spyOn(boss, "sendAfter")
        .mockImplementation(jest.fn());
      const mockDeleteAll = jest
        .spyOn(tokenQueries, "deleteAll")
        .mockImplementation(jest.fn());
      jest.spyOn(global.Date, "now").mockImplementation(() => {
        return new Date(0).valueOf();
      });

      const response = await request(app)
        .post("/api")
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message });
      expect(mockCreateQueue).toHaveBeenCalledTimes(3);
      expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
      expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
      expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
      expect(mockWork).toHaveBeenCalledTimes(3);
      expect(mockWork).toHaveBeenCalledWith(
        autoWordReminderQueueName,
        expect.any(Function)
      );
      expect(mockWork).toHaveBeenCalledWith(
        wordReminderQueueName,
        expect.any(Function)
      );
      expect(mockWork).toHaveBeenCalledWith(
        emailQueueName,
        expect.any(Function)
      );
      expect(mockUserWordGetByUserWords).not.toHaveBeenCalled();
      expect(mockWordReminderCreate).not.toHaveBeenCalled();
      expect(mockUserWordsWordRemindersCreate).not.toHaveBeenCalled();
      expect(mockUserWordQueriesGetById).not.toHaveBeenCalled();
      expect(mockWordQueriesGetById).not.toHaveBeenCalled();
      expect(mockSchedule).not.toHaveBeenCalled();
      expect(mockSendAfter).not.toHaveBeenCalled();
      expect(mockDeleteAll).not.toHaveBeenCalled();
    });

    it("calls function inside of worker callback", async () => {
      const message = "Success!";
      const app = express();
      app.use(createWorkers);
      app.post("/api", (req, res) => {
        res.json({ message });
      });
      const mockCreateQueue = jest
        .spyOn(boss, "createQueue")
        .mockImplementation(jest.fn());
      const mockJobs = [
        { data: { token: "token1" } },
        { data: { token: "token2" } },
      ] as unknown as Job<{ token: string }>[];
      const mockWork = jest
        .spyOn(boss, "work")
        .mockImplementationOnce(jest.fn())
        .mockImplementationOnce(jest.fn())
        .mockImplementationOnce((queueName, callback: any) => {
          callback(mockJobs);
          return Promise.resolve("");
        });
      const mockUserWordGetByUserWords = jest
        .spyOn(userWordQueries, "getUserWords")
        .mockResolvedValue(userWords);
      const mockWordReminderCreate = jest
        .spyOn(wordReminderQueries, "create")
        .mockResolvedValue(wordReminder);
      const mockUserWordsWordRemindersCreate = jest
        .spyOn(userWordsWordRemindersQueries, "create")
        .mockResolvedValueOnce(userWordsWordReminders1)
        .mockResolvedValueOnce(userWordsWordReminders2);
      const mockUserWordQueriesGetById = jest
        .spyOn(userWordQueries, "getById")
        .mockResolvedValueOnce(userWord1)
        .mockResolvedValueOnce(userWord2);
      const mockWordQueriesGetById = jest
        .spyOn(wordQueries, "getById")
        .mockResolvedValueOnce(word1)
        .mockResolvedValueOnce(word2);
      const mockSchedule = jest
        .spyOn(boss, "schedule")
        .mockImplementation(jest.fn());
      const mockSendAfter = jest
        .spyOn(boss, "sendAfter")
        .mockImplementation(jest.fn());
      const mockDeleteAll = jest
        .spyOn(tokenQueries, "deleteAll")
        .mockImplementation(jest.fn());
      jest.spyOn(global.Date, "now").mockImplementation(() => {
        return new Date(0).valueOf();
      });

      const response = await request(app)
        .post("/api")
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message });
      expect(mockCreateQueue).toHaveBeenCalledTimes(3);
      expect(mockCreateQueue).toHaveBeenCalledWith(autoWordReminderQueueName);
      expect(mockCreateQueue).toHaveBeenCalledWith(wordReminderQueueName);
      expect(mockCreateQueue).toHaveBeenCalledWith(emailQueueName);
      expect(mockWork).toHaveBeenCalledTimes(3);
      expect(mockWork).toHaveBeenCalledWith(
        autoWordReminderQueueName,
        expect.any(Function)
      );
      expect(mockWork).toHaveBeenCalledWith(
        wordReminderQueueName,
        expect.any(Function)
      );
      expect(mockWork).toHaveBeenCalledWith(
        emailQueueName,
        expect.any(Function)
      );
      expect(mockUserWordGetByUserWords).not.toHaveBeenCalled();
      expect(mockWordReminderCreate).not.toHaveBeenCalled();
      expect(mockUserWordsWordRemindersCreate).not.toHaveBeenCalled();
      expect(mockUserWordQueriesGetById).not.toHaveBeenCalled();
      expect(mockWordQueriesGetById).not.toHaveBeenCalled();
      expect(mockSchedule).not.toHaveBeenCalled();
      expect(mockSendAfter).not.toHaveBeenCalled();
      expect(mockDeleteAll).toHaveBeenCalledTimes(1);
      expect(mockDeleteAll).toHaveBeenCalledWith(["token1", "token2"]);
    });
  });
});
