import express from "express";
import request from "supertest";

import { UserWordQueries } from "../db/userWordQueries";
import { WordQueries } from "../db/wordQueries";
import { create_word } from "../controllers/wordController";
import { Http } from "../utils/http";
import { Csv } from "../utils/csv";

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

  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/words", create_word);

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

  beforeEach(() => {
    getWordByWordMock.mockClear();
    createWordMock.mockClear();
    httpGetMock.mockClear();
    createUserWordMock.mockClear();
  });

  describe("text word creation", () => {
    it("calls the functions to create a word and a user word", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word: word.word });

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
    it("creates words and user words", async () => {
      const filePath = __dirname + "../db/columnWords.csv";
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", filePath);

      const words = ["dispensation", "serreptitously", "gutatory", "patronage"];
      const wordId1 = "1";
      const wordId2 = "2";
      const wordId3 = "3";
      const wordId4 = "4";

      httpGetMock.mockImplementationOnce(async () => {
        return { json: { word: words[0], id: wordId1 }, status: 200 };
      });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: { word: words[1], id: wordId2 }, status: 200 };
      });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: { word: words[2], id: wordId3 }, status: 200 };
      });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: { word: words[3], id: wordId4 }, status: 200 };
      });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("4 words have been created.");
      expect(getWordByWordMock).toHaveBeenCalledTimes(4);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[0]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[1]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[2]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[3]);
      expect(httpGetMock).toHaveBeenCalledTimes(4);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[0]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[1]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[2]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[3]}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(4);
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[0],
        id: wordId1,
      });
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[1],
        id: wordId2,
      });
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[2],
        id: wordId3,
      });
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[3],
        id: wordId4,
      });
      expect(createUserWordMock).toHaveBeenCalledTimes(4);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId2);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId3);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId4);
    });

    it("creates words and user words by ignoring duplicate words in the csv file", async () => {
      const filePath = __dirname + "../db/columnWords.csv";
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", filePath);

      const words = [
        "insert",
        "duplicate",
        "duplicate",
        "words",
        "into",
        "database",
      ];
      const wordId1 = "1";
      const wordId2 = "2";
      const wordId3 = "3";
      const wordId4 = "4";
      const wordId5 = "5";

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("5 words have been created.");
      expect(getWordByWordMock).toHaveBeenCalledTimes(5);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[0]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[1]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[3]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[4]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[5]);
      expect(httpGetMock).toHaveBeenCalledTimes(5);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[0]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[1]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[3]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[4]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[5]}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(5);
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[0],
        id: wordId1,
      });
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[1],
        id: wordId2,
      });
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[3],
        id: wordId3,
      });
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[4],
        id: wordId4,
      });
      expect(createWordMock).toHaveBeenCalledWith({
        word: words[5],
        id: wordId5,
      });
      expect(createUserWordMock).toHaveBeenCalledTimes(5);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId2);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId3);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId5);
    });

    it("creates some words and user words when some of words in the csv file already exist in the database", async () => {
      const wordId1 = "1";
      const wordId2 = "2";
      const wordId3 = "3";
      const wordId4 = "4";
      const words = ["dispensation", "serreptitously", "gutatory", "patronage"];
      getWordByWordMock.mockImplementationOnce(async () => {
        return { word: words[0] };
      });
      getWordByWordMock.mockImplementationOnce(async () => {
        return { word: words[1] };
      });

      const filePath = __dirname + "../db/columnWords.csv";
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", filePath);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("4 words have been created.");
      expect(getWordByWordMock).toHaveBeenCalledTimes(4);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[0]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[1]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[2]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[3]);
      expect(httpGetMock).toHaveBeenCalledTimes(2);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[2]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[3]}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(2);
      expect(createWordMock).toHaveBeenCalledWith({ word: words[2] });
      expect(createWordMock).toHaveBeenCalledWith({ word: words[3] });
      expect(createUserWordMock).toHaveBeenCalledTimes(4);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId2);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId3);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId4);
    });

    it("creates no words and user words when the csv file is empty", async () => {
      const filePath = __dirname + "../db/columnWords.csv";
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", filePath);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "0 words have been created because the CSV file is empty."
      );
      expect(getWordByWordMock).not.toHaveBeenCalled();
      expect(httpGetMock).not.toHaveBeenCalled();
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).not.toHaveBeenCalled();
    });

    it("creates some words when there are some valid words in the csv", async () => {
      const wordId1 = "1";
      const wordId2 = "2";
      const words = ["valid", "word", "not a valid word"];

      const filePath = __dirname + "../db/columnWords.csv";
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", filePath);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "2 words were created, 1 value is not a valid word"
      );
      expect(getWordByWordMock).toHaveBeenCalledTimes(3);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[0]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[1]);
      expect(getWordByWordMock).toHaveBeenCalledWith(words[2]);
      expect(httpGetMock).toHaveBeenCalledTimes(3);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[0]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[1]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${words[2]}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(2);
      expect(createWordMock).toHaveBeenCalledWith(words[1]);
      expect(createWordMock).toHaveBeenCalledWith(words[2]);
      expect(createUserWordMock).toHaveBeenCalledTimes(2);
      expect(createUserWordMock).toHaveBeenCalledWith(words[1], wordId1);
      expect(createUserWordMock).toHaveBeenCalledWith(words[2], wordId2);
    });

    it("creates no words when no valid words in the csv file exist", async () => {
      const filePath = __dirname + "../db/columnWords.csv";
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", filePath);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "0 words have been created because there are no valid words in the CSV file."
      );
      const phrases = ["a man", "a plan", "a canal"];
      expect(getWordByWordMock).toHaveBeenCalledTimes(3);
      expect(getWordByWordMock).toHaveBeenCalledWith(phrases[0]);
      expect(getWordByWordMock).toHaveBeenCalledWith(phrases[1]);
      expect(getWordByWordMock).toHaveBeenCalledWith(phrases[2]);
      expect(httpGetMock).toHaveBeenCalledTimes(3);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${phrases[0]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${phrases[1]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${phrases[2]}`
      );
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).not.toHaveBeenCalled();
    });
  });

  it("returns 400 status code when neither a word or csv file was provided", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/words`)
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
});
