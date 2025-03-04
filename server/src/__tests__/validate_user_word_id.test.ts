import express from "express";
import request from "supertest";

import { userWordQueries } from "../db/user_word_queries";
import { validateUserWordId } from "../middleware/validate_user_word_id";

const message = "message";
const userWordId = 1;
const userId = 1;
const wordId = 1;

const app = express();
app.use(express.json());
app.delete(
  "/api/users/:userId/userWords/:userWordId",
  validateUserWordId,
  (req, res) => {
    res.status(200).json({ message });
  }
);

describe("validateUserWordId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a 400 status code with the invalid user word id message", async () => {
    const response = await request(app)
      .delete(`/api/users/${userId}/userWords/bob`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid user word ID.",
    });
  });

  it("returns a 404 status code with user word not found message", async () => {
    const mockUserWordGetById = jest
      .spyOn(userWordQueries, "getById")
      .mockResolvedValue(undefined);

    const response = await request(app)
      .delete(`/api/users/${userId}/userWords/${userWordId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User word not found.",
    });
    expect(mockUserWordGetById).toHaveBeenCalledTimes(1);
    expect(mockUserWordGetById).toHaveBeenCalledWith(userWordId);
  });

  it("calls the following request handler when the user word exists and the user word id is valid", async () => {
    const mockUserWordGetById = jest
      .spyOn(userWordQueries, "getById")
      .mockResolvedValue({
        id: userWordId,
        learned: true,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: userId,
        word_id: wordId,
      });

    const response = await request(app)
      .delete(`/api/users/${userId}/userWords/${userWordId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message,
    });
    expect(mockUserWordGetById).toHaveBeenCalledTimes(1);
    expect(mockUserWordGetById).toHaveBeenCalledWith(userWordId);
  });
});
