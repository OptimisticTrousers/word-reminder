import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { wordQueries } from "../db/word_queries";
import { validateWordId } from "../middleware/validate_word_id";

describe("validateWordId", () => {
  const message = "message";

  const app = express();
  app.use(express.json());
  app.delete(
    "/api/words/:wordId",
    validateWordId,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  const wordId = "1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a 400 status code with the invalid word id message", async () => {
    const response = await request(app)
      .delete("/api/words/bob")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid word ID.",
    });
  });

  it("returns a 404 status code with word not found message", async () => {
    const mockGetById = jest
      .spyOn(wordQueries, "getById")
      .mockImplementation(async () => {
        return undefined;
      });

    const response = await request(app)
      .delete("/api/words/1")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Word not found.",
    });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(wordId);
  });

  it("calls the following request handler when the word exists and the word id is valid", async () => {
    const json = [
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

    const mockGetById = jest
      .spyOn(wordQueries, "getById")
      .mockImplementation(async () => {
        return { id: wordId, details: json, created_at: new Date() };
      });

    const response = await request(app)
      .delete(`/api/words/${wordId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message,
    });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(wordId);
  });
});
