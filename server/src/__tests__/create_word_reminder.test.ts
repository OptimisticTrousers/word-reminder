import express from "express";
import request from "supertest";

import { create_word_reminder } from "../controllers/word_reminder_controller";
import * as wordReminders from "../utils/word_reminder";
import { boss } from "../db/boss";
import { subscriptionQueries } from "../db/subscription_queries";
import * as triggerWebPush from "../utils/trigger_web_push_msg";
import { userWordQueries } from "../db/user_word_queries";
import { wordQueries } from "../db/word_queries";
import { createQueue } from "../middleware/create_queue";

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
  const subscription1 = {
    id: 1,
    userId,
    endpoint: "https://random-push-service.com/unique-id-1234/",
    p256dh:
      "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
    auth: "tBHItJI5svbpez7KI4CCXg==",
  };
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
    word_id: 1,
    user_id: userId,
    learned: false,
    details: word1.details,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const userWord2 = {
    id: 2,
    word_id: 2,
    user_id: userId,
    learned: false,
    details: word2.details,
    created_at: new Date(),
    updated_at: new Date(),
  };

  jest.spyOn(boss, "createQueue").mockImplementation(jest.fn());
  const mockCreateWordReminder = jest
    .spyOn(wordReminders, "createWordReminder")
    .mockImplementation(async () => {
      return wordReminder;
    });
  const mockSchedule = jest
    .spyOn(boss, "schedule")
    .mockImplementation(jest.fn());
  const mockSubscriptionQueriesGetByUserId = jest
    .spyOn(subscriptionQueries, "getByUserId")
    .mockResolvedValue(subscription1);
  let capturedCallback: any;
  const mockWork = jest
    .spyOn(boss, "work")
    .mockImplementation(async (queueName, callback) => {
      capturedCallback = callback;
      capturedCallback();
      return "";
    });
  const mockTriggerWebPushMsg = jest
    .spyOn(triggerWebPush, "triggerWebPushMsg")
    .mockImplementation(jest.fn());
  const mockUserWordQueriesGetById = jest
    .spyOn(userWordQueries, "getById")
    .mockResolvedValueOnce(userWord1)
    .mockResolvedValueOnce(userWord2);
  const mockWordQueriesGetById = jest
    .spyOn(wordQueries, "getById")
    .mockResolvedValueOnce(word1)
    .mockResolvedValueOnce(word2);

  const queuePostfix = "word-reminder-queue";

  const app = express();
  app.use(express.json());
  app.post(
    "/api/users/:userId/wordReminders",
    createQueue(queuePostfix),
    create_word_reminder
  );

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
      user_words: [userWord1, userWord2],
    };

    const response = await request(app)
      .post(`/api/users/${userId}/wordReminders`)
      .set("Accept", "application/json")
      .send(body);

    const queueName = `${userId}-${queuePostfix}`;
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
      user_words: [
        {
          ...userWord1,
          updated_at: userWord1.updated_at.toISOString(),
          created_at: userWord1.created_at.toISOString(),
        },
        {
          ...userWord2,
          updated_at: userWord2.updated_at.toISOString(),
          created_at: userWord2.created_at.toISOString(),
        },
      ],
      reminder: body.reminder,
      finish: body.finish.toISOString(),
    });
    expect(mockUserWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord1.id);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord2.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word1.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word2.id);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(queueName, wordReminder.reminder);
    expect(mockSubscriptionQueriesGetByUserId).toHaveBeenCalledTimes(1);
    expect(mockSubscriptionQueriesGetByUserId).toHaveBeenCalledWith(userId);
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    expect(mockTriggerWebPushMsg).toHaveBeenCalledTimes(1);
    expect(mockTriggerWebPushMsg).toHaveBeenCalledWith(
      subscription1,
      `${word1.details[0].word}, ${word2.details[0].word}`
    );
  });
});
