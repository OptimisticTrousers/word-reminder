import { boss } from "../db/boss";
import { subscriptionQueries } from "../db/subscription_queries";
import { userWordQueries } from "../db/user_word_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordQueries } from "../db/word_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { scheduleWordReminder } from "../utils/word_reminder";
import * as triggerWebPush from "../utils/trigger_web_push_msg";
import { timeout } from "cron";

const userId = 1;
const scheduleWordReminderParams = {
  word_reminder_id: 1,
  user_id: userId,
  finish: new Date(),
  is_active: true,
  reminder: "* * * * *",
  has_reminder_onload: true,
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
const userWordsWordReminders1 = {
  id: 1,
  word_reminder_id: scheduleWordReminderParams.word_reminder_id,
  user_word_id: userWord1.id,
};
const userWordsWordReminders2 = {
  id: 2,
  word_reminder_id: scheduleWordReminderParams.word_reminder_id,
  user_word_id: userWord2.id,
};

describe("scheduleWordReminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the function to schedule a word reminder", async () => {
    const mockSchedule = jest
      .spyOn(boss, "schedule")
      .mockImplementation(jest.fn());
    const mockUserWordQueriesGetById = jest
      .spyOn(userWordQueries, "getById")
      .mockResolvedValueOnce(userWord1)
      .mockResolvedValueOnce(userWord2);
    const mockWordQueriesGetById = jest
      .spyOn(wordQueries, "getById")
      .mockResolvedValueOnce(word1)
      .mockResolvedValueOnce(word2);
    let capturedCallback: any;
    const mockWork = jest
      .spyOn(boss, "work")
      .mockImplementation(async (_queueName, options, callback) => {
        capturedCallback = callback;
        // callback not called for test
        return "";
      });
    const mockSubscriptionQueriesGetByUserId = jest
      .spyOn(subscriptionQueries, "getByUserId")
      .mockResolvedValue(subscription1);
    const mockTriggerWebPushMsg = jest
      .spyOn(triggerWebPush, "triggerWebPushMsg")
      .mockImplementation(jest.fn());

    const queueName = "1-word-reminder-queue";
    await scheduleWordReminder({
      ...scheduleWordReminderParams,
      user_id: String(scheduleWordReminderParams.user_id),
      user_words: [userWord1, userWord2],
      queueName,
    });

    expect(mockUserWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord1.id);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord2.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word1.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word2.id);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(
      queueName,
      scheduleWordReminderParams.reminder
    );
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(
      queueName,
      {
        pollingIntervalSeconds: Math.round(
          timeout(scheduleWordReminderParams.reminder) / 1000
        ),
      },
      capturedCallback
    );
    expect(mockSubscriptionQueriesGetByUserId).not.toHaveBeenCalled();
    expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
  });

  it("calls the functions inside of scheduled work callback", async () => {
    const mockSchedule = jest
      .spyOn(boss, "schedule")
      .mockImplementation(jest.fn());
    const mockUserWordQueriesGetById = jest
      .spyOn(userWordQueries, "getById")
      .mockResolvedValueOnce(userWord1)
      .mockResolvedValueOnce(userWord2);
    const mockWordQueriesGetById = jest
      .spyOn(wordQueries, "getById")
      .mockResolvedValueOnce(word1)
      .mockResolvedValueOnce(word2);
    let capturedCallback: any;
    const mockWork = jest
      .spyOn(boss, "work")
      .mockImplementation(async (_queueName, options, callback) => {
        capturedCallback = callback;
        capturedCallback();
        return "";
      });
    const mockSubscriptionQueriesGetByUserId = jest
      .spyOn(subscriptionQueries, "getByUserId")
      .mockResolvedValue(subscription1);
    const mockTriggerWebPushMsg = jest
      .spyOn(triggerWebPush, "triggerWebPushMsg")
      .mockImplementation(jest.fn());

    const queueName = "1-word-reminder-queue";
    await scheduleWordReminder({
      ...scheduleWordReminderParams,
      user_id: String(scheduleWordReminderParams.user_id),
      user_words: [userWord1, userWord2],
      queueName,
    });

    expect(mockUserWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord1.id);
    expect(mockUserWordQueriesGetById).toHaveBeenCalledWith(userWord2.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledTimes(2);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word1.id);
    expect(mockWordQueriesGetById).toHaveBeenCalledWith(word2.id);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(
      queueName,
      scheduleWordReminderParams.reminder
    );
    expect(mockSubscriptionQueriesGetByUserId).toHaveBeenCalledTimes(1);
    expect(mockSubscriptionQueriesGetByUserId).toHaveBeenCalledWith(userId);
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(
      queueName,
      {
        pollingIntervalSeconds: Math.round(
          timeout(scheduleWordReminderParams.reminder) / 1000
        ),
      },
      capturedCallback
    );
    expect(mockTriggerWebPushMsg).toHaveBeenCalledTimes(1);
    expect(mockTriggerWebPushMsg).toHaveBeenCalledWith(
      subscription1,
      JSON.stringify({
        id: scheduleWordReminderParams.word_reminder_id,
        words: `${word1.details[0].word}, ${word2.details[0].word}`,
      })
    );
  });

  it("only calls the functions to create the word reminder when the word reminder is not active", async () => {
    const mockSchedule = jest
      .spyOn(boss, "schedule")
      .mockImplementation(jest.fn());
    const mockUserWordQueriesGetById = jest
      .spyOn(userWordQueries, "getById")
      .mockResolvedValueOnce(userWord1)
      .mockResolvedValueOnce(userWord2);
    const mockWordQueriesGetById = jest
      .spyOn(wordQueries, "getById")
      .mockResolvedValueOnce(word1)
      .mockResolvedValueOnce(word2);
    let capturedCallback: any;
    const mockWork = jest
      .spyOn(boss, "work")
      .mockImplementation(async (_queueName, options, callback) => {
        capturedCallback = callback;
        // callback not called for test
        return "";
      });
    const mockSubscriptionQueriesGetByUserId = jest
      .spyOn(subscriptionQueries, "getByUserId")
      .mockResolvedValue(subscription1);
    const mockTriggerWebPushMsg = jest
      .spyOn(triggerWebPush, "triggerWebPushMsg")
      .mockImplementation(jest.fn());

    const queueName = "1-word-reminder-queue";
    await scheduleWordReminder({
      ...scheduleWordReminderParams,
      user_id: String(scheduleWordReminderParams.user_id),
      is_active: false,
      user_words: [userWord1, userWord2],
      queueName,
    });

    expect(mockUserWordQueriesGetById).not.toHaveBeenCalled();
    expect(mockWordQueriesGetById).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockSubscriptionQueriesGetByUserId).not.toHaveBeenCalled();
    expect(mockWork).not.toHaveBeenCalled();
    expect(mockTriggerWebPushMsg).not.toHaveBeenCalled();
  });
});
