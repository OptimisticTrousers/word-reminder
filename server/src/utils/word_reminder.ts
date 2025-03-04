import { wordReminderQueries } from "../db/word_reminder_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";

export const createWordReminder = async ({
  user_id,
  is_active,
  has_reminder_onload,
  reminder,
  finish,
  user_word_ids,
}: {
  user_id: number;
  is_active: boolean;
  has_reminder_onload: boolean;
  reminder: string;
  finish: Date;
  user_word_ids: number[];
}) => {
  const wordReminder = await wordReminderQueries.create({
    user_id,
    is_active: is_active,
    has_reminder_onload: has_reminder_onload,
    finish,
    reminder,
  });

  user_word_ids.forEach((user_word_id: number) => {
    userWordsWordRemindersQueries.create({
      user_word_id: user_word_id,
      word_reminder_id: wordReminder.id,
    });
  });

  return wordReminder;
};
