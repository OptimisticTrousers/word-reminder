import express from "express";
import request from "supertest";

import { update_word_reminder } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { boss } from "../db/boss";
import { subscriptionQueries } from "../db/subscription_queries";
import * as triggerWebPush from "../utils/trigger_web_push_msg";
import { userWordQueries } from "../db/user_word_queries";
import { wordQueries } from "../db/word_queries";
import { createQueue } from "../middleware/create_queue";

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

  const subscription1 = {
    id: 1,
    userId,
    endpoint: "https://random-push-service.com/unique-id-1234/",
    p256dh:
      "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
    auth: "tBHItJI5svbpez7KI4CCXg==",
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
    details: word1.details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: 2,
    user_id: userId,
    word_id: wordId2,
    details: word2.details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

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

  const queuePostfix = "word-reminder-queue";

  const app = express();
  app.use(express.json());
  app.put(
    "/api/users/:userId/wordReminders/:wordReminderId",
    createQueue(queuePostfix),
    update_word_reminder
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to update the word reminder with the user words in it", async () => {
    const wordReminderUpdateMock = jest
      .spyOn(wordReminderQueries, "updateById")
      .mockResolvedValue(wordReminder);
    const userWordsWordRemindersMock = jest
      .spyOn(userWordsWordRemindersQueries, "create")
      .mockResolvedValueOnce(userWordsWordReminders1)
      .mockResolvedValueOnce(userWordsWordReminders2)
      .mockResolvedValueOnce(userWordsWordReminders3);
    const mockSchedule = jest
      .spyOn(boss, "schedule")
      .mockImplementation(jest.fn());
    const mockSubscriptionGetByUserId = jest
      .spyOn(subscriptionQueries, "getByUserId")
      .mockResolvedValue(subscription1);
    let capturedCallback: any;
    const mockWork = jest
      .spyOn(boss, "work")
      .mockImplementation(async (queueName, callback) => {
        capturedCallback = callback;
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
    const body = {
      finish: wordReminder.finish,
      user_words: [userWord1, userWord2],
      is_active: wordReminder.is_active,
      has_reminder_onload: wordReminder.has_reminder_onload,
      reminder: wordReminder.reminder,
    };

    const response = await request(app)
      .put(`/api/users/${userId}/wordReminders/${wordReminder.id}`)
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
    expect(mockUserWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord1.id);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord2.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word1.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word2.id);
    expect(wordReminderUpdateMock).toHaveBeenCalledTimes(1);
    expect(wordReminderUpdateMock).toHaveBeenCalledWith(wordReminder.id, {
      reminder: body.reminder,
      is_active: body.is_active,
      has_reminder_onload: body.has_reminder_onload,
      finish: body.finish.toISOString(),
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledTimes(2);
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord1.id,
      word_reminder_id: wordReminder.id,
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord2.id,
      word_reminder_id: wordReminder.id,
    });
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(queueName, wordReminder.reminder);
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    expect(mockSubscriptionGetByUserId).not.toHaveBeenCalled();
    expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
  });

  it("calls the functions inside of scheduled callback", async () => {
    const wordReminderUpdateMock = jest
      .spyOn(wordReminderQueries, "updateById")
      .mockResolvedValue(wordReminder);
    const userWordsWordRemindersMock = jest
      .spyOn(userWordsWordRemindersQueries, "create")
      .mockResolvedValueOnce(userWordsWordReminders1)
      .mockResolvedValueOnce(userWordsWordReminders2)
      .mockResolvedValueOnce(userWordsWordReminders3);
    const mockSchedule = jest
      .spyOn(boss, "schedule")
      .mockImplementation(jest.fn());
    const mockSubscriptionGetByUserId = jest
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
    const body = {
      finish: wordReminder.finish,
      user_words: [userWord1, userWord2],
      is_active: wordReminder.is_active,
      has_reminder_onload: wordReminder.has_reminder_onload,
      reminder: wordReminder.reminder,
    };

    const response = await request(app)
      .put(`/api/users/${userId}/wordReminders/${wordReminder.id}`)
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
    expect(mockUserWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord1.id);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord2.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word1.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word2.id);
    expect(wordReminderUpdateMock).toHaveBeenCalledTimes(1);
    expect(wordReminderUpdateMock).toHaveBeenCalledWith(wordReminder.id, {
      reminder: body.reminder,
      is_active: body.is_active,
      has_reminder_onload: body.has_reminder_onload,
      finish: body.finish.toISOString(),
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledTimes(2);
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord1.id,
      word_reminder_id: wordReminder.id,
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord2.id,
      word_reminder_id: wordReminder.id,
    });
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(queueName, wordReminder.reminder);
    expect(mockSubscriptionGetByUserId).toHaveBeenCalledTimes(1);
    expect(mockSubscriptionGetByUserId).toHaveBeenCalledWith(userId);
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    expect(mockTriggerWebPushMsg).toHaveBeenCalledTimes(1);
    expect(mockTriggerWebPushMsg).toHaveBeenCalledWith(
      subscription1,
      JSON.stringify({
        id: wordReminder.id,
        words: `${word1.details[0].word}, ${word2.details[0].word}`,
      })
    );
  });

  it("only calls the functions to update the word reminder when the word reminder is not active", async () => {
    const wordReminderUpdateMock = jest
      .spyOn(wordReminderQueries, "updateById")
      .mockResolvedValue(wordReminder);
    const userWordsWordRemindersMock = jest
      .spyOn(userWordsWordRemindersQueries, "create")
      .mockResolvedValueOnce(userWordsWordReminders1)
      .mockResolvedValueOnce(userWordsWordReminders2)
      .mockResolvedValueOnce(userWordsWordReminders3);
    const mockSchedule = jest
      .spyOn(boss, "schedule")
      .mockImplementation(jest.fn());
    const mockSubscriptionGetByUserId = jest
      .spyOn(subscriptionQueries, "getByUserId")
      .mockResolvedValue(subscription1);
    let capturedCallback: any;
    const mockWork = jest
      .spyOn(boss, "work")
      .mockImplementation(async (_queueName, callback) => {
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
    const body = {
      finish: wordReminder.finish,
      user_words: [userWord1, userWord2],
      is_active: false,
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
    expect(userWordsWordRemindersMock).toHaveBeenCalledTimes(2);
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord1.id,
      word_reminder_id: wordReminder.id,
    });
    expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
      user_word_id: userWord2.id,
      word_reminder_id: wordReminder.id,
    });
    expect(mockUserWordQueriesGetById).not.toHaveBeenCalled();
    expect(mockWordQueriesGetById).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockSubscriptionGetByUserId).not.toHaveBeenCalled();
    expect(mockWork).not.toHaveBeenCalled();
    expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
  });
});
