import asyncHandler from "express-async-handler";

import { wordReminderQueries } from "../db/word_reminder_queries";
import { WordReminder } from "common";

export const validateWordReminderId = asyncHandler(
  async (req, res, next): Promise<void> => {
    const wordReminderId: string = req.params.wordReminderId;
    if (isNaN(Number(wordReminderId))) {
      res.status(400).json({ message: "Invalid word reminder ID." });
      return;
    }

    const wordReminder: WordReminder | undefined =
      await wordReminderQueries.getById(wordReminderId);
    if (!wordReminder) {
      res.status(404).json({ message: "Word reminder not found." });
      return;
    }

    next();
  }
);
