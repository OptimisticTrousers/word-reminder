import asyncHandler from "express-async-handler";
import express from "express";
import request from "supertest";

import { word_list } from "../controllers/wordController";
import { UserWordQueries } from "../db/userWordQueries";

describe("word_list", () => {
  const userId = "1";
  const wordId = "1";
  const userWord = {
    id: "1",
    user_id: userId,
    word_id: wordId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWordISO = {
    ...userWord,
    created_at: userWord.created_at.toISOString(),
    updated_at: userWord.created_at.toISOString(),
  };

  const getUserWordsByUserIdMock = jest
    .spyOn(UserWordQueries.prototype, "getUserWordsByUserId")
    .mockImplementation(async () => {
      return {
        userWords: [userWord],
      };
    })
    .mockName("getUserWordsByUserId");

  beforeEach(() => {
    getUserWordsByUserIdMock.mockClear();
  });

  const app = express();
  app.use(express.json());
  app.get("/api/users/:userId/words", word_list);

  describe("no query", () => {
    it("calls the functions to get the user's words with none of the query options", async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/words`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getUserWordsByUserIdMock).toHaveBeenCalledWith(userId, {});
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.userWords).toEqual([userWordISO]);
      expect(response.body.previous).toBeUndefined();
      expect(response.body.next).toBeUndefined();
    });
  });

  describe("all queries", () => {
    it("calls the functions to get the user's words with all of the query options", async () => {
      const params = new URLSearchParams({
        table: "user_words",
        column: "created_at",
        direction: "-1",
      });
      const learned = true;
      const limit = 6;
      const page = 1;
      const search = "bob";

      const response = await request(app)
        .get(
          `/api/users/${userId}/words?${params}&learned=${learned}&page=${page}&limit=${limit}&search=${search}`
        )
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getUserWordsByUserIdMock).toHaveBeenCalledWith(userId, {
        sort: {
          column: "created_at",
          table: "user_words",
          direction: -1,
        },
        learned,
        limit,
        page,
        search,
      });
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.userWords).toEqual([userWordISO]);
    });
  });

  describe("learned query", () => {
    const learned = true;
    it("calls the functions to get the user's words with the learned option", async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/words?learned=${learned}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getUserWordsByUserIdMock).toHaveBeenCalledWith(userId, {
        learned,
      });
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.userWords).toEqual([userWordISO]);
    });

    it("returns errors with status code 400 when the learned option is not a boolean", async () => {
      const learned = "hello";
      const response = await request(app)
        .get(`/api/users/${userId}/words?learned=${learned}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'learned' must be a boolean.",
          path: "learned",
          type: "field",
          value: "hello",
        },
      ]);
    });
  });

  describe("sort query", () => {
    it("calls the functions to get the user's words with the sort query options", async () => {
      const params = new URLSearchParams({
        table: "words",
        column: "word",
        direction: "1",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getUserWordsByUserIdMock).toHaveBeenCalledWith(userId, {
        sort: {
          table: "words",
          column: "word",
          direction: 1,
        },
      });
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.userWords).toEqual([userWordISO]);
    });

    it("returns errors with status code 400 when the sort query options do not have the 'table' field", async () => {
      const params = new URLSearchParams({ column: "word", direction: "1" });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
          path: "",
          type: "field",
          value: {
            column: "word",
            direction: "1",
          },
        },
      ]);
    });

    it("returns errors with status code 400 when the the sort query options do not have the 'direction' field", async () => {
      const params = new URLSearchParams({
        column: "word",
        table: "words",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
          path: "",
          type: "field",
          value: { column: "word", table: "words" },
        },
      ]);
    });

    it("returns errors with status code 400 words when the sort query options do not have the 'column' field", async () => {
      const params = new URLSearchParams({
        direction: "1",
        table: "words",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
          path: "",
          type: "field",
          value: {
            direction: "1",
            table: "words",
          },
        },
      ]);
    });

    it("returns errors with status code 400 when the sort query options do not have the 'table' and 'direction' fields", async () => {
      const params = new URLSearchParams({
        column: "word",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
          path: "",
          type: "field",
          value: {
            column: "word",
          },
        },
      ]);
    });

    it("returns errors with status code 400 when the sort query options do not have the 'table' and 'column' fields", async () => {
      const params = new URLSearchParams({
        direction: "1",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
          path: "",
          type: "field",
          value: {
            direction: "1",
          },
        },
      ]);
    });

    it("returns errors with status code 400 when the sort query options do not have the 'direction' and 'column' fields", async () => {
      const params = new URLSearchParams({
        table: "words",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'column', 'direction', and 'table' must all be provided together for sorting.",
          path: "",
          type: "field",
          value: {
            table: "words",
          },
        },
      ]);
    });

    it("returns errors with status code 400 when the column is a non-empty string", async () => {
      const params = new URLSearchParams({
        table: "words",
        column: "",
        direction: "1",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
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
            table: "words",
          },
        },
      ]);
    });

    it("returns errors with status code 400 when the direction is not a number", async () => {
      const params = new URLSearchParams({
        column: "word",
        direction: "true",
        table: "words",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'direction' must be an integer.",
          path: "direction",
          type: "field",
          value: "true",
        },
      ]);
    });

    it("returns errors with status code 400 when the table is a non-empty string", async () => {
      const params = new URLSearchParams({
        column: "word",
        direction: "1",
        table: "",
      });

      const response = await request(app)
        .get(`/api/users/${userId}/words?${params}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
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
            column: "word",
            direction: "1",
            table: "",
          },
        },
      ]);
    });
  });

  describe("search query", () => {
    it("calls the functions to get the user's worth with the search query option", async () => {
      const search = "givemeresults";

      const response = await request(app)
        .get(`/api/users/${userId}/words?search=${search}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getUserWordsByUserIdMock).toHaveBeenCalledWith(userId, {
        search,
      });
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.userWords).toEqual([userWordISO]);
      expect(response.body.previous).toBeUndefined();
      expect(response.body.next).toBeUndefined();
    });

    it("returns errors with status code 400 when the search query option is empty", async () => {
      const search = "";

      const response = await request(app)
        .get(`/api/users/${userId}/words?search=${search}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'search' must be a non-empty string.",
          path: "search",
          type: "field",
          value: "",
        },
      ]);
    });
  });

  describe("page number and page limit query", () => {
    it("calls the functions to get the user's worth with the page number and page limit query", async () => {
      const page = 1;
      const limit = 6;

      const response = await request(app)
        .get(`/api/users/${userId}/words?page=${page}&limit=${limit}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getUserWordsByUserIdMock).toHaveBeenCalledWith(userId, {
        page,
        limit,
      });
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.userWords).toEqual([userWordISO]);
      expect(response.body.previous).toBeUndefined();
      expect(response.body.next).toBeUndefined();
    });

    it("returns errors with status code 400 when the page size is not a number and the page limit is provided", async () => {
      const limit = 6;

      const response = await request(app)
        .get(`/api/users/${userId}/words?page=${undefined}&limit=${limit}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'page' must be an integer.",
          path: "page",
          type: "field",
          value: "undefined",
        },
      ]);
    });

    it("returns errors with status code 400 when the page limit is not a number and the page size is provided", async () => {
      const page = 1;

      const response = await request(app)
        .get(`/api/users/${userId}/words?page=${page}&limit=${undefined}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'limit' must be an integer.",
          path: "limit",
          type: "field",
          value: "undefined",
        },
      ]);
    });

    it("returns errors with 400 status code when the page limit is provided and the page size is not provided", async () => {
      const limit = 6;

      const response = await request(app)
        .get(`/api/users/${userId}/words?limit=${limit}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'page' and 'limit' must both be provided for pagination.",
          path: "",
          type: "field",
          value: {
            limit: "6",
          },
        },
      ]);
    });

    it("returns errors with 400 status code when the page limit is not provided and the page size is provided", async () => {
      const page = 1;

      const response = await request(app)
        .get(`/api/users/${userId}/words?page=${page}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "query",
          msg: "'page' and 'limit' must both be provided for pagination.",
          path: "",
          type: "field",
          value: {
            page: "1",
          },
        },
      ]);
    });
  });
});
//   it("returns false when the user word does not exist", async () => {
//     const newWord = await wordQueries.createWord(word);
//     const newUser = await userQueries.createUser(
//       sampleUser1.username,
//       sampleUser1.password
//     );

