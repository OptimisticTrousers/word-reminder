import asyncHandler from "express-async-handler";

import {
  Result,
  userWordsWordRemindersQueries,
} from "../db/user_words_word_reminders_queries";
import { userWordQueries } from "../db/user_word_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { addMinutesToDate } from "../utils/date";
import { UserWord } from "common";

// @desc Create a new word reminder
// @route POST /api/users/:userId/wordReminders
// @access Private
export const create_word_reminder = [
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { is_active, has_reminder_onload, reminder, auto } = req.body;

    const duration = req.body.duration;
    const has_learned_words = req.body.has_learned_words;
    const word_count = req.body.word_count;
    const order = req.body.order;

    if (auto) {
      // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
      const randomUserWords = await userWordQueries.getUserWords(userId, {
        count: word_count,
        learned: has_learned_words,
        order,
      });
      const wordReminder = await wordReminderQueries.create({
        user_id: userId,
        reminder,
        is_active: is_active,
        has_reminder_onload: has_reminder_onload,
        finish: addMinutesToDate(duration),
      });
      randomUserWords.forEach(async (word: UserWord) => {
        await userWordsWordRemindersQueries.create({
          user_word_id: word.id,
          word_reminder_id: wordReminder.id,
        });
      });

      res.status(200).json({
        wordReminder: { ...wordReminder, user_words: randomUserWords },
      });
      return;
    }

    const finish = req.body.finish;
    const user_words = req.body.user_words;
    const wordReminder = await wordReminderQueries.create({
      user_id: userId,
      reminder,
      is_active: is_active,
      has_reminder_onload: has_reminder_onload,
      finish,
    });
    user_words.forEach(async (word: UserWord) => {
      await userWordsWordRemindersQueries.create({
        user_word_id: word.id,
        word_reminder_id: wordReminder.id,
      });
    });

    res.status(200).json({ wordReminder: { ...wordReminder, user_words } });
  }),
];

// @desc    Delete all of the user's word reminders
// @route   DELETE /api/users/:userId/wordReminders
// @access  Private
export const delete_word_reminders = asyncHandler(async (req, res) => {
  const userId: string = req.params.userId;
  const deletedUserWordsWordReminders =
    await userWordsWordRemindersQueries.deleteAllByUserId(userId);
  const deletedWordReminders = await wordReminderQueries.deleteAllByUserId(
    userId
  );
  res.status(200).json({
    userWordsWordReminders: deletedUserWordsWordReminders,
    wordReminders: deletedWordReminders,
  });
});

// @desc    Delete single word reminder
// @route   DELETE /api/users/:userId/wordReminders/:wordReminderId
// @access  Private
export const delete_word_reminder = asyncHandler(async (req, res) => {
  const wordReminderId: string = req.params.wordReminderId;
  const deletedUserWordsWordReminders =
    await userWordsWordRemindersQueries.deleteAllByWordReminderId(
      wordReminderId
    );
  res.status(200).json({
    userWordsWordReminders: deletedUserWordsWordReminders,
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

    const wordReminder = await wordReminderQueries.update({
      id: wordReminderId,
      reminder,
      is_active: is_active,
      has_reminder_onload: has_reminder_onload,
      finish,
    });
    await userWordsWordRemindersQueries.deleteAllByWordReminderId(
      wordReminderId
    );
    user_words.forEach(async (word: UserWord) => {
      await userWordsWordRemindersQueries.create({
        user_word_id: word.id,
        word_reminder_id: wordReminderId,
      });
    });

    res.status(200).json({ wordReminder: { ...wordReminder, user_words } });
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
