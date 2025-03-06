import asyncHandler from "express-async-handler";

import {
  Result,
  userWordsWordRemindersQueries,
} from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { createWordReminder } from "../utils/word_reminder";
import { UserWord } from "common";
import { userWordQueries } from "../db/user_word_queries";

// @desc Create a new word reminder
// @route POST /api/users/:userId/wordReminders
// @access Private
export const create_word_reminder = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const { is_active, has_reminder_onload, reminder, finish, user_word_ids } =
    req.body;

  const wordReminder = await createWordReminder({
    user_id: userId,
    is_active,
    has_reminder_onload,
    reminder,
    finish,
    user_word_ids,
  });

  res.status(200).json({
    wordReminder,
  });
});

// @desc    Delete all of the user's word reminders
// @route   DELETE /api/users/:userId/wordReminders
// @access  Private
export const delete_word_reminders = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const deletedUserWordsWordReminders =
    await userWordsWordRemindersQueries.deleteByUserId(userId);

  const deletedWordReminders = await wordReminderQueries.deleteByUserId(userId);

  res.status(200).json({
    userWordsWordReminders: deletedUserWordsWordReminders,
    wordReminders: deletedWordReminders,
  });
});

// @desc    Delete single word reminder
// @route   DELETE /api/users/:userId/wordReminders/:wordReminderId
// @access  Private
export const delete_word_reminder = asyncHandler(async (req, res) => {
  const wordReminderId = Number(req.params.wordReminderId);

  const deletedUserWordsWordReminders =
    await userWordsWordRemindersQueries.deleteByWordReminderId(wordReminderId);

  const deletedWordReminder = await wordReminderQueries.deleteById(
    wordReminderId
  );

  res.status(200).json({
    userWordsWordReminders: deletedUserWordsWordReminders,
    wordReminder: deletedWordReminder,
  });
});

// @desc    Get single word reminder
// @route   GET /api/users/:userId/wordReminders/:wordReminderId
// @access  Private
export const get_word_reminder = asyncHandler(async (req, res) => {
  const wordReminderId = Number(req.params.wordReminderId);

  const wordReminder = await userWordsWordRemindersQueries.getByWordReminderId(
    wordReminderId
  );

  res.status(200).json({
    wordReminder,
  });
});

// @desc Update a word reminder
// @route PUT /api/users/:userId/wordReminders/:wordReminderId
// @access Private
export const update_word_reminder = [
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const wordReminderId = Number(req.params.wordReminderId);
    const { is_active, has_reminder_onload, reminder, finish, user_word_ids } =
      req.body;

    const wordReminder = await wordReminderQueries.updateById(wordReminderId, {
      is_active,
      reminder,
      has_reminder_onload,
      finish,
    });

    user_word_ids.forEach(async (user_word_id: number) => {
      await userWordsWordRemindersQueries.create({
        user_word_id,
        word_reminder_id: wordReminderId,
      });
    });

    res.status(200).json({
      wordReminder,
    });
  }),
];

// @desc  Get all word reminders
// @route GET /api/users/:userId/wordReminders
// @query column, direction, table, page, limit
// @access Private
export const word_reminder_list = [
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const { column, direction, table, page, limit } = req.query;

    const options = {
      ...(column &&
        direction &&
        table && {
          sort: {
            column: String(column),
            direction: Number(direction),
            table: String(table),
          },
        }),
      ...(limit && page && { limit: Number(limit), page: Number(page) }),
    };

    const result: Result = await userWordsWordRemindersQueries.getByUserId(
      userId,
      options
    );

    res.status(200).json(result);
  }),
];
