import express from "express";
import request from "supertest";

import { word_reminder_list } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";

describe("word_reminder_list", () => {
  const userId = 1;

  const wordReminder = {
    id: 1,
    user_id: userId,
    finish: new Date(Date.now() + 1000),
    reminder: "* * * * *",
    is_active: true,
    has_reminder_onload: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const milieuJson = [
    {
      word: "milieu",
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [{ definition: "A person's social environment." }],
        },
      ],
      phonetics: [],
    },
  ];
  const clemencyJson = [
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
  ];

  const helloJson = [
    {
      word: "hello",
      phonetic: "həˈləʊ",
      phonetics: [
        {
          text: "həˈləʊ",
          audio:
            "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3",
        },
        {
          text: "hɛˈləʊ",
        },
      ],
      origin:
        "early 19th century: variant of earlier hollo ; related to holla.",
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
        {
          partOfSpeech: "noun",
          definitions: [
            {
              definition: "an utterance of ‘hello’; a greeting.",
              example: "she was getting polite nods and hellos from people",
              synonyms: [],
              antonyms: [],
            },
          ],
        },
        {
          partOfSpeech: "verb",
          definitions: [
            {
              definition: "say or shout ‘hello’.",
              example: "I pressed the phone button and helloed",
              synonyms: [],
              antonyms: [],
            },
          ],
        },
      ],
    },
  ];

  const userWords = [
    {
      learned: false,
      details: clemencyJson,
      id: 1,
      word_id: 1,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      learned: false,
      details: helloJson,
      id: 2,
      word_id: 2,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      learned: false,
      details: milieuJson,
      id: 3,
      word_id: 3,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const app = express();
  app.use(express.json());
  app.get("/api/users/:userId/wordReminders", word_reminder_list);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("no query", () => {
    it("calls the functions to get the user's words with none of the query options", async () => {
      const mockGetByUserId = jest
        .spyOn(userWordsWordRemindersQueries, "getByUserId")
        .mockImplementation(async () => {
          return {
            wordReminders: [{ ...wordReminder, user_words: userWords }],
          };
        });

      const response = await request(app)
        .get(`/api/users/${userId}/wordReminders`)
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        wordReminders: [
          {
            ...wordReminder,
            reminder: wordReminder.reminder,
            finish: wordReminder.finish.toISOString(),
            created_at: wordReminder.created_at.toISOString(),
            updated_at: wordReminder.updated_at.toISOString(),
            user_words: [
              {
                ...userWords[0],
                created_at: userWords[0].created_at.toISOString(),
                updated_at: userWords[0].updated_at.toISOString(),
              },
              {
                ...userWords[1],
                created_at: userWords[1].created_at.toISOString(),
                updated_at: userWords[1].updated_at.toISOString(),
              },
              {
                ...userWords[2],
                created_at: userWords[2].created_at.toISOString(),
                updated_at: userWords[2].updated_at.toISOString(),
              },
            ],
          },
        ],
      });
      expect(mockGetByUserId).toHaveBeenCalledTimes(1);
      expect(mockGetByUserId).toHaveBeenCalledWith(userId, {});
    });
  });

  describe("page number and page limit query", () => {
    it("calls the functions to get the user's worth with the page number and page limit query", async () => {
      const mockGetByUserId = jest
        .spyOn(userWordsWordRemindersQueries, "getByUserId")
        .mockImplementation(async () => {
          return {
            wordReminders: [
              {
                ...wordReminder,
                user_words: userWords,
              },
            ],
            next: {
              page: 2,
              limit: 2,
            },
          };
        });

      const page = 1;
      const limit = 2;

      const response = await request(app)
        .get(`/api/users/${userId}/wordReminders?page=${page}&limit=${limit}`)
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        wordReminders: [
          {
            ...wordReminder,
            reminder: wordReminder.reminder,
            finish: wordReminder.finish.toISOString(),
            created_at: wordReminder.created_at.toISOString(),
            updated_at: wordReminder.updated_at.toISOString(),
            user_words: [
              {
                ...userWords[0],
                created_at: userWords[0].created_at.toISOString(),
                updated_at: userWords[0].updated_at.toISOString(),
              },
              {
                ...userWords[1],
                created_at: userWords[1].created_at.toISOString(),
                updated_at: userWords[1].updated_at.toISOString(),
              },
              {
                ...userWords[2],
                created_at: userWords[2].created_at.toISOString(),
                updated_at: userWords[2].updated_at.toISOString(),
              },
            ],
          },
        ],
        next: {
          page: 2,
          limit: 2,
        },
      });
      expect(mockGetByUserId).toHaveBeenCalledTimes(1);
      expect(mockGetByUserId).toHaveBeenCalledWith(userId, {
        page,
        limit,
      });
    });
  });
});
