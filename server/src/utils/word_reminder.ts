import { ManualWordReminderParams } from "common";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { addToDatesWordRemindersQueries } from "../db/add_to_dates_word_reminders_queries";
import { addToDateQueries } from "../db/add_to_date_queries";

export const createWordReminder = async ({
  user_id,
  is_active,
  has_reminder_onload,
  reminder,
  finish,
  user_words,
}: ManualWordReminderParams) => {
  const wordReminder = await wordReminderQueries.create({
    user_id,
    is_active: is_active,
    has_reminder_onload: has_reminder_onload,
    finish,
  });
  const addToDateReminder = await addToDateQueries.create(reminder);

  await addToDatesWordRemindersQueries.create({
    word_reminder_id: wordReminder.id,
    reminder_id: addToDateReminder.id,
  });

  user_words.forEach(async (user_word_id: string) => {
    await userWordsWordRemindersQueries.create({
      user_word_id: user_word_id,
      word_reminder_id: wordReminder.id,
    });
  });

  return wordReminder;
};
