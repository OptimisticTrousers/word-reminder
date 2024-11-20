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
    jest.clearAllMocks();
  });

  // describe("text word creation", () => {
  //   it("calls the functions to create a word and a user word", async () => {
  //     const response = await request(app)
  //       .post(`/api/users/${userId}/words`)
  //       .set("Accept", "application/json")
  //       .send({ word: word.word });

  //     expect(response.headers["content-type"]).toMatch(/json/);
  //     expect(response.status).toBe(200);
  //     expect(response.body.word).toEqual(word);
  //     expect(response.body.message).toBe(successMessage);
  //     expect(getWordByWordMock).toHaveBeenCalledTimes(1);
  //     expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
  //     expect(httpGetMock).toHaveBeenCalledTimes(1);
  //     expect(httpGetMock).toHaveBeenCalledWith(
  //       `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
  //     );
  //     expect(createWordMock).toHaveBeenCalledTimes(1);
  //     expect(createWordMock).toHaveBeenCalledWith(word);
  //     expect(createUserWordMock).toHaveBeenCalledTimes(1);
  //     expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
  //   });

  //   it("does not call the functions to create a word if it already exists", async () => {
  //     getWordByWordMock.mockImplementationOnce(async () => {
  //       return word;
  //     });

  //     const response = await request(app)
  //       .post(`/api/users/${userId}/words`)
  //       .set("Accept", "application/json")
  //       .send({ word: word.word });

  //     expect(response.headers["content-type"]).toMatch(/json/);
  //     expect(response.status).toBe(200);
  //     expect(response.body.word).toEqual(word);
  //     expect(response.body.message).toEqual(successMessage);
  //     expect(getWordByWordMock).toHaveBeenCalledTimes(1);
  //     expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
  //     expect(httpGetMock).not.toHaveBeenCalled();
  //     expect(createWordMock).not.toHaveBeenCalled();
  //     expect(createUserWordMock).toHaveBeenCalledTimes(1);
  //     expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
  //   });

  //   it("does not create a user word if it already exists", async () => {
  //     createUserWordMock.mockImplementationOnce(async () => {
  //       return {
  //         userWord: null,
  //         message: errorMessage,
  //       };
  //     });
  //     const response = await request(app)
  //       .post(`/api/users/${userId}/words`)
  //       .set("Accept", "application/json")
  //       .send({ word: word.word });

  //     expect(response.headers["content-type"]).toMatch(/json/);
  //     expect(response.status).toBe(409);
  //     expect(response.body.word).toBeNull();
  //     expect(response.body.message).toBe(errorMessage);
  //     expect(getWordByWordMock).toHaveBeenCalledTimes(1);
  //     expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
  //     expect(httpGetMock).toHaveBeenCalledTimes(1);
  //     expect(httpGetMock).toHaveBeenCalledWith(
  //       `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
  //     );
  //     expect(createWordMock).toHaveBeenCalledTimes(1);
  //     expect(createWordMock).toHaveBeenCalledWith(word);
  //     expect(createUserWordMock).toHaveBeenCalledTimes(1);
  //     expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
  //   });

  //   it("creates the word if it is all uppercase", async () => {
  //     const word = {
  //       id: "1",
  //       phonetic: "phonetic",
  //       word: "WORD",
  //       origin: "origin",
  //       meanings: [],
  //       phonetics: [
  //         {
  //           text: "woah-rd",
  //           audio: "mp3",
  //         },
  //       ],
  //     };

  //     const response = await request(app)
  //       .post(`/api/users/${userId}/words`)
  //       .set("Accept", "application/json")
  //       .send({ word: word.word });

  //     expect(response.headers["content-type"]).toMatch(/json/);
  //     expect(response.status).toBe(200);
  //     expect(response.body.word).toEqual({
  //       ...word,
  //       word: word.word.toLowerCase(),
  //     });
  //     expect(response.body.message).toBe(successMessage);
  //     expect(getWordByWordMock).toHaveBeenCalledTimes(1);
  //     expect(getWordByWordMock).toHaveBeenCalledWith(word.word);
  //     expect(httpGetMock).toHaveBeenCalledTimes(1);
  //     expect(httpGetMock).toHaveBeenCalledWith(
  //       `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
  //     );
  //     expect(createWordMock).toHaveBeenCalledTimes(1);
  //     expect(createWordMock).toHaveBeenCalledWith({
  //       ...word,
  //       word: word.word.toLowerCase(),
  //     });
  //     expect(createUserWordMock).toHaveBeenCalledTimes(1);
  //     expect(createUserWordMock).toHaveBeenCalledWith(userId, word.id);
  //   });

  //   it("does not create a word when the provided word is not a valid word", async () => {
  //     const word = "this is a sentence, not a word.";
  //     const message =
  //       "Sorry pal, we couldn't find definitions for the word you were looking for.";

  //     httpGetMock.mockImplementation(async () => {
  //       return { json: { message }, status: 200 };
  //     });

  //     const response = await request(app)
  //       .post(`/api/users/${userId}/words`)
  //       .set("Accept", "application/json")
  //       .send({ word });

  //     expect(response.headers["content-type"]).toMatch(/json/);
  //     expect(response.status).toBe(400);
  //     expect(response.body.message).toBe(message);
  //     expect(getWordByWordMock).toHaveBeenCalledTimes(1);
  //     expect(getWordByWordMock).toHaveBeenCalledWith(word);
  //     expect(httpGetMock).toHaveBeenCalledTimes(1);
  //     expect(httpGetMock).toHaveBeenCalledWith(
  //       `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
  //     );
  //   });
  // });

  describe("csv word creation", () => {
    const wordId1 = "1";
    const wordId2 = "2";
    const wordId3 = "3";
    const wordId4 = "4";
    const word1 = "dispensation";
    const word2 = "serreptitously";
    const word3 = "gutatory";
    const word4 = "patronage";

    beforeEach(() => {
      httpGetMock.mockImplementationOnce(async () => {
        return { json: word1, status: 200 };
      });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: word2, status: 200 };
      });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: word3, status: 200 };
      });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: word4, status: 200 };
      });
      createWordMock.mockImplementationOnce(async () => {
        return { word: word1, id: wordId1 };
      });
      createWordMock.mockImplementationOnce(async () => {
        return { word: word2, id: wordId2 };
      });
      createWordMock.mockImplementationOnce(async () => {
        return { word: word3, id: wordId3 };
      });
      createWordMock.mockImplementationOnce(async () => {
        return { word: word4, id: wordId4 };
      });
      createUserWordMock.mockImplementationOnce(async () => {
        return { userWord: { word: word1, userId }, message: successMessage };
      });
      createUserWordMock.mockImplementationOnce(async () => {
        return { userWord: { word: word2, userId }, message: successMessage };
      });
      createUserWordMock.mockImplementationOnce(async () => {
        return { userWord: { word: word3, userId }, message: successMessage };
      });
      createUserWordMock.mockImplementationOnce(async () => {
        return { userWord: { word: word4, userId }, message: successMessage };
      });
    });

    it("creates words and user words", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/columnWords.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("4 words have been created.");
      expect(getWordByWordMock).toHaveBeenCalledTimes(4);
      expect(getWordByWordMock).toHaveBeenCalledWith(word1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word2);
      expect(getWordByWordMock).toHaveBeenCalledWith(word3);
      expect(getWordByWordMock).toHaveBeenCalledWith(word4);
      expect(httpGetMock).toHaveBeenCalledTimes(4);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word1}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word2}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word3}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word4}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(4);
      expect(createWordMock).toHaveBeenCalledWith(word1);
      expect(createWordMock).toHaveBeenCalledWith(word2);
      expect(createWordMock).toHaveBeenCalledWith(word3);
      expect(createWordMock).toHaveBeenCalledWith(word4);
      expect(createUserWordMock).toHaveBeenCalledTimes(4);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId2);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId3);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId4);
    });

    // fit("creates words and user words by ignoring duplicate words in the csv file", async () => {
    //   const words = [
    //     "insert",
    //     "duplicate",
    //     "duplicate",
    //     "words",
    //     "into",
    //     "database",
    //   ];
    //   const wordId1 = "1";
    //   const wordId2 = "2";
    //   const wordId3 = "3";
    //   const wordId4 = "4";
    //   const wordId5 = "5";
    //   const word1 = words[0];
    //   const word2 = words[1];
    //   const word3 = words[3];
    //   const word4 = words[4];
    //   const word5 = words[5];

    //   getWordByWordMock.mockImplementationOnce(async () => {
    //     return null;
    //   });
    //   getWordByWordMock.mockImplementationOnce(async () => {
    //     return null;
    //   });
    //   getWordByWordMock.mockImplementationOnce(async () => {
    //     return word2;
    //   });

    //   httpGetMock.mockImplementationOnce(async () => {
    //     return { json: word1, status: 200 };
    //   });
    //   httpGetMock.mockImplementationOnce(async () => {
    //     return { json: word2, status: 200 };
    //   });
    //   httpGetMock.mockImplementationOnce(async () => {
    //     return { json: word2, status: 200 };
    //   });
    //   httpGetMock.mockImplementationOnce(async () => {
    //     return { json: word3, status: 200 };
    //   });
    //   httpGetMock.mockImplementationOnce(async () => {
    //     return { json: word4, status: 200 };
    //   });
    //   httpGetMock.mockImplementationOnce(async () => {
    //     return { json: word5, status: 200 };
    //   });
    //   createWordMock.mockImplementationOnce(async () => {
    //     return { word: word1, id: wordId1 };
    //   });
    //   createWordMock.mockImplementationOnce(async () => {
    //     return { word: word2, id: wordId2 };
    //   });
    //   createWordMock.mockImplementationOnce(async () => {
    //     return { word: word3, id: wordId3 };
    //   });
    //   createWordMock.mockImplementationOnce(async () => {
    //     return { word: word4, id: wordId4 };
    //   });
    //   createWordMock.mockImplementationOnce(async () => {
    //     return { word: word5, id: wordId5 };
    //   });
    //   const response = await request(app)
    //     .post(`/api/users/${userId}/words`)
    //     .set("Accept", "application/json")
    //     .attach("csv", "src/csv/columnWords.csv");

    //   expect(response.headers["content-type"]).toMatch(/json/);
    //   expect(response.status).toBe(200);
    //   expect(response.body.message).toBe("5 words have been created.");
    //   expect(getWordByWordMock).toHaveBeenCalledTimes(5);
    //   expect(getWordByWordMock).toHaveBeenCalledWith(words[0]);
    //   expect(getWordByWordMock).toHaveBeenCalledWith(words[1]);
    //   expect(getWordByWordMock).toHaveBeenCalledWith(words[3]);
    //   expect(getWordByWordMock).toHaveBeenCalledWith(words[4]);
    //   expect(getWordByWordMock).toHaveBeenCalledWith(words[5]);
    //   expect(httpGetMock).toHaveBeenCalledTimes(5);
    //   expect(httpGetMock).toHaveBeenCalledWith(
    //     `https://api.dictionaryapi.dev/api/v2/entries/en/${words[0]}`
    //   );
    //   expect(httpGetMock).toHaveBeenCalledWith(
    //     `https://api.dictionaryapi.dev/api/v2/entries/en/${words[1]}`
    //   );
    //   expect(httpGetMock).toHaveBeenCalledWith(
    //     `https://api.dictionaryapi.dev/api/v2/entries/en/${words[3]}`
    //   );
    //   expect(httpGetMock).toHaveBeenCalledWith(
    //     `https://api.dictionaryapi.dev/api/v2/entries/en/${words[4]}`
    //   );
    //   expect(httpGetMock).toHaveBeenCalledWith(
    //     `https://api.dictionaryapi.dev/api/v2/entries/en/${words[5]}`
    //   );
    //   expect(createWordMock).toHaveBeenCalledTimes(5);
    //   expect(createWordMock).toHaveBeenCalledWith(word1);
    //   expect(createWordMock).toHaveBeenCalledWith(word2);
    //   expect(createWordMock).toHaveBeenCalledWith(word3);
    //   expect(createWordMock).toHaveBeenCalledWith(word4);
    //   expect(createWordMock).toHaveBeenCalledWith(word5);
    //   expect(createUserWordMock).toHaveBeenCalledTimes(5);
    //   expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId1);
    //   expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId2);
    //   expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId3);
    //   expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId4);
    //   expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId5);
    // });

    it("creates words and user words even when any of words in the csv file already exist in the database", async () => {
      getWordByWordMock.mockReset();
      getWordByWordMock.mockImplementationOnce(async () => {
        return { word: word1 };
      });
      getWordByWordMock.mockImplementation(async () => {
        return null;
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/columnWords.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("4 words have been created.");
      expect(getWordByWordMock).toHaveBeenCalledTimes(4);
      expect(getWordByWordMock).toHaveBeenCalledWith(word1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word2);
      expect(getWordByWordMock).toHaveBeenCalledWith(word3);
      expect(getWordByWordMock).toHaveBeenCalledWith(word4);
      expect(httpGetMock).toHaveBeenCalledTimes(3);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word2}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word3}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word4}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(3);
      expect(createWordMock).toHaveBeenCalledWith(word2);
      expect(createWordMock).toHaveBeenCalledWith(word3);
      // expect(createWordMock).toHaveBeenCalledWith(word4);
      expect(createUserWordMock).toHaveBeenCalledTimes(4);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId2);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId3);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId4);
    });

    it("creates words and user words and skips over user words that already exist in the database", async () => {
      createUserWordMock.mockReset();
      getWordByWordMock.mockImplementationOnce(async () => {
        return { word: word1 };
      });
      getWordByWordMock.mockImplementation(async () => {
        return null;
      });
      createUserWordMock.mockImplementationOnce(async () => {
        return {
          userWord: null,
          message: "You have already added this word in your dictionary.",
        };
      });
      createUserWordMock.mockImplementationOnce(async () => {
        return { userWord: { word: word2, userId }, message: successMessage };
      });
      createUserWordMock.mockImplementationOnce(async () => {
        return { userWord: { word: word3, userId }, message: successMessage };
      });
      createUserWordMock.mockImplementationOnce(async () => {
        return { userWord: { word: word4, userId }, message: successMessage };
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/columnWords.csv");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "You have already added 1 of these words in your dictionary."
      );
      expect(getWordByWordMock).toHaveBeenCalledTimes(4);
      expect(getWordByWordMock).toHaveBeenCalledWith(word1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word2);
      expect(getWordByWordMock).toHaveBeenCalledWith(word3);
      expect(getWordByWordMock).toHaveBeenCalledWith(word4);
      expect(httpGetMock).toHaveBeenCalledTimes(4);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word1}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word2}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word3}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word4}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(4);
      expect(createWordMock).toHaveBeenCalledWith(word1);
      expect(createWordMock).toHaveBeenCalledWith(word2);
      expect(createWordMock).toHaveBeenCalledWith(word3);
      expect(createWordMock).toHaveBeenCalledWith(word4);
      expect(createUserWordMock).toHaveBeenCalledTimes(4);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId1);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId2);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId3);
      expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId4);
    });

    it("creates no words and user words when the csv file is empty", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/empty.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "0 words have been created because the CSV file is empty."
      );
      expect(getWordByWordMock).not.toHaveBeenCalled();
      expect(httpGetMock).not.toHaveBeenCalled();
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).not.toHaveBeenCalled();
    });

    it("creates valid words even if there are any invalid words in the csv", async () => {
      const word1 = "valid";
      const word2 = "word";
      const word3 = "not a valid word";
      const wordId1 = "1";
      const wordId2 = "2";
      jest.resetAllMocks();
      httpGetMock.mockImplementationOnce(async () => {
        return { json: word1, status: 200 };
      });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: word2, status: 200 };
      });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: { message: "Invalid word." }, status: 400 };
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/someValid.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `You have value(s) in your CSV file that are not words. Please change them to valid word(s) and re-import your words: ${word3}`
      );
      expect(getWordByWordMock).toHaveBeenCalledTimes(3);
      expect(getWordByWordMock).toHaveBeenCalledWith(word1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word2);
      expect(getWordByWordMock).toHaveBeenCalledWith(word3);
      expect(httpGetMock).toHaveBeenCalledTimes(3);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word1}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word2}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word3}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(2);
      expect(createWordMock).toHaveBeenCalledWith(word1);
      expect(createWordMock).toHaveBeenCalledWith(word2);
      expect(createUserWordMock).toHaveBeenCalledTimes(2);
      expect(createUserWordMock).toHaveBeenCalledWith(word1, wordId1);
      expect(createUserWordMock).toHaveBeenCalledWith(word2, wordId2);
    });

    it("creates no words when no valid words in the csv file exist", async () => {
      jest.resetAllMocks();
      httpGetMock.mockImplementation(async () => {
        return { json: { message: "Invalid word." }, status: 400 };
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/phrases.csv");

      const phrases = ["a man", "a plan", "a canal"];

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        `You have value(s) in your CSV file that are not words. Please change them to valid word(s) and re-import your words: ${phrases[0]}, ${phrases[1]}, and ${phrases[2]}`
      );
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

    it("sends an error message when the CSV parser returns an error", async () => {
      const message = "CSV file was parsed incorrectly.";
      jest.spyOn(Csv.prototype, "read").mockImplementation(async () => {
        return {
          records: [],
          count: 0,
          error: message,
        };
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/incorrect.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(message);
      expect(getWordByWordMock).not.toHaveBeenCalled();
      expect(httpGetMock).not.toHaveBeenCalled();
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
