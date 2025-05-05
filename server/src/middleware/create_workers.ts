import asyncHandler from "express-async-handler";
import { Job } from "pg-boss";

import { boss } from "../db/boss";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { userWordQueries } from "../db/user_word_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordQueries } from "../db/word_queries";
import { Detail, Token, UserWord } from "common";
import { subscriptionQueries } from "../db/subscription_queries";
import { triggerWebPushMsg } from "../utils/trigger_web_push_msg";
import { tokenQueries } from "../db/token_queries";
import { NextFunction } from "express";

interface AutoWordReminderJobData {
  auto_word_reminder_id: number;
}

interface WordReminderJobData {
  word_reminder_id: number;
}

export const createWorkers = asyncHandler(async (_req, _res, next) => {
  const autoWordReminderQueueName = "auto-word-reminder-queue";
  async function autoWordReminderCallback([
    job,
  ]: Job<AutoWordReminderJobData>[]) {
    const { auto_word_reminder_id } = job.data;
    const autoWordReminder = await autoWordReminderQueries.getById(
      auto_word_reminder_id
    );
    if (!autoWordReminder) {
      await boss.complete(autoWordReminderQueueName, job.id);
      return;
    }
    const {
      user_id,
      word_count,
      has_learned_words,
      has_reminder_onload,
      sort_mode,
      duration,
      reminder,
      is_active,
    } = autoWordReminder;

    const newAddToDuration = new Date(Date.now() + duration);
    // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
    const randomUserWords = await userWordQueries.getUserWords({
      user_id,
      word_count,
      has_learned_words,
      sort_mode,
    });
    const wordReminder = await wordReminderQueries.create({
      user_id: Number(user_id),
      is_active: is_active,
      has_reminder_onload: has_reminder_onload,
      finish: newAddToDuration,
      reminder,
    });

    const wordPromises: Promise<string>[] = randomUserWords.map(
      async (user_word: UserWord) => {
        await userWordsWordRemindersQueries.create({
          user_word_id: user_word.id,
          word_reminder_id: wordReminder.id,
        });
        const userWord = await userWordQueries.getById(Number(user_word.id));
        const word = await wordQueries.getById(userWord!.word_id);
        return word!.details[0].word;
      }
    );

    const words: string[] = await Promise.all(wordPromises);

    await boss.schedule(autoWordReminderQueueName, reminder, {
      word_reminder_id: wordReminder.id,
      user_id,
      words,
      finish: newAddToDuration,
      has_reminder_onload,
      reminder,
    });

    await boss.sendAfter(
      autoWordReminderQueueName,
      {
        auto_word_reminder_id,
      },
      {},
      newAddToDuration
    );
  }

  const wordReminderQueueName = "word-reminder-queue";
  async function wordReminderCallback([job]: Job<WordReminderJobData>[]) {
    const { word_reminder_id } = job.data;
    const wordReminder = await wordReminderQueries.getById(word_reminder_id);
    if (!wordReminder) {
      await boss.complete(wordReminderQueueName, job.id);
    } else if (wordReminder.finish.getTime() <= Date.now()) {
      await boss.complete(wordReminderQueueName, job.id);
      await wordReminderQueries.updateById(word_reminder_id, {
        is_active: false,
        has_reminder_onload: wordReminder.has_reminder_onload,
        reminder: wordReminder.reminder,
        finish: wordReminder.finish,
      });
    } else if (wordReminder.is_active) {
      const { user_words } =
        await userWordsWordRemindersQueries.getByWordReminderId(
          word_reminder_id
        );
      const wordPromises: Promise<string>[] = user_words.map(
        async (user_word: { details: Detail[]; learned: boolean }) => {
          return user_word.details[0].word;
        }
      );

      const words: string[] = await Promise.all(wordPromises);
      const data = {
        id: word_reminder_id,
        words: words.join(", "),
      };
      const subscription = await subscriptionQueries.getByUserId(
        Number(wordReminder.user_id)
      );
      const twoDaysMs = 172800;
      await triggerWebPushMsg(subscription, JSON.stringify(data), {
        TTL: wordReminder.has_reminder_onload ? twoDaysMs : 0, // 2 days if the user wants to see the notification once they open their browser and 0 if they never want to see it if their browser is closed
      });
    }
  }

  const emailQueueName = "email-queue";
  async function emailCallback(jobs: Job<Token>[]) {
    const tokens = jobs.map((job) => {
      return job.data.token;
    });
    await tokenQueries.deleteAll(tokens);
  }

  await boss.createQueue(autoWordReminderQueueName);
  await boss.createQueue(wordReminderQueueName);
  await boss.createQueue(emailQueueName);
  await boss.work(autoWordReminderQueueName, autoWordReminderCallback);
  await boss.work(wordReminderQueueName, wordReminderCallback);
  await boss.work(emailQueueName, emailCallback);

  next();
});
