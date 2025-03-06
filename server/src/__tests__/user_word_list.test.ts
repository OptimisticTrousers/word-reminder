import express from "express";
import request from "supertest";

import { user_word_list } from "../controllers/user_word_controller";
import { userWordQueries } from "../db/user_word_queries";

describe("user_word_list", () => {
  const userId = 1;
  const wordId = 1;
  const userWord = {
    id: 1,
    user_id: userId,
    word_id: wordId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserWordGetByUserId = jest
    .spyOn(userWordQueries, "getByUserId")
    .mockResolvedValue({
      totalRows: 1,
      user_words: [userWord],
    });

  const app = express();
  app.use(express.json());
  app.get("/api/users/:userId/userWords", user_word_list);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("no query", () => {
    it("calls the functions to get the user's words with none of the query options", async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json");

      expect(mockUserWordGetByUserId).toHaveBeenCalledTimes(1);
      expect(mockUserWordGetByUserId).toHaveBeenCalledWith(userId, {});
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalRows: 1,
        user_words: [
          {
            ...userWord,
            created_at: userWord.created_at.toISOString(),
            updated_at: userWord.updated_at.toISOString(),
          },
        ],
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
          `/api/users/${userId}/userWords?${params}&learned=${learned}&page=${page}&limit=${limit}&search=${search}`
        )
        .set("Accept", "application/json");

      expect(mockUserWordGetByUserId).toHaveBeenCalledTimes(1);
      expect(mockUserWordGetByUserId).toHaveBeenCalledWith(userId, {
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
        totalRows: 1,
        user_words: [
          {
            ...userWord,
            created_at: userWord.created_at.toISOString(),
            updated_at: userWord.updated_at.toISOString(),
          },
        ],
      });
    });
  });

  describe("learned query", () => {
    const learned = true;
    it("calls the functions to get the user's words with the learned option", async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/userWords?learned=${learned}`)
        .set("Accept", "application/json");

      expect(mockUserWordGetByUserId).toHaveBeenCalledTimes(1);
      expect(mockUserWordGetByUserId).toHaveBeenCalledWith(userId, {
        learned,
      });
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user_words: [
          {
            ...userWord,
            created_at: userWord.created_at.toISOString(),
            updated_at: userWord.updated_at.toISOString(),
          },
        ],
        totalRows: 1,
      });
    });

    it("returns errors with status code 400 when the learned option is not a boolean", async () => {
      const learned = "hello";
      const response = await request(app)
        .get(`/api/users/${userId}/userWords?learned=${learned}`)
        .set("Accept", "application/json");

      expect(mockUserWordGetByUserId).not.toHaveBeenCalled();
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
        .get(`/api/users/${userId}/userWords?search=${search}`)
        .set("Accept", "application/json");

      expect(mockUserWordGetByUserId).toHaveBeenCalledTimes(1);
      expect(mockUserWordGetByUserId).toHaveBeenCalledWith(userId, {
        search,
      });
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalRows: 1,
        user_words: [
          {
            ...userWord,
            created_at: userWord.created_at.toISOString(),
            updated_at: userWord.updated_at.toISOString(),
          },
        ],
      });
    });

    it("returns errors with status code 400 when the search query option is empty", async () => {
      const search = "";

      const response = await request(app)
        .get(`/api/users/${userId}/userWords?search=${search}`)
        .set("Accept", "application/json");

      expect(mockUserWordGetByUserId).not.toHaveBeenCalled();
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
