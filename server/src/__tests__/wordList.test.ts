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
    created_at: expect.any(String),
    updated_at: expect.any(String),
  };

  const getUserWordsByUserIdMock = jest
    .spyOn(UserWordQueries.prototype, "getByUserId")
    .mockImplementation(async () => {
      return {
        userWords: [userWord],
      };
    })
    .mockName("getUserWordsByUserId");

  const app = express();
  app.use(express.json());
  app.get("/api/users/:userId/words", word_list);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("no query", () => {
    it("calls the functions to get the user's words with none of the query options", async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/words`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getUserWordsByUserIdMock).toHaveBeenCalledWith(userId, {});
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        userWords: [userWordISO],
      });
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
      expect(response.body).toEqual({
        userWords: [userWordISO],
      });
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
      expect(response.body).toEqual({ userWords: [userWordISO] });
    });

    it("returns errors with status code 400 when the learned option is not a boolean", async () => {
      const learned = "hello";
      const response = await request(app)
        .get(`/api/users/${userId}/words?learned=${learned}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        errors: [
          {
            location: "query",
            msg: "'learned' must be a boolean.",
            path: "learned",
            type: "field",
            value: "hello",
          },
        ],
      });
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
      expect(response.body).toEqual({
        userWords: [userWordISO],
      });
    });

    it("returns errors with status code 400 when the search query option is empty", async () => {
      const search = "";

      const response = await request(app)
        .get(`/api/users/${userId}/words?search=${search}`)
        .set("Accept", "application/json");

      expect(getUserWordsByUserIdMock).not.toHaveBeenCalled();
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "query",
            msg: "'search' must be a non-empty string.",
            path: "search",
            type: "field",
            value: "",
          },
        ],
      });
    });
  });
});
