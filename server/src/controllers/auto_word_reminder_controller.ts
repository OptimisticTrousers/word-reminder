import { UserWord } from "common";
import asyncHandler from "express-async-handler";

import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { boss } from "../db/boss";
import { userWordQueries } from "../db/user_word_queries";
import { createWordReminder } from "../utils/word_reminder";

const queueName = "auto-word-reminder-queue";

// @desc Create a auto word reminder
// @route POST /api/users/:userId/autoWordReminders
// @access Private
export const create_auto_word_reminder = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const {
    is_active,
    create_now,
    has_reminder_onload,
    reminder,
    duration,
    word_count,
    sort_mode,
    has_learned_words,
  } = req.body;

  const addToDuration = new Date(Date.now() + duration);

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

  if (create_now) {
    // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
    const randomUserWords = await userWordQueries.getUserWords({
      user_id: userId,
      word_count,
      has_learned_words,
      sort_mode,
    });

    const user_word_ids = randomUserWords.map((user_word: UserWord) => {
      return user_word.id;
    });

    await createWordReminder({
      user_id: userId,
      is_active,
      has_reminder_onload,
      reminder,
      finish: addToDuration,
      user_word_ids,
    });
  }

  const queue = `${userId}-${queueName}`;

  await boss.sendAfter(queue, {}, {}, addToDuration);

  await boss.work(queue, async () => {
    // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
    const randomUserWords = await userWordQueries.getUserWords({
      user_id: userId,
      word_count,
      has_learned_words,
      sort_mode,
    });
    const user_word_ids = randomUserWords.map((user_word: UserWord) => {
      return user_word.id;
    });
    const newAddToDuration = new Date(Date.now() + duration);

    await createWordReminder({
      user_id: userId,
      is_active,
      has_reminder_onload,
      reminder,
      finish: newAddToDuration,
      user_word_ids,
    });
  });

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

  const queue = `${userId}-${queueName}`;

  await boss.deleteQueue(queue);

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
  const {
    is_active,
    create_now,
    has_reminder_onload,
    reminder,
    duration,
    word_count,
    sort_mode,
    has_learned_words,
  } = req.body;

  const addToDuration = new Date(Date.now() + duration);

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

  if (create_now) {
    // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
    const randomUserWords = await userWordQueries.getUserWords({
      user_id: userId,
      word_count,
      has_learned_words,
      sort_mode,
    });
    const user_word_ids = randomUserWords.map((user_word: UserWord) => {
      return user_word.id;
    });

    await createWordReminder({
      user_id: userId,
      is_active,
      has_reminder_onload,
      reminder,
      finish: addToDuration,
      user_word_ids,
    });
  }

  const queue = `${userId}-${queueName}`;

  await boss.purgeQueue(queue);

  await boss.sendAfter(queue, {}, {}, addToDuration);

  await boss.work(queue, async () => {
    // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
    const randomUserWords = await userWordQueries.getUserWords({
      user_id: userId,
      word_count,
      has_learned_words,
      sort_mode,
    });
    const user_word_ids = randomUserWords.map((user_word: UserWord) => {
      return user_word.id;
    });
    const newAddToDuration = new Date(Date.now() + duration);

    await createWordReminder({
      user_id: userId,
      is_active,
      has_reminder_onload,
      reminder,
      finish: newAddToDuration,
      user_word_ids,
    });
  });

  res.status(200).json({
    autoWordReminder,
  });
});
