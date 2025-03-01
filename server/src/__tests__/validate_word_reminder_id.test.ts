import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { wordReminderQueries } from "../db/word_reminder_queries";
import { validateWordReminderId } from "../middleware/validate_word_reminder_id";
// Import db setup and teardown functionality
import "../db/test_populatedb";
import { userQueries } from "../db/user_queries";

describe("validateWordReminderId", () => {
  const message = "message";

  const user = {
    id: "1",
  };

  const app = express();
  app.use(express.json());
  app.delete(
    "/api/wordReminders/:wordReminderId",
    asyncHandler(async (req, res, next) => {
      req.user = user;
      next();
    }),
    validateWordReminderId,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

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
    const response = await request(app)
      .delete("/api/wordReminders/1")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Word reminder not found.",
    });
  });

  it("calls the following request handler when the word exists and the word id is valid", async () => {
    const newUser = await userQueries.create({
      email: "bob@gmail.com",
      password: "password",
    });
    const wordReminder1 = {
      user_id: newUser!.id,
      reminder: {
        minutes: 0,
        hours: 1,
        days: 0,
        weeks: 0,
        months: 0,
      },
      is_active: true,
      has_reminder_onload: true,
      finish: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date(),
      updated_at: new Date(),
    };
    const newWordReminder = await wordReminderQueries.create(wordReminder1);

    const response = await request(app)
      .delete(`/api/wordReminders/${newWordReminder.id}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
  });
});
