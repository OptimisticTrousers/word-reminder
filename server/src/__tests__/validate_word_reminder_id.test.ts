import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { wordReminderQueries } from "../db/word_reminder_queries";
import { validateWordReminderId } from "../middleware/validate_word_reminder_id";

describe("validateWordReminderId", () => {
  const message = "message";

  const userId = "1";
  const wordReminderId = "1";

  const app = express();
  app.use(express.json());
  app.delete(
    "/api/wordReminders/:wordReminderId",
    asyncHandler(async (req, res, next) => {
      req.user = { id: userId };
      next();
    }),
    validateWordReminderId,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a 400 status code with invalid word reminder id message", async () => {
    const response = await request(app)
      .delete("/api/wordReminders/bob")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid word reminder ID.",
    });
  });

  it("returns a 404 status code with word reminder not found message", async () => {
    const mockGetById = jest
      .spyOn(wordReminderQueries, "getById")
      .mockImplementation(async () => {
        return undefined;
      });

    const response = await request(app)
      .delete(`/api/wordReminders/${wordReminderId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Word reminder not found.",
    });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(wordReminderId);
  });

  it("calls the following request handler when the word exists and the word id is valid", async () => {
    const wordReminder = {
      id: wordReminderId,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
      finish: new Date(),
      is_active: true,
      has_reminder_onload: true,
    };
    const mockGetById = jest
      .spyOn(wordReminderQueries, "getById")
      .mockImplementation(async () => {
        return wordReminder;
      });

    const response = await request(app)
      .delete(`/api/wordReminders/${wordReminderId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(wordReminderId);
  });
});