//     const userWordExists = await userWordQueries.userWordExists(
//       newUser!.id,
//       newWord.id
//     );

//     expect(userWordExists).toBe(false);
//   });

//   it("returns false when the user does not exist", async () => {
//     const newWord = await wordQueries.createWord(word);
//     const userId = "1";

//     const userWordExists = await userWordQueries.userWordExists(
//       userId,
//       newWord.id
//     );

//     expect(userWordExists).toBe(false);
//   });

//   it("returns false when the word does not exist", async () => {
//     const newUser = await userQueries.createUser(
//       sampleUser1.username,
//       sampleUser1.password
//     );
//     const wordId = "2";
//     await userWordQueries.createUserWord(newUser!.id, wordId);

//     const userWordExists = await userWordQueries.userWordExists(
//       newUser!.id,
//       wordId
//     );

//     expect(userWordExists).toBe(false);
//   });

//   it("returns false when the user does not exist", async () => {
//     const newWord = await wordQueries.createWord(word);
//     const userId = "1";

//     const userWordExists = await userWordQueries.userWordExists(
//       userId,
//       newWord.id
//     );

//     expect(userWordExists).toBe(false);
//   });

//   it("returns false when the word does not exist", async () => {
//     const newUser = await userQueries.createUser(
//       sampleUser1.username,
//       sampleUser1.password
//     );
//     const wordId = "2";
//     await userWordQueries.createUserWord(newUser!.id, wordId);

