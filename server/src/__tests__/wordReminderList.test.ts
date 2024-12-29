import express from "express";
import request from "supertest";
import { UserWordsWordRemindersQueries } from "../db/userWordsWordRemindersQueries";
import { word_reminder_list } from "../controllers/wordReminderController";

describe("word_reminder_list", () => {
  const sampleUser1 = {
    id: "1",
    username: "username",
    password: "password",
  };

  const wordReminder1 = {
    finish: new Date(),
    reminder: "every 2 hours",
    is_active: true,
    has_reminder_onload: true,
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
      id: "1",
      word_id: "1",
      user_id: sampleUser1.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      learned: false,
      details: helloJson,
      id: "2",
      word_id: "2",
      user_id: sampleUser1.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      learned: false,
      details: milieuJson,
      id: "3",
      word_id: "3",
      user_id: sampleUser1.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const getByUserIdMock = jest
    .spyOn(UserWordsWordRemindersQueries.prototype, "getByUserId")
    .mockImplementation(async () => {
      return {
        userWords,
        wordReminder: wordReminder1,
      };
    });

  const app = express();
  app.use(express.json());
  app.get("/api/users/:userId/wordReminders", word_reminder_list);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("no query", () => {
    it("calls the functions to get the user's words with none of the query options", async () => {
      const response = await request(app)
        .get(`/api/users/${sampleUser1.id}/wordReminders`)
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        userWords: [
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
        wordReminder: {
          ...wordReminder1,
          finish: wordReminder1.finish.toISOString(),
        },
      });
      expect(getByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getByUserIdMock).toHaveBeenCalledWith(sampleUser1.id, {});
    });
  });

  describe("page number and page limit query", () => {
    it("calls the functions to get the user's worth with the page number and page limit query", async () => {
      const page = 1;
      const limit = 2;

      const response = await request(app)
        .get(
          `/api/users/${sampleUser1}/wordReminders?page=${page}&limit=${limit}`
        )
        .set("Accept", "application/json");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        userWords: [
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
        wordReminder: {
          ...wordReminder1,
          finish: wordReminder1.finish.toISOString(),
        },
        next: {
          page: 2,
          limit: 2,
        },
      });
      expect(getByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getByUserIdMock).toHaveBeenCalledWith(sampleUser1.id, {
        page,
        limit,
      });
    });
  });
});
