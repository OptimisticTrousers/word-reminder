import express from "express";
import request from "supertest";

import { UserWordQueries } from "../db/userWordQueries";
import { WordQueries } from "../db/wordQueries";
import { create_word } from "../controllers/wordController";
import { Http } from "../utils/http";

describe("create_word", () => {
  const word = {
    id: "1",
    phonetic: "phonetic",
    word: "word",
    origin: "origin",
    meanings: [],
    phonetics: [
      {
        text: "woah-rd",
        audio: "mp3",
      },
    ],
  };
  const userId = "1";
  const userWord = {
    id: "1",
    user_id: userId,
    word_id: word.id,
    learned: false,
  };
  const getWordByWordMock = jest
    .spyOn(WordQueries.prototype, "getWordByWord")
    .mockImplementation(async () => {
      return null;
    });
  const createWordMock = jest
    .spyOn(WordQueries.prototype, "createWord")
    .mockImplementation(async () => {
      return word;
    });
  const httpGetMock = jest
    .spyOn(Http.prototype, "get")
    .mockImplementation(async () => {
      return { json: word, status: 200 };
    });
  const createUserWordMock = jest
    .spyOn(UserWordQueries.prototype, "createUserWord")
    .mockImplementation(async () => {
      return userWord;
    });

  beforeEach(() => {
    getWordByWordMock.mockClear();
    createWordMock.mockClear();
    httpGetMock.mockClear();
    createUserWordMock.mockClear();
  });

  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/words", create_word);

  it("creates a word and a user word", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/words`)
      .set("Accept", "application/json")
      .send({ word: word.word });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.word).toEqual(word);
    expect(createUserWordMock).toHaveBeenCalledTimes(1);
    expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
    expect(createWordMock).toHaveBeenCalledTimes(1);
    expect(createWordMock).toHaveBeenCalledWith(word);
    expect(httpGetMock).toHaveBeenCalledTimes(1);
    expect(httpGetMock).toHaveBeenCalledWith(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
    );
    expect(getWordByWordMock).toHaveBeenCalledTimes(1);
    expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
  });

  it("returns 400 status code when neither a word or csv file was provided", async () => {
    const response = await request(app)
      .post("/api/users/1/words")
      .set("Accept", "application/json")
      .send({});

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "Word or CSV file is required.",
        path: "word",
        type: "field",
        value: "",
      },
    ]);
  });

  it("creates some words when some words in the csv file exist", async () => {});

  it("creates no words when no words in the csv file exist", async () => {});

  it("creates the word if it is all uppercase", async () => {
    const word = {
      id: "1",
      phonetic: "phonetic",
      word: "WORD",
      origin: "origin",
      meanings: [],
      phonetics: [
        {
          text: "woah-rd",
          audio: "mp3",
        },
      ],
    };

    const response = await request(app)
      .post(`/api/users/${userId}/words`)
      .set("Accept", "application/json")
      .send({ word: word.word });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.word).toEqual({
      ...word,
      word: word.word.toLowerCase(),
    });
    expect(createUserWordMock).toHaveBeenCalledTimes(1);
    expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
    expect(createWordMock).toHaveBeenCalledTimes(1);
    expect(createWordMock).toHaveBeenCalledWith({
      ...word,
      word: word.word.toLowerCase(),
    });
    expect(httpGetMock).toHaveBeenCalledTimes(1);
    expect(httpGetMock).toHaveBeenCalledWith(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
    );
    expect(getWordByWordMock).toHaveBeenCalledTimes(1);
    expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
  });

  it("does not create a word when the provided word is not a valid word", async () => {
    const word = "this is a sentence, not a word.";
    const message =
      "Sorry pal, we couldn't find definitions for the word you were looking for.";

    httpGetMock.mockImplementation(async () => {
      return { json: { message }, status: 200 };
    });

    const response = await request(app)
      .post("/api/users/1/words")
      .set("Accept", "application/json")
      .send({ word });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
    expect(httpGetMock).toHaveBeenCalledTimes(1);
    expect(httpGetMock).toHaveBeenCalledWith(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    expect(getWordByWordMock).toHaveBeenCalledTimes(1);
    expect(getWordByWordMock).toHaveBeenCalledWith(word);
  });

  it("throws an error when the csv file is formatted incorrectly", async () => {});

  it("does not create a word if it already exists", async () => {
    getWordByWordMock.mockImplementation(async () => {
      return word;
    });

    const response = await request(app)
      .post(`/api/users/${userId}/words`)
      .set("Accept", "application/json")
      .send({ word: word.word });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.word).toEqual(word);
    expect(createUserWordMock).toHaveBeenCalledTimes(1);
    expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
    expect(createWordMock).not.toHaveBeenCalled();
    expect(httpGetMock).not.toHaveBeenCalled();
    expect(getWordByWordMock).toHaveBeenCalledTimes(1);
    expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
  });

  it("throws an error when both a word and csv file was provided in the payload", async () => {});
});
