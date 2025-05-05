import express from "express";
import request from "supertest";

import { delete_auto_word_reminder } from "../controllers/auto_word_reminder_controller";
import { SortMode } from "common";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { boss } from "../db/boss";

const queuePostfix = "auto-word-reminder-queue";
const app = express();
app.use(express.json());
app.delete(
  "/api/users/:userId/autoWordReminders/:autoWordReminderId",
  delete_auto_word_reminder
);

describe("delete_auto_word_reminder", () => {
  const userId = 1;
  const autoWordReminderId = 1;
  const autoWordReminder = {
    id: autoWordReminderId,
    user_id: userId,
    is_active: true,
    has_reminder_onload: true,
    has_learned_words: true,
    reminder: "* * * * *",
    duration: 360000,
    sort_mode: SortMode.Newest,
    word_count: 7,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const mockAutoWordReminderDeleteById = jest
    .spyOn(autoWordReminderQueries, "deleteById")
    .mockResolvedValue(autoWordReminder);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes a user's auto word reminders", async () => {
    const response = await request(app).delete(
      `/api/users/${userId}/autoWordReminders/${autoWordReminderId}`
    );

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      autoWordReminder: {
        ...autoWordReminder,
        updated_at: autoWordReminder.updated_at.toISOString(),
        created_at: autoWordReminder.created_at.toISOString(),
      },
    });
    expect(mockAutoWordReminderDeleteById).toHaveBeenCalledTimes(1);
    expect(mockAutoWordReminderDeleteById).toHaveBeenCalledWith(
      autoWordReminderId
    );
  });
});
