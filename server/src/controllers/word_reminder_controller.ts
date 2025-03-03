import asyncHandler from "express-async-handler";

import {
  Result,
  userWordsWordRemindersQueries,
} from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { dateAdd } from "../utils/date";
import { addToDateQueries } from "../db/add_to_date_queries";
import { createWordReminder } from "../utils/word_reminder";
import { addToDatesWordRemindersQueries } from "../db/add_to_dates_word_reminders_queries";
import { AddToDatesWordReminder } from "common";

// @desc Create a new word reminder
// @route POST /api/users/:userId/wordReminders
// @access Private
export const create_word_reminder = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { is_active, has_reminder_onload, reminder, finish, user_words } =
    req.body;

  let addToReminder = dateAdd(new Date(), "minutes", reminder.minutes);
  addToReminder = dateAdd(addToReminder, "hours", reminder.hours);
  addToReminder = dateAdd(addToReminder, "days", reminder.days);
  addToReminder = dateAdd(addToReminder, "weeks", reminder.weeks);
  addToReminder = dateAdd(addToReminder, "months", reminder.months);

  const wordReminder = await createWordReminder({
    user_id: userId,
    is_active,
    has_reminder_onload,
    reminder,
    finish,
    user_words,
  });

  res.status(200).json({
    wordReminder,
  });
});

// @desc    Delete all of the user's word reminders
// @route   DELETE /api/users/:userId/wordReminders
// @access  Private
export const delete_word_reminders = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const deletedAddToDateWordReminders =
    await addToDatesWordRemindersQueries.deleteAllByUserId(userId);

  deletedAddToDateWordReminders.forEach(
    async (addToDateWordReminder: AddToDatesWordReminder) => {
      await addToDateQueries.deleteById(addToDateWordReminder.reminder_id);
    }
  );

  const deletedUserWordsWordReminders =
    await userWordsWordRemindersQueries.deleteAllByUserId(userId);

  const deletedWordReminders = await wordReminderQueries.deleteAllByUserId(
    userId
  );

  res.status(200).json({
    userWordsWordReminders: deletedUserWordsWordReminders,
    wordReminders: deletedWordReminders,
    reminders: deletedAddToDateWordReminders,
  });
});

// @desc    Delete single word reminder
// @route   DELETE /api/users/:userId/wordReminders/:wordReminderId
// @access  Private
export const delete_word_reminder = asyncHandler(async (req, res) => {
  const { wordReminderId } = req.params;

  const deletedAddToDateWordReminder =
    await addToDatesWordRemindersQueries.deleteByWordReminderId(wordReminderId);

  const deletedUserWordsWordReminders =
    await userWordsWordRemindersQueries.deleteAllByWordReminderId(
      wordReminderId
    );

  const deletedWordReminder = await wordReminderQueries.deleteById(
    wordReminderId
  );

  res.status(200).json({
    userWordsWordReminders: deletedUserWordsWordReminders,
    addToDateWordReminder: deletedAddToDateWordReminder,
    wordReminder: deletedWordReminder,
  });
});

// @desc    Get single word reminder
// @route   GET /api/users/:userId/wordReminders/:wordReminderId
// @access  Private
export const get_word_reminder = asyncHandler(async (req, res) => {
  const { userId, wordReminderId } = req.params;
  const wordReminder = await wordReminderQueries.getById(wordReminderId);

  const reminder = await addToDatesWordRemindersQueries.getByWordReminderId(
    wordReminderId
  );

  const userWords = await userWordsWordRemindersQueries.get({
    word_reminder_id: wordReminderId,
    user_word_id: userId,
  });

  res.status(200).json({
    wordReminder: { ...wordReminder, reminder, user_words: userWords },
  });
});

// @desc Update a word reminder
// @route PUT /api/users/:userId/wordReminders/:wordReminderId
// @access Private
export const update_word_reminder = [
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const { wordReminderId } = req.params;
    const { is_active, has_reminder_onload, reminder, finish, user_words } =
      req.body;

    let addToReminder = dateAdd(new Date(), "minutes", reminder.minutes);
    addToReminder = dateAdd(addToReminder, "hours", reminder.hours);
    addToReminder = dateAdd(addToReminder, "days", reminder.days);
    addToReminder = dateAdd(addToReminder, "weeks", reminder.weeks);
    addToReminder = dateAdd(addToReminder, "months", reminder.months);

    const wordReminder = await wordReminderQueries.updateById(wordReminderId, {
      is_active: is_active,
      has_reminder_onload: has_reminder_onload,
      finish,
    });

    await addToDatesWordRemindersQueries.updateByWordReminderId(
      wordReminderId,
      reminder
    );

    await userWordsWordRemindersQueries.deleteAllByWordReminderId(
      wordReminderId
    );

    user_words.forEach(async (user_word_id: string) => {
      await userWordsWordRemindersQueries.create({
        user_word_id: user_word_id,
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
    const userId: string = req.params.userId;
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
