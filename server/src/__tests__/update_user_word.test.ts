import express from "express";
import request from "supertest";

import { userWordQueries } from "../db/user_word_queries";
import { update_user_word } from "../controllers/user_word_controller";

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

describe("update_user_word", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to update user word", async () => {
    const app = express();
    app.use(express.json());
    app.put(`/api/users/:userId/userWords/:userWordId`, update_user_word);
    const mockSetLearned = jest
      .spyOn(userWordQueries, "setLearned")
      .mockResolvedValue(userWord);
    const body = {
      learned: false,
    };

    const response = await request(app)
      .put(`/api/users/${userId}/userWords/${userWord.id}`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userWord: {
        ...userWord,
        created_at: userWord.created_at.toISOString(),
        updated_at: userWord.updated_at.toISOString(),
      },
    });
    expect(mockSetLearned).toHaveBeenCalledTimes(1);
    expect(mockSetLearned).toHaveBeenCalledWith(userWord.id, body);
  });
});
