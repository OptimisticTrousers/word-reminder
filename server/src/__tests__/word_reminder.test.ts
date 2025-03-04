import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { createWordReminder } from "../utils/word_reminder";

const userWordIds = [1, 2];
const wordReminderParams = {
  user_id: 1,
  is_active: true,
  has_reminder_onload: true,
  finish: new Date(),
  reminder: "* * * * *",
};
const wordReminder = {
  id: 1,
  ...wordReminderParams,
  created_at: new Date(),
  updated_at: new Date(),
};
const userWordsWordReminders1 = {
  id: 1,
  word_reminder_id: wordReminder.id,
  user_word_id: userWordIds[0],
};
const userWordsWordReminders2 = {
  id: 2,
  word_reminder_id: wordReminder.id,
  user_word_id: userWordIds[1],
};

describe("createWordReminder", () => {
  it("calls the function to create a word reminder", async () => {
    const mockWordReminderCreate = jest
      .spyOn(wordReminderQueries, "create")
      .mockResolvedValue(wordReminder);
    const mockUserWordsWordRemindersCreate = jest
      .spyOn(userWordsWordRemindersQueries, "create")
      .mockResolvedValueOnce(userWordsWordReminders1)
      .mockResolvedValueOnce(userWordsWordReminders2);

    const newWordReminder = await createWordReminder({
      ...wordReminderParams,
      user_word_ids: userWordIds,
    });

    expect(mockWordReminderCreate).toHaveBeenCalledTimes(1);
    expect(mockWordReminderCreate).toHaveBeenCalledWith(wordReminderParams);
    expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledTimes(2);
    expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledWith({
      user_word_id: userWordsWordReminders1.user_word_id,
      word_reminder_id: userWordsWordReminders1.word_reminder_id,
    });
    expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledWith({
      user_word_id: userWordsWordReminders2.user_word_id,
      word_reminder_id: userWordsWordReminders2.word_reminder_id,
    });
    expect(newWordReminder).toEqual(wordReminder);
  });
});
