import { AutoWordReminder } from "common";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { boss } from "../db/boss";

const queueName = "auto-word-reminder-queue";

// @desc Create a auto word reminder
// @route POST /api/users/:userId/autoWordReminders
// @access Private
export const create_auto_word_reminder = asyncHandler(
  async (
    req: Request<
      { userId: string },
      unknown,
      Omit<AutoWordReminder & { create_now: boolean }, "id">
    >,
    res: Response<{ autoWordReminder: AutoWordReminder }>
  ) => {
    const userId = Number(req.params.userId);
    const {
      create_now,
      is_active,
      has_reminder_onload,
      reminder,
      duration,
      word_count,
      sort_mode,
      has_learned_words,
    } = req.body;

    const autoWordReminder = await autoWordReminderQueries.create({
      user_id: userId,
      is_active,
      has_reminder_onload,
      has_learned_words,
      sort_mode,
      word_count,
      reminder,
      duration,
    });

    const newAddToDuration = new Date(Date.now() + duration);

    await boss.sendAfter(
      queueName,
      {
        auto_word_reminder_id: autoWordReminder.id,
      },
      {},
      create_now ? new Date(Date.now()) : newAddToDuration
    );

    res.status(200).json({
      autoWordReminder,
    });
  }
);

// @desc    Get auto word reminders, user should only have one at all times
// @route   GET /api/users/:userId/autoWordReminders
// @access  Private
export const get_auto_word_reminder = asyncHandler(
  async (
    req: Request<{ userId: string }>,
    res: Response<{ autoWordReminder: AutoWordReminder }>
  ) => {
    const userId = Number(req.params.userId);

    const [autoWordReminder] = await autoWordReminderQueries.getByUserId(
      userId
    );

    res.status(200).json({
      autoWordReminder,
    });
  }
);

// @desc Delete single auto word reminder
// @route POST /api/users/:userId/autoWordReminders/:autoWordReminderId
// @access Private
export const delete_auto_word_reminder = asyncHandler(
  async (
    req: Request<{ autoWordReminderId: string }>,
    res: Response<{ autoWordReminder: AutoWordReminder | undefined }>
  ) => {
    const autoWordReminderId = Number(req.params.autoWordReminderId);

    const deletedAutoWordReminder = await autoWordReminderQueries.deleteById(
      autoWordReminderId
    );

    res.status(200).json({
      autoWordReminder: deletedAutoWordReminder,
    });
  }
);

// @desc Update a auto word reminder
// @route POST /api/users/:userId/autoWordReminders/:autoWordReminderId
// @access Private
export const update_auto_word_reminder = asyncHandler(
  async (
    req: Request<
      { userId: string; autoWordReminderId: string },
      unknown,
      Omit<AutoWordReminder & { create_now: boolean }, "id">
    >,
    res: Response<{ autoWordReminder: AutoWordReminder }>
  ) => {
    const autoWordReminderId = Number(req.params.autoWordReminderId);
    const {
      create_now,
      is_active,
      has_reminder_onload,
      reminder,
      duration,
      word_count,
      sort_mode,
      has_learned_words,
    } = req.body;

    const autoWordReminder = await autoWordReminderQueries.updateById(
      autoWordReminderId,
      {
        is_active,
        has_reminder_onload,
        has_learned_words,
        sort_mode,
        word_count,
        reminder,
        duration,
      }
    );

    const newAddToDuration = new Date(Date.now() + duration);

    await boss.sendAfter(
      queueName,
      {
        auto_word_reminder_id: autoWordReminder.id,
      },
      {},
      create_now ? new Date(Date.now()) : newAddToDuration
    );

    res.status(200).json({
      autoWordReminder,
    });
  }
);
