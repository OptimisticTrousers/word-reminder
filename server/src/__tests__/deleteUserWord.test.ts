import express from "express";
import request from "supertest";

import { delete_user_word } from "../controllers/wordController";
import { UserWordQueries } from "../db/userWordQueries";

describe("delete_user_word", () => {
  const app = express();
  app.use(express.json());
  app.delete("/api/users/:userId/words/:wordId", delete_user_word);

  it("deletes the user word", async () => {
    const userId = "1";
    const wordId = "1";
    const userWord = {
      id: 1,
      user_id: userId,
      word_id: wordId,
      learned: false,
    };
    const message = "Success";
    const deleteUserWordMock = jest
      .spyOn(UserWordQueries.prototype, "deleteUserWord")
      .mockImplementation(async () => {
        return { userWord, message };
      });

    const response = await request(app)
      .delete(`/api/users/${userId}/words/${wordId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(deleteUserWordMock).toHaveBeenCalledTimes(1);
    expect(deleteUserWordMock).toHaveBeenCalledWith(userId, wordId);
    expect(response.body.userWord.id).toBe;
    expect(response.body.userWord.user_id).toBe(userId);
    expect(response.body.userWord.word_id).toBe(wordId);
    expect(response.body.userWord.learned).toBe(false);
    expect(response.body.message).toBe(message);
  });
});
