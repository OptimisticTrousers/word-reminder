import express from "express";
import request from "supertest";

import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { SortMode } from "common";
import { validateAutoWordReminderId } from "../middleware/validate_auto_word_reminder_id";

const userId = 1;
const autoWordReminderId = 1;
const message = "Success.";

const app = express();
app.use(express.json());
app.delete(
  "/api/users/:userId/autoWordReminders/:autoWordReminderId",
  validateAutoWordReminderId,
  (req, res) => {
    res.status(200).json({ message });
  }
);

describe("validateAutoWordReminderId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a 400 status code with invalid auto word reminder id message", async () => {
    const response = await request(app)
      .delete(`/api/users/${userId}/autoWordReminders/bob`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid auto word reminder ID.",
    });
  });

  it("returns a 404 status code with auto word reminder not found message", async () => {
    const mockGetById = jest
      .spyOn(autoWordReminderQueries, "getById")
      .mockResolvedValue(undefined);

    const response = await request(app)
      .delete(`/api/users/${userId}/autoWordReminders/${autoWordReminderId}`)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Auto word reminder not found.",
    });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(autoWordReminderId);
  });

  it("calls the following request handler when the auto word reminder exists and the auto word reminder id is valid", async () => {
    const autoWordReminder = {
      id: autoWordReminderId,
      user_id: userId,
      is_active: true,
      has_reminder_onload: true,
      has_learned_words: false,
      reminder: "* * * * *",
      duration: 3600000,
      sort_mode: SortMode.Newest,
      word_count: 7,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockGetById = jest
      .spyOn(autoWordReminderQueries, "getById")
      .mockResolvedValue(autoWordReminder);

    const response = await request(app)
      .delete(`/api/users/${userId}/autoWordReminders/${autoWordReminderId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(autoWordReminderId);
  });
});