//     const userWordExists = await userWordQueries.userWordExists(
//       newUser!.id,
//       wordId
//     );

//     expect(userWordExists).toBe(false);
//   });
//   this.successMessage = "Success!";
// });

// it("does not call the functions to create a word if it already exists", async () => {
//   const getWordByWordMock = jest
//     .spyOn(WordQueries.prototype, "getWordByWord")
//     .mockImplementation(async () => {
//       return { ...response1[0], id: wordId, created_at: new Date() };
//     });
//   const httpGetMock = jest
//     .spyOn(Http.prototype, "get")
//     .mockImplementation(async () => {
//       return { json: response1, status: 200 };
//     });
//   const createWordMock = jest
//     .spyOn(WordQueries.prototype, "createWord")
//     .mockImplementation(async () => {
//       return { ...response1[0], id: wordId, created_at: new Date() };
//     });
//   const createUserWordMock = jest
//     .spyOn(UserWordQueries.prototype, "createUserWord")
//     .mockImplementation(async () => {
//       return userWord;
//     });

//   const response = await request(app)
//     .post(`/api/users/${userId}/words`)
//     .set("Accept", "application/json")
//     .send({ word: response1[0].word });

//   expect(response.headers["content-type"]).toMatch(/json/);
//   expect(response.status).toBe(200);
//   expect(response.body.word).toEqual({
//     ...response1[0],
//     id: wordId,
//     created_at: expect.any(String),
//   });
//   expect(getWordByWordMock).toHaveBeenCalledTimes(1);
//   expect(getWordByWordMock).toHaveBeenCalledWith(response1[0].word);
//   expect(httpGetMock).not.toHaveBeenCalled();
//   expect(createWordMock).not.toHaveBeenCalled();
//   expect(createUserWordMock).toHaveBeenCalledTimes(1);
//   expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId);
// });
// it("does not create a user word if it already exists", async () => {
//   const message = "You have already added this word in your dictionary.";
//   const getWordByWordMock = jest
//     .spyOn(WordQueries.prototype, "getWordByWord")
//     .mockImplementation(async () => {
//       return undefined;
//     });
//   const httpGetMock = jest
//     .spyOn(Http.prototype, "get")
//     .mockImplementation(async () => {
//       return { json: response1, status: 200 };
//     });
//   const createWordMock = jest
//     .spyOn(WordQueries.prototype, "createWord")
//     .mockImplementation(async () => {
//       return { ...response1[0], id: wordId, created_at: new Date() };
//     });
//   const createUserWordMock = jest
//     .spyOn(UserWordQueries.prototype, "createUserWord")
//     .mockImplementation(async () => {
//       return null;
//     });

//   const response = await request(app)
//     .post(`/api/users/${userId}/words`)
//     .set("Accept", "application/json")
//     .send({ word: response1[0].word });

//   expect(response.headers["content-type"]).toMatch(/json/);
//   expect(response.status).toBe(409);
//   expect(response.body.word).toBeNull();
//   expect(response.body.message).toBe(message);
//   expect(getWordByWordMock).toHaveBeenCalledTimes(1);
//   expect(getWordByWordMock).toHaveBeenCalledWith(response1[0].word);
//   expect(httpGetMock).toHaveBeenCalledTimes(1);
//   expect(httpGetMock).toHaveBeenCalledWith(
//     `https://api.dictionaryapi.dev/api/v2/entries/en/${response1[0].word}`
//   );
//   expect(createWordMock).toHaveBeenCalledTimes(1);
//   expect(createWordMock).toHaveBeenCalledWith(response1);
//   expect(createUserWordMock).toHaveBeenCalledTimes(1);
//   expect(createUserWordMock).toHaveBeenCalledWith(userId, wordId);
