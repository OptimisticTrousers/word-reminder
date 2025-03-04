import { SortMode } from "common";
import express from "express";
import request from "supertest";

import { get_auto_word_reminder } from "../controllers/auto_word_reminder_controller";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";

const app = express();
app.use(express.json());
app.get("/api/users/:userId/autoWordReminders", get_auto_word_reminder);

const userId = 1;

const autoWordReminderId = 1;
const autoWordReminder = {
  id: autoWordReminderId,
  user_id: userId,
  reminder: "* * * * *",
  duration: 360000,
  is_active: true,
  has_reminder_onload: true,
  has_learned_words: true,
  sort_mode: SortMode.Newest,
  word_count: 7,
  created_at: new Date(),
  updated_at: new Date(),
};

describe("get_auto_word_reminder", () => {
  const mockGetByUserId = jest
    .spyOn(autoWordReminderQueries, "getByUserId")
    .mockResolvedValue([autoWordReminder]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("it gets a word reminder", async () => {
    const response = await request(app).get(
      `/api/users/${userId}/autoWordReminders`
    );

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      autoWordReminder: {
        ...autoWordReminder,
        created_at: autoWordReminder.created_at.toISOString(),
        updated_at: autoWordReminder.updated_at.toISOString(),
      },
    });
    expect(mockGetByUserId).toHaveBeenCalledTimes(1);
    expect(mockGetByUserId).toHaveBeenCalledWith(autoWordReminderId);
  });
});
