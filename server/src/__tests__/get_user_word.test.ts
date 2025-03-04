import express from "express";
import request from "supertest";

import { get_user_word } from "../controllers/user_word_controller";
import { userWordQueries } from "../db/user_word_queries";
import { wordQueries } from "../db/word_queries";

const app = express();
app.use(express.json());
app.get("/api/users/:userId/userWords/:userWordId", get_user_word);

const userId = 1;
const wordId = 1;
const userWordId = 1;
const word = {
  id: wordId,
  details: [],
};
const userWord = {
  id: userWordId,
  user_id: userId,
  word_id: wordId,
  learned: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe("get_user_word", () => {
  const mockUserWordGetById = jest
    .spyOn(userWordQueries, "getById")
    .mockResolvedValue(userWord);
  const mockWordGetById = jest
    .spyOn(wordQueries, "getById")
    .mockResolvedValue(word);

  it("gets a user word", async () => {
    const response = await request(app).get(
      `/api/users/${userId}/userWords/${userWordId}`
    );

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userWord: {
        ...userWord,
        word,
        created_at: userWord.created_at.toISOString(),
        updated_at: userWord.updated_at.toISOString(),
      },
    });
    expect(mockUserWordGetById).toHaveBeenCalledTimes(1);
    expect(mockUserWordGetById).toHaveBeenCalledWith(userWordId);
    expect(mockWordGetById).toHaveBeenCalledTimes(1);
    expect(mockWordGetById).toHaveBeenCalledWith(wordId);
  });
});
