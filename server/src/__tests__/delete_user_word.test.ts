import express from "express";
import request from "supertest";

import { delete_user_word } from "../controllers/word_controller";
import { UserWordQueries } from "../db/user_word_queries";

describe("delete_user_word", () => {
  const app = express();
  app.use(express.json());
  app.delete("/api/users/:userId/words/:wordId", delete_user_word);

  it("deletes the user word", async () => {
    const created_at = new Date();
    const updated_at = new Date();
    const userId = "1";
    const wordId = "1";
    const userWord = {
      id: "1",
      user_id: userId,
      word_id: wordId,
      learned: false,
      created_at,
      updated_at,
    };
    const deleteUserWordMock = jest
      .spyOn(UserWordQueries.prototype, "delete")
      .mockImplementation(async () => {
        return userWord;
      });

    const response = await request(app)
      .delete(`/api/users/${userId}/words/${wordId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(deleteUserWordMock).toHaveBeenCalledTimes(1);
    expect(deleteUserWordMock).toHaveBeenCalledWith({
      user_id: userId,
      word_id: wordId,
    });
    expect(response.body).toEqual({
      userWord: {
        id: "1",
        user_id: userId,
        word_id: wordId,
        learned: false,
        created_at: created_at.toISOString(),
        updated_at: updated_at.toISOString(),
      },
    });
  });
});
