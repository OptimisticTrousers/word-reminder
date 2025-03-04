import express from "express";
import request from "supertest";

import { delete_user_word } from "../controllers/user_word_controller";
import { userWordQueries } from "../db/user_word_queries";

const app = express();
app.use(express.json());
app.delete("/api/users/:userId/userWords/:userWordId", delete_user_word);

describe("delete_user_word", () => {
  it("deletes the user word", async () => {
    const created_at = new Date();
    const updated_at = new Date();
    const userId = 1;
    const wordId = 1;
    const userWordId = 1;
    const userWord = {
      id: userWordId,
      user_id: userId,
      word_id: wordId,
      learned: false,
      created_at,
      updated_at,
    };
    const mockDeleteById = jest
      .spyOn(userWordQueries, "deleteById")
      .mockResolvedValue(userWord);

    const response = await request(app)
      .delete(`/api/users/${userId}/userWords/${userWordId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userWord: {
        ...userWord,
        created_at: userWord.created_at.toISOString(),
        updated_at: userWord.updated_at.toISOString(),
      },
    });
    expect(mockDeleteById).toHaveBeenCalledTimes(1);
    expect(mockDeleteById).toHaveBeenCalledWith(userWordId);
  });
});
