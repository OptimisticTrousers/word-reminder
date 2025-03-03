import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { Order } from "common";
import { validateAutoWordReminderId } from "../middleware/validate_auto_word_reminder_id";

describe("validateAutoWordReminderId", () => {
  const message = "Success.";

  const app = express();
  app.use(express.json());
  app.delete(
    "/autoWordReminders/:autoWordReminderId",
    validateAutoWordReminderId,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a 400 status code with invalid auto word reminder id message", async () => {
    const response = await request(app)
      .delete("/autoWordReminders/bob")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid auto word reminder ID.",
    });
  });

  it("returns a 404 status code with auto word reminder not found message", async () => {
    const autoWordReminderId = "1";
    const mockGetById = jest
      .spyOn(autoWordReminderQueries, "getById")
      .mockImplementation(async () => {
        return undefined;
      });

    const response = await request(app)
      .delete(`/autoWordReminders/${autoWordReminderId}`)
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
    const autoWordReminderId = "1";
    const autoWordReminder = {
      id: autoWordReminderId,
      user_id: "1",
      is_active: true,
      has_reminder_onload: true,
      has_learned_words: false,
      order: Order.Newest,
      word_count: 7,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockGetById = jest
      .spyOn(autoWordReminderQueries, "getById")
      .mockImplementation(async () => {
        return autoWordReminder;
      });

    const response = await request(app)
      .delete(`/autoWordReminders/${autoWordReminderId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockGetById).toHaveBeenCalledWith(autoWordReminderId);
  });
});
