import asyncHandler from "express-async-handler";

import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { boss } from "../db/boss";
import { userWordQueries } from "../db/user_word_queries";
import { scheduleWordReminder } from "../utils/word_reminder";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { UserWord } from "common";

// @desc Create a auto word reminder
// @route POST /api/users/:userId/autoWordReminders
// @access Private
export const create_auto_word_reminder = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
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

  const queueName = res.locals.queueName;

  await boss.schedule(queueName, reminder);

  const pollingIntervalMs = duration;
  const pollingIntervalSeconds = Math.round(pollingIntervalMs / 1000);
  await boss.work(queueName, { pollingIntervalSeconds }, async () => {
    if (!create_now) {
      create_now = true;
      return;
    }
    await wordReminderQueries.deactivate();
    const wordReminderQueueName = `${userId}-word-reminder-queue`;
    await boss.offWork(wordReminderQueueName);
    // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
    const randomUserWords = await userWordQueries.getUserWords({
      user_id: userId,
      word_count,
      has_learned_words,
      sort_mode,
    });
    const newAddToDuration = new Date(Date.now() + duration);

    const wordReminder = await wordReminderQueries.create({
      user_id: Number(userId),
      is_active: is_active,
      has_reminder_onload: has_reminder_onload,
      finish: newAddToDuration,
      reminder,
    });

    randomUserWords.forEach(async (user_word: UserWord) => {
      await userWordsWordRemindersQueries.create({
        user_word_id: user_word.id,
        word_reminder_id: wordReminder.id,
      });
    });

    await scheduleWordReminder({
      word_reminder_id: wordReminder.id,
      user_id: String(userId),
      is_active,
      has_reminder_onload,
      reminder,
      finish: newAddToDuration,
      user_words: randomUserWords,
      queueName: res.locals.queueName,
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
  const autoWordReminderId = Number(req.params.autoWordReminderId);

  const deletedAutoWordReminder = await autoWordReminderQueries.deleteById(
    autoWordReminderId
  );

  const queueName = res.locals.queueName;

  await boss.deleteQueue(queueName);

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

  const queueName = res.locals.queueName;

  await boss.purgeQueue(queueName);

  await boss.schedule(queueName, reminder);

  const pollingIntervalMs = duration;
  const pollingIntervalSeconds = Math.round(pollingIntervalMs / 1000);
  await boss.work(
    queueName,
    { pollingIntervalSeconds },
    async () => {
      if (!create_now) {
        create_now = true;
        return;
      }
      await wordReminderQueries.deactivate();
      const wordReminderQueueName = `${userId}-word-reminder-queue`;
      await boss.offWork(wordReminderQueueName);
      // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
      const randomUserWords = await userWordQueries.getUserWords({
        user_id: userId,
        word_count,
        has_learned_words,
        sort_mode,
      });
      const newAddToDuration = new Date(Date.now() + duration);

      const wordReminder = await wordReminderQueries.create({
        user_id: Number(userId),
        is_active: is_active,
        has_reminder_onload: has_reminder_onload,
        finish: newAddToDuration,
        reminder,
      });

      randomUserWords.forEach(async (user_word: UserWord) => {
        await userWordsWordRemindersQueries.create({
          user_word_id: user_word.id,
          word_reminder_id: wordReminder.id,
        });
      });

      await scheduleWordReminder({
        word_reminder_id: wordReminder.id,
        user_id: String(userId),
        is_active,
        has_reminder_onload,
        reminder,
        finish: newAddToDuration,
        user_words: randomUserWords,
        queueName: res.locals.queueName,
      });
    }
  );

  res.status(200).json({
    autoWordReminder,
  });
});
