import express from "express";
import request from "supertest";

import { get_user_word } from "../controllers/word_controller";
import { userWordQueries } from "../db/user_word_queries";

describe("get_user_word", () => {
  const app = express();
  app.use(express.json());
  app.get("/api/users/:userId/words/:wordId", get_user_word);

  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordId = "1";
  const userWord1 = {
    id: "1",
    user_id: sampleUser1.id,
    word_id: wordId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserWordGet = jest
    .spyOn(userWordQueries, "get")
    .mockImplementation(async () => {
      return userWord1;
    });

  it("gets a user word", async () => {
    const response = await request(app).get(
      `/api/users/${sampleUser1.id}/words/${wordId}`
    );

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userWord: {
        ...userWord1,
        created_at: userWord1.created_at.toISOString(),
        updated_at: userWord1.updated_at.toISOString(),
      },
    });
    expect(mockUserWordGet).toHaveBeenCalledTimes(1);
    expect(mockUserWordGet).toHaveBeenCalledWith({
      word_id: wordId,
      user_id: sampleUser1.id,
    });
  });
});
