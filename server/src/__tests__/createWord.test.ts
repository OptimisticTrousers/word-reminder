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
  const successMessage = "Success!";
  const errorMessage = "You have already added this word in your dictionary.";

  const createUserWordMock = jest
    .spyOn(UserWordQueries.prototype, "createUserWord")
    .mockImplementation(async () => {
      return { userWord, message: successMessage };
    });
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

  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/words", create_word);

  beforeEach(() => {
    getWordByWordMock.mockClear();
    createWordMock.mockClear();
    httpGetMock.mockClear();
    createUserWordMock.mockClear();
  });

  describe("text word creation", () => {
    fit("calls the functions to create a word and a user word", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word: word.word });

      expect(response.body).toEqual({});
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.word).toEqual(word);
      expect(response.body.message).toBe(successMessage);
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(1);
      expect(createWordMock).toHaveBeenCalledWith(word);
      expect(createUserWordMock).toHaveBeenCalledTimes(1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
    });

    it("does not call the functions to create a word if it already exists", async () => {
      getWordByWordMock.mockImplementationOnce(async () => {
        return word;
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word: word.word });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.word).toEqual(word);
      expect(response.body.message).toEqual(successMessage);
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
      expect(httpGetMock).not.toHaveBeenCalled();
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).toHaveBeenCalledTimes(1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
    });

    it("does not create a user word if it already exists", async () => {
      createUserWordMock.mockImplementationOnce(async () => {
        return {
          userWord: null,
          message: errorMessage,
        };
      });
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word: word.word });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(409);
      expect(response.body.word).toBeNull();
      expect(response.body.message).toBe(errorMessage);
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(1);
      expect(createWordMock).toHaveBeenCalledWith(word);
      expect(createUserWordMock).toHaveBeenCalledTimes(1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
    });

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
      expect(response.body.message).toBe(successMessage);
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(1);
      expect(createWordMock).toHaveBeenCalledWith({
        ...word,
        word: word.word.toLowerCase(),
      });
      expect(createUserWordMock).toHaveBeenCalledTimes(1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
    });

    it("does not create a word when the provided word is not a valid word", async () => {
      const word = "this is a sentence, not a word.";
      const message =
        "Sorry pal, we couldn't find definitions for the word you were looking for.";

      httpGetMock.mockImplementation(async () => {
        return { json: { message }, status: 200 };
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(message);
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
    });
  });

  describe("csv word creation", () => {
    createUserWordMock.mockRestore();

    it("works when some of the words in the csv file are duplicates", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "../db/duplicates.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("5 words have been created.");
      expect(createUserWordMock).toHaveBeenCalledTimes(5);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, "1");
      expect(createUserWordMock).toHaveBeenCalledWith(userId, "2");
      expect(createUserWordMock).toHaveBeenCalledWith(userId, "3");
      expect(createUserWordMock).toHaveBeenCalledWith(userId, "4");
      expect(createUserWordMock).toHaveBeenCalledWith(userId, "5");
      expect(createWordMock).toHaveBeenCalledTimes(1);
      expect(createWordMock).toHaveBeenCalledWith(word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
      );
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
    });

    it("creates some words when some of words in the csv file already exist in the database", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "../db/words.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("4 words have been created.");
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

    it("creates no words when the csv file is empty", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "../db/empty.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "0 words have been created because the CSV file is empty."
      );
      expect(createUserWordMock).not.toHaveBeenCalled();
      expect(createWordMock).not.toHaveBeenCalled();
      expect(httpGetMock).not.toHaveBeenCalled();
      expect(getWordByWordMock).not.toHaveBeenCalled();
    });

    it("creates no words when no words in the csv file exist", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "../db/phrases.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "0 words have been created because there are no valid words in the CSV file."
      );
      expect(createUserWordMock).not.toHaveBeenCalled();
      expect(createWordMock).toHaveBeenCalledTimes(3);
      expect(createWordMock).toHaveBeenCalledWith("a man");
      expect(createWordMock).toHaveBeenCalledWith("a plan");
      expect(createWordMock).toHaveBeenCalledWith("a canal");
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
      );
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
    });

    it("throws an error when the csv file is formatted incorrectly", async () => {});
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

  it("throws an error when both a word and csv file was provided in the payload", async () => {});
});
