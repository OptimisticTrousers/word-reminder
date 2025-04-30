import { Detail, UserWord } from "common";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { boss } from "../db/boss";
import { userWordQueries } from "../db/user_word_queries";
import { wordQueries } from "../db/word_queries";
import { timeout } from "cron";
import { subscriptionQueries } from "../db/subscription_queries";
import { triggerWebPushMsg } from "./trigger_web_push_msg";

export const scheduleWordReminder = async ({
  word_reminder_id,
  user_id,
  is_active,
  reminder,
  user_words,
  queueName,
}: {
  word_reminder_id: number;
  user_id: string;
  is_active: boolean;
  has_reminder_onload: boolean;
  reminder: string;
  finish: Date;
  user_words: (UserWord & { details?: Detail[] })[];
  queueName: string;
}) => {
  if (is_active) {
    await boss.schedule(queueName, reminder);

    const wordsPromises: Promise<string>[] = user_words.map(
      async (user_word: UserWord) => {
        const userWord = await userWordQueries.getById(Number(user_word.id));
        const word = await wordQueries.getById(userWord!.word_id);
        return word!.details[0].word;
      }
    );

    const words: string[] = await Promise.all(wordsPromises);

    const pollingIntervalMs = timeout(reminder);
    const pollingIntervalSeconds = Math.round(pollingIntervalMs / 1000);
    await boss.work(queueName, { pollingIntervalSeconds }, async () => {
      const data = {
        id: word_reminder_id,
        words: words.join(", "),
      };
      const subscription = await subscriptionQueries.getByUserId(
        Number(user_id)
      );
      await triggerWebPushMsg(subscription, JSON.stringify(data));
    });
  }
};
