import express from "express";
import request from "supertest";

import { word_reminder_list } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { validatePageQuery } from "../middleware/validate_page_query";
import { validateSortQuery } from "../middleware/validate_sort_query";
import { Column } from "common";

const userId = 1;
const wordReminder1 = {
  user_id: userId,
  finish: new Date(),
  reminder: "* * * * *",
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
    origin: "early 19th century: variant of earlier hollo ; related to holla.",
    meanings: [
      {
        partOfSpeech: "exclamation",
        definitions: [
          {
            definition: "used as a greeting or to begin a phone conversation.",
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

const wordReminders = [
  {
    id: 1,
    user_id: userId,
    reminder: wordReminder1.reminder,
    is_active: wordReminder1.is_active,
    has_reminder_onload: wordReminder1.has_reminder_onload,
    finish: wordReminder1.finish,
    user_words: [
      {
        learned: false,
        details: clemencyJson,
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    user_id: userId,
    reminder: wordReminder1.reminder,
    is_active: wordReminder1.is_active,
    has_reminder_onload: wordReminder1.has_reminder_onload,
    finish: wordReminder1.finish,
    user_words: [
      {
        learned: false,
        details: helloJson,
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    user_id: userId,
    reminder: wordReminder1.reminder,
    is_active: wordReminder1.is_active,
    has_reminder_onload: wordReminder1.has_reminder_onload,
    finish: wordReminder1.finish,
    user_words: [
      {
        learned: false,
        details: milieuJson,
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe("validateQuery", () => {
  const mockGetByUserId = jest
    .spyOn(userWordsWordRemindersQueries, "getByUserId")
    .mockResolvedValue({ wordReminders });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validatePageQuery", () => {
    const app = express();
    app.use(express.json());
    app.get(
      "/api/users/:userId/wordReminders",
      validatePageQuery,
      errorValidationHandler,
      word_reminder_list
    );

    describe("page number and page limit query", () => {
      it("calls the functions to get the user's word reminders with the page number and page limit query", async () => {
        const params = new URLSearchParams({
          page: "1",
          limit: "6",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).toHaveBeenCalledTimes(1);
        expect(mockGetByUserId).toHaveBeenCalledWith(userId, {
          page: 1,
          limit: 6,
        });
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          wordReminders: [
            {
              id: 1,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 3,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: milieuJson,
                },
              ],
            },
          ],
        });
      });

      it("returns errors with status code 400 when the page size is not a number and the page limit is provided", async () => {
        const params = new URLSearchParams({
          limit: "6",
          page: "undefined",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'page' must be a positive integer.",
              path: "page",
              type: "field",
              value: "undefined",
            },
          ],
        });
      });

      it("returns errors with status code 400 when the page limit is not a number and the page size is provided", async () => {
        const params = new URLSearchParams({
          page: "1",
          limit: "undefined",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'limit' must be a positive integer.",
              path: "limit",
              type: "field",
              value: "undefined",
            },
          ],
        });
      });

      it("returns errors with 400 status code when the page limit is provided and the page size is not provided", async () => {
        const params = new URLSearchParams({
          limit: "6",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'page' and 'limit' must both be provided for pagination.",
              path: "",
              type: "field",
              value: {
                limit: 6,
              },
            },
          ],
        });
      });

      it("returns errors with 400 status code when the page limit is not provided and the page size is provided", async () => {
        const params = new URLSearchParams({
          page: "1",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'page' and 'limit' must both be provided for pagination.",
              path: "",
              type: "field",
              value: {
                page: 1,
              },
            },
          ],
        });
      });
    });
  });

  describe("validateSortQuery", () => {
    const app = express();
    app.use(express.json());
    app.get(
      "/api/users/:userId/wordReminders",
      validateSortQuery,
      errorValidationHandler,
      word_reminder_list
    );

    describe("sort query", () => {
      it("calls the functions to get the user's words reminders with the sort query options", async () => {
        const params = new URLSearchParams({
          column: "created_at",
          direction: "1",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).toHaveBeenCalledTimes(1);
        expect(mockGetByUserId).toHaveBeenCalledWith(userId, {
          sort: {
            column: "created_at",
            direction: 1,
            table: "word_reminders",
          },
        });
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          wordReminders: [
            {
              id: 1,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 3,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: milieuJson,
                },
              ],
            },
          ],
        });
      });

      it("returns 400 status code when the 'column' is not in the 'Column' enum", async () => {
        const params = new URLSearchParams({
          column: "invalid_column",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: `'column' must be a value in this enum: ${Object.values(
                Column
              )}.`,
              path: "column",
              type: "field",
              value: "invalid_column",
            },
            {
              location: "query",
              msg: "'column' and 'direction' must be provided together for sorting.",
              path: "",
              type: "field",
              value: { column: "invalid_column" },
            },
          ],
        });
      });

      it("returns errors with status code 400 when the the sort query options do not have the 'direction' field", async () => {
        const params = new URLSearchParams({
          column: "created_at",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column' and 'direction' must be provided together for sorting.",
              path: "",
              type: "field",
              value: { column: "created_at" },
            },
          ],
        });
      });

      it("returns errors with status code 400 words when the sort query options do not have the 'column' field", async () => {
        const params = new URLSearchParams({
          direction: "1",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column' and 'direction' must be provided together for sorting.",
              path: "",
              type: "field",
              value: {
                direction: 1,
              },
            },
          ],
        });
      });

      it("calls the functions to get the user's word reminders when the params are empty", async () => {
        const params = new URLSearchParams({});

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).toHaveBeenCalledTimes(1);
        expect(mockGetByUserId).toHaveBeenCalledWith(userId, {});
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          wordReminders: [
            {
              id: 1,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 3,
              user_id: userId,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              user_words: [
                {
                  learned: false,
                  details: milieuJson,
                },
              ],
            },
          ],
        });
      });

      it("returns errors with status code 400 when the direction is not a number within -1 and 1", async () => {
        const params = new URLSearchParams({
          column: "created_at",
          direction: "true",
        });

        const response = await request(app)
          .get(`/api/users/${userId}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(mockGetByUserId).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'direction' must be an integer between -1 and 1.",
              path: "direction",
              type: "field",
              value: "true",
            },
          ],
        });
      });
    });
  });
});
