import express from "express";
import request from "supertest";

import { create_word_reminder } from "../controllers/word_reminder_controller";
import * as wordReminders from "../utils/word_reminder";

describe("create_word_reminder", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminder1 = {
    id: "1",
    user_id: sampleUser1.id,
    finish: new Date("December 17, 1995 03:24:00"),
    is_active: true,
    has_reminder_onload: true,
    created_at: new Date("December 17, 1995 03:24:00"),
    updated_at: new Date("December 17, 1995 03:24:00"),
  };

  const wordId1 = "1";

  const wordId2 = "2";

  const wordId3 = "3";

  const userWord1 = {
    id: "1",
    user_id: sampleUser1.id,
    word_id: wordId1,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: "2",
    user_id: sampleUser1.id,
    word_id: wordId2,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord3 = {
    id: "3",
    user_id: sampleUser1.id,
    word_id: wordId3,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const user_words = [userWord1, userWord2, userWord3];

  const mockCreateWordReminder = jest
    .spyOn(wordReminders, "createWordReminder")
    .mockImplementation(async () => {
      return wordReminder1;
    });

  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/wordReminders", create_word_reminder);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to create the word reminder with the user words in it", async () => {
    const body = {
      user_id: sampleUser1.id,
      is_active: false,
      has_reminder_onload: false,
      finish: wordReminder1.finish,
      reminder: {
        minutes: 0,
        hours: 0,
        days: 0,
        weeks: 1,
        months: 0,
      },
      user_words,
    };

    const response = await request(app)
      .post(`/api/users/${sampleUser1.id}/wordReminders`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      wordReminder: {
        ...wordReminder1,
        finish: wordReminder1.finish.toISOString(),
        created_at: wordReminder1.created_at.toISOString(),
        updated_at: wordReminder1.updated_at.toISOString(),
      },
    });
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      user_id: sampleUser1.id,
      is_active: body.is_active,
      has_reminder_onload: body.has_reminder_onload,
      user_words: [
        {
          ...userWord1,
          created_at: userWord1.created_at.toISOString(),
          updated_at: userWord1.updated_at.toISOString(),
        },
        {
          ...userWord2,
          created_at: userWord2.created_at.toISOString(),
          updated_at: userWord2.updated_at.toISOString(),
        },
        {
          ...userWord3,
          created_at: userWord3.created_at.toISOString(),
          updated_at: userWord3.updated_at.toISOString(),
        },
      ],
      reminder: body.reminder,
      finish: wordReminder1.finish.toISOString(),
    });
  });
});
