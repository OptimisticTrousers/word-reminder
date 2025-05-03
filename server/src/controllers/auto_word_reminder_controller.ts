import asyncHandler from "express-async-handler";

import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { boss } from "../db/boss";

const queuePostfix = "auto-word-reminder-queue";

// @desc Create a auto word reminder
// @route POST /api/users/:userId/autoWordReminders
// @access Private
export const create_auto_word_reminder = asyncHandler(async (req, res) => {
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

  const queueName = `${userId}-${queuePostfix}`;

  const newAddToDuration = new Date(Date.now() + duration);

  await boss.sendAfter(
    queueName,
    {
      create_now,
      userId,
      word_count,
      has_learned_words,
      has_reminder_onload,
      sort_mode,
      duration,
      reminder,
      is_active,
    },
    {},
    create_now ? new Date(Date.now()) : newAddToDuration
  );

  res.status(200).json({
    autoWordReminder,
  });
});

// @desc    Get auto word reminders, user should only have one at all times
// @route   GET /api/users/:userId/autoWordReminders
// @access  Private
export const get_auto_word_reminder = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  const [autoWordReminder] = await autoWordReminderQueries.getByUserId(userId);

  res.status(200).json({
    autoWordReminder,
  });
});

// @desc Delete single auto word reminder
// @route POST /api/users/:userId/autoWordReminders/:autoWordReminderId
// @access Private
export const delete_auto_word_reminder = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const autoWordReminderId = Number(req.params.autoWordReminderId);

  const deletedAutoWordReminder = await autoWordReminderQueries.deleteById(
    autoWordReminderId
  );

  const queueName = `${userId}-${queuePostfix}`;

  await boss.unschedule(queueName);
  await boss.offWork(queueName);

  res.status(200).json({
    autoWordReminder: deletedAutoWordReminder,
  });
});

// @desc Update a auto word reminder
// @route POST /api/users/:userId/autoWordReminders/:autoWordReminderId
// @access Private
export const update_auto_word_reminder = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const autoWordReminderId = Number(req.params.autoWordReminderId);
  let { create_now } = req.body;
  const {
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

  const queueName = `${userId}-${queuePostfix}`;

  const newAddToDuration = new Date(Date.now() + duration);

  await boss.purgeQueue(queueName);

  await boss.sendAfter(
    queueName,
    {
      create_now,
      userId,
      word_count,
      has_learned_words,
      has_reminder_onload,
      sort_mode,
      duration,
      reminder,
      is_active,
    },
    {},
    create_now ? new Date(Date.now()) : newAddToDuration
  );

  res.status(200).json({
    autoWordReminder,
  });
});
