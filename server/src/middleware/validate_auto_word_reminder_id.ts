import asyncHandler from "express-async-handler";

import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";

export const validateAutoWordReminderId = asyncHandler(
  async (req, res, next) => {
    const autoWordReminderId = Number(req.params.autoWordReminderId);

    if (isNaN(autoWordReminderId)) {
      res.status(400).json({ message: "Invalid auto word reminder ID." });
      return;
    }

    const autoWordReminder = await autoWordReminderQueries.getById(
      autoWordReminderId
    );

    if (!autoWordReminder) {
      res.status(404).json({ message: "Auto word reminder not found." });
      return;
    }

    next();
  }
);
