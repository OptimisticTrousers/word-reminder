import asyncHandler from "express-async-handler";

import {
  Result,
  userWordsWordRemindersQueries,
} from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { scheduleWordReminder } from "../utils/word_reminder";
import { boss } from "../db/boss";
import { triggerWebPushMsg } from "../utils/trigger_web_push_msg";
import { subscriptionQueries } from "../db/subscription_queries";
import { userWordQueries } from "../db/user_word_queries";
import { wordQueries } from "../db/word_queries";
import { Detail, UserWord } from "common";
import { timeout } from "cron";

// @desc Create a new word reminder
// @route POST /api/users/:userId/wordReminders
// @access Private
export const create_word_reminder = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { is_active, has_reminder_onload, reminder, finish, user_words } =
    req.body;

  const wordReminder = await wordReminderQueries.create({
    user_id: Number(userId),
    is_active: is_active,
    has_reminder_onload: has_reminder_onload,
    finish,
    reminder,
  });

  user_words.forEach(async (user_word: UserWord) => {
    await userWordsWordRemindersQueries.create({
      user_word_id: user_word.id,
      word_reminder_id: wordReminder.id,
    });
  });

  await scheduleWordReminder({
    word_reminder_id: wordReminder.id,
    user_id: userId,
    is_active,
    has_reminder_onload,
    reminder,
    finish,
    user_words,
    queueName: res.locals.queueName,
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

  const queueName = res.locals.queueName;

  await boss.offWork(queueName);

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

  const queueName = res.locals.queueName;

  if (deletedWordReminder?.is_active) {
    await boss.offWork(queueName);
  }

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
    const userId = Number(req.params.userId);
    const wordReminderId = Number(req.params.wordReminderId);
    const { is_active, has_reminder_onload, reminder, finish, user_words } =
      req.body;

    const wordReminder = await wordReminderQueries.updateById(wordReminderId, {
      is_active,
      reminder,
      has_reminder_onload,
      finish,
    });

    user_words.forEach(async (user_word: UserWord) => {
      await userWordsWordRemindersQueries.create({
        user_word_id: user_word.id,
        word_reminder_id: wordReminder.id,
      });
    });

    const queueName = res.locals.queueName;
    await boss.offWork(queueName);

    await scheduleWordReminder({
      word_reminder_id: wordReminder.id,
      user_id: String(userId),
      is_active,
      has_reminder_onload,
      reminder,
      finish,
      user_words,
      queueName: res.locals.queueName,
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
    const { column, direction, page, limit } = req.query;

    const options = {
      ...(column &&
        direction && {
          sort: {
            column: String(column),
            direction: Number(direction),
            table: "word_reminders",
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
