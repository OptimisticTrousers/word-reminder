import express from "express";
import request from "supertest";

import { word_reminder_list } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { validatePageQuery } from "../middleware/validate_page_query";
import { validateSortQuery } from "../middleware/validate_sort_query";

describe("validateQuery", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminder1 = {
    user_id: sampleUser1.id,
    finish: new Date(Date.now() + 1000), // make sure date comes after current date
    reminder: "2 hours",
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

  const wordReminders = [
    {
      id: "1",
      user_id: sampleUser1.id,
      reminder: wordReminder1.reminder,
      is_active: wordReminder1.is_active,
      has_reminder_onload: wordReminder1.has_reminder_onload,
      finish: wordReminder1.finish,
      words: [
        {
          learned: false,
          details: clemencyJson,
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "2",
      user_id: sampleUser1.id,
      reminder: wordReminder1.reminder,
      is_active: wordReminder1.is_active,
      has_reminder_onload: wordReminder1.has_reminder_onload,
      finish: wordReminder1.finish,
      words: [
        {
          learned: false,
          details: helloJson,
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "3",
      user_id: sampleUser1.id,
      reminder: wordReminder1.reminder,
      is_active: wordReminder1.is_active,
      has_reminder_onload: wordReminder1.has_reminder_onload,
      finish: wordReminder1.finish,
      words: [
        {
          learned: false,
          details: milieuJson,
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const getByUserIdMock = jest
    .spyOn(userWordsWordRemindersQueries, "getByUserId")
    .mockImplementation(async () => {
      return {
        wordReminders,
      };
    });

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
        const page = 1;
        const limit = 6;

        const response = await request(app)
          .get(
            `/api/users/${sampleUser1.id}/wordReminders?page=${page}&limit=${limit}`
          )
          .set("Accept", "application/json");

        expect(getByUserIdMock).toHaveBeenCalledTimes(1);
        expect(getByUserIdMock).toHaveBeenCalledWith(sampleUser1.id, {
          page,
          limit,
        });
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          wordReminders: [
            {
              id: "1",
              user_id: "1",
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: "2",
              user_id: "1",
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: "3",
              user_id: "1",
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              words: [
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
        const limit = 6;

        const response = await request(app)
          .get(
            `/api/users/${sampleUser1.id}/wordReminders?page=${undefined}&limit=${limit}`
          )
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
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
        const page = 1;

        const response = await request(app)
          .get(
            `/api/users/${sampleUser1.id}/wordReminders?page=${page}&limit=${undefined}`
          )
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
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
        const limit = 6;

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?limit=${limit}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
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
                limit: "6",
              },
            },
          ],
        });
      });

      it("returns errors with 400 status code when the page limit is not provided and the page size is provided", async () => {
        const page = 1;

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?page=${page}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
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
                page: "1",
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
          table: "word_reminders",
          column: "created_at",
          direction: "1",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).toHaveBeenCalledTimes(1);
        expect(getByUserIdMock).toHaveBeenCalledWith(sampleUser1.id, {
          sort: {
            table: "word_reminders",
            column: "created_at",
            direction: 1,
          },
        });
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          wordReminders: [
            {
              id: "1",
              user_id: "1",
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: "2",
              user_id: "1",
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: "3",
              user_id: "1",
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish.toISOString(),
              created_at: wordReminders[0].created_at.toISOString(),
              updated_at: wordReminders[0].updated_at.toISOString(),
              words: [
                {
                  learned: false,
                  details: milieuJson,
                },
              ],
            },
          ],
        });
      });

      it("returns errors with status code 400 when the sort query options do not have the 'table' field", async () => {
        const params = new URLSearchParams({
          column: "created_at",
          direction: "1",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
              path: "",
              type: "field",
              value: {
                column: "created_at",
                direction: "1",
              },
            },
          ],
        });
      });

      it("returns errors with status code 400 when the the sort query options do not have the 'direction' field", async () => {
        const params = new URLSearchParams({
          column: "created_at",
          table: "word_reminders",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
              path: "",
              type: "field",
              value: { column: "created_at", table: "word_reminders" },
            },
          ],
        });
      });

      it("returns errors with status code 400 words when the sort query options do not have the 'column' field", async () => {
        const params = new URLSearchParams({
          direction: "1",
          table: "word_reminders",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
              path: "",
              type: "field",
              value: {
                direction: "1",
                table: "word_reminders",
              },
            },
          ],
        });
      });

      it("returns errors with status code 400 when the sort query options do not have the 'table' and 'direction' fields", async () => {
        const params = new URLSearchParams({
          column: "created_at",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
              path: "",
              type: "field",
              value: {
                column: "created_at",
              },
            },
          ],
        });
      });

      it("returns errors with status code 400 when the sort query options do not have the 'table' and 'column' fields", async () => {
        const params = new URLSearchParams({
          direction: "1",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
              path: "",
              type: "field",
              value: {
                direction: "1",
              },
            },
          ],
        });
      });

      it("returns errors with status code 400 when the sort query options do not have the 'direction' and 'column' fields", async () => {
        const params = new URLSearchParams({
          table: "word_reminders",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
              path: "",
              type: "field",
              value: {
                table: "word_reminders",
              },
            },
          ],
        });
      });

      it("returns errors with status code 400 when the column is a non-empty string", async () => {
        const params = new URLSearchParams({
          table: "word_reminders",
          column: "",
          direction: "1",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'column' must be a non-empty string.",
              path: "column",
              type: "field",
              value: "",
            },
            {
              location: "query",
              msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
              path: "",
              type: "field",
              value: {
                column: "",
                direction: "1",
                table: "word_reminders",
              },
            },
          ],
        });
      });

      it("returns errors with status code 400 when the direction is not a number", async () => {
        const params = new URLSearchParams({
          column: "created_at",
          direction: "true",
          table: "word_reminders",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'direction' must be a positive integer.",
              path: "direction",
              type: "field",
              value: "true",
            },
          ],
        });
      });

      it("returns errors with status code 400 when the table is a non-empty string", async () => {
        const params = new URLSearchParams({
          column: "created_at",
          direction: "1",
          table: "",
        });

        const response = await request(app)
          .get(`/api/users/${sampleUser1.id}/wordReminders?${params}`)
          .set("Accept", "application/json");

        expect(getByUserIdMock).not.toHaveBeenCalled();
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "query",
              msg: "'table' must be a non-empty string.",
              path: "table",
              type: "field",
              value: "",
            },
            {
              location: "query",
              msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
              path: "",
              type: "field",
              value: {
                column: "created_at",
                direction: "1",
                table: "",
              },
            },
          ],
        });
      });
    });
  });
});
