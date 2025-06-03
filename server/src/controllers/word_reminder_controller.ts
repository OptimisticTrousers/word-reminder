import asyncHandler from "express-async-handler";

import {
  Result,
  userWordsWordRemindersQueries,
} from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { boss } from "../db/boss";
import { Detail, UserWord, UserWordsWordReminders, WordReminder } from "common";
import { Request, Response } from "express";

const queueName = "word-reminder-queue";

// @desc Create a new word reminder
// @route POST /api/users/:userId/wordReminders
// @access Private
export const create_word_reminder = asyncHandler(
  async (
    req: Request<
      { userId: string },
      unknown,
      Omit<WordReminder & { user_words: UserWord[] }, "id">
    >,
    res: Response<{ wordReminder: WordReminder }>
  ) => {
    const userId = Number(req.params.userId);
    const { is_active, has_reminder_onload, reminder, finish, user_words } =
      req.body;

    const wordReminder = await wordReminderQueries.create({
      user_id: Number(userId),
      is_active: is_active,
      has_reminder_onload: has_reminder_onload,
      finish,
      reminder,
    });

    const userWordsWordRemindersPromises: Promise<UserWordsWordReminders>[] =
      user_words.map((user_word: UserWord) => {
        return userWordsWordRemindersQueries.create({
          user_word_id: user_word.id,
          word_reminder_id: wordReminder.id,
        });
      });

    await Promise.all(userWordsWordRemindersPromises);

    await boss.schedule(queueName, reminder, {
      word_reminder_id: wordReminder.id,
      reminder,
    });

    res.status(200).json({
      wordReminder,
    });
  }
);

// @desc    Delete all of the user's word reminders
// @route   DELETE /api/users/:userId/wordReminders
// @access  Private
export const delete_word_reminders = asyncHandler(
  async (
    req: Request<{ userId: string }>,
    res: Response<{
      userWordsWordReminders: UserWordsWordReminders[];
      wordReminders: WordReminder[];
    }>
  ) => {
    const userId = Number(req.params.userId);
    const deletedUserWordsWordReminders =
      await userWordsWordRemindersQueries.deleteByUserId(userId);

    const deletedWordReminders = await wordReminderQueries.deleteByUserId(
      userId
    );

    res.status(200).json({
      userWordsWordReminders: deletedUserWordsWordReminders,
      wordReminders: deletedWordReminders,
    });
  }
);

// @desc    Delete single word reminder
// @route   DELETE /api/users/:userId/wordReminders/:wordReminderId
// @access  Private
export const delete_word_reminder = asyncHandler(
  async (
    req: Request<{ wordReminderId: string }, unknown, unknown>,
    res: Response<{
      userWordsWordReminders: UserWordsWordReminders[];
      wordReminder: WordReminder | undefined;
    }>
  ) => {
    const wordReminderId = Number(req.params.wordReminderId);

    const deletedUserWordsWordReminders =
      await userWordsWordRemindersQueries.deleteByWordReminderId(
        wordReminderId
      );

    const deletedWordReminder = await wordReminderQueries.deleteById(
      wordReminderId
    );

    res.status(200).json({
      userWordsWordReminders: deletedUserWordsWordReminders,
      wordReminder: deletedWordReminder,
    });
  }
);

// @desc    Get single word reminder
// @route   GET /api/users/:userId/wordReminders/:wordReminderId
// @access  Private
export const get_word_reminder = asyncHandler(
  async (
    req: Request<{ wordReminderId: string }, unknown, unknown>,
    res: Response<{
      wordReminder: WordReminder & {
        user_words: { details: Detail[]; learned: boolean }[];
      };
    }>
  ) => {
    const wordReminderId = Number(req.params.wordReminderId);

    const wordReminder =
      await userWordsWordRemindersQueries.getByWordReminderId(wordReminderId);

    res.status(200).json({
      wordReminder,
    });
  }
);

// @desc Update a word reminder
// @route PUT /api/users/:userId/wordReminders/:wordReminderId
// @access Private
export const update_word_reminder = asyncHandler(
  async (
    req: Request<
      { wordReminderId: string },
      unknown,
      Omit<WordReminder & { user_words: UserWord[] }, "id">
    >,
    res: Response<{ wordReminder: WordReminder }>
  ) => {
    const wordReminderId = Number(req.params.wordReminderId);
    const { is_active, has_reminder_onload, reminder, finish, user_words } =
      req.body;

    const oldWordReminder = await wordReminderQueries.getById(wordReminderId);
    const wordReminder = await wordReminderQueries.updateById(wordReminderId, {
      is_active,
      reminder,
      has_reminder_onload,
      finish,
    });

    await userWordsWordRemindersQueries.deleteByWordReminderId(wordReminder.id);

    const userWordsWordRemindersPromises = user_words.map(
      (user_word: UserWord) => {
        return userWordsWordRemindersQueries.create({
          user_word_id: user_word.id,
          word_reminder_id: wordReminder.id,
        });
      }
    );

    await Promise.all(userWordsWordRemindersPromises);

    if (oldWordReminder!.reminder !== reminder) {
      await boss.schedule(queueName, reminder, {
        word_reminder_id: wordReminder.id,
        reminder,
      });
    }

    res.status(200).json({
      wordReminder,
    });
  }
);

// @desc  Get all word reminders
// @route GET /api/users/:userId/wordReminders
// @query column, direction, table, page, limit
// @access Private
export const word_reminder_list = asyncHandler(
  async (
    req: Request<
      { userId: string },
      unknown,
      unknown,
      { column: string; direction: string; page: string; limit: string }
    >,
    res: Response<Result>
  ) => {
    const userId = Number(req.params.userId);
    const { column, direction, page, limit } = req.query;

    const options = {
      ...(column &&
        direction && {
          sort: {
            column,
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
  }
);
