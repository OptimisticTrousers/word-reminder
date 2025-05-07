import express from "express";
import request from "supertest";

import { create_word_reminder } from "../controllers/word_reminder_controller";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { boss } from "../db/boss";

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
    word_reminder_id: wordReminder.id,
    user_word_id: userWord1.id,
  };
  const userWordsWordReminders2 = {
    id: 2,
    word_reminder_id: wordReminder.id,
    user_word_id: userWord2.id,
  };

  const queueName = "word-reminder-queue";

  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/wordReminders", create_word_reminder);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to create the word reminder and sets up reminder", async () => {
    const mockWordReminderCreate = jest
      .spyOn(wordReminderQueries, "create")
      .mockResolvedValue(wordReminder);
    const mockUserWordsWordRemindersCreate = jest
      .spyOn(userWordsWordRemindersQueries, "create")
      .mockResolvedValueOnce(userWordsWordReminders1)
      .mockResolvedValueOnce(userWordsWordReminders2);
    const mockSchedule = jest
      .spyOn(boss, "schedule")
      .mockImplementation(jest.fn());

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
    expect(mockWordReminderCreate).toHaveBeenCalledTimes(1);
    expect(mockWordReminderCreate).toHaveBeenCalledWith({
      ...wordReminderParams,
      finish: wordReminder.finish.toISOString(),
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
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(
      queueName,
      wordReminder.reminder,
      {
        word_reminder_id: wordReminder.id,
        reminder: wordReminder.reminder,
      }
    );
  });
});
