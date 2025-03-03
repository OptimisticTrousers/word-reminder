import { addToDateQueries } from "../db/add_to_date_queries";
import { addToDatesWordRemindersQueries } from "../db/add_to_dates_word_reminders_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { createWordReminder } from "../utils/word_reminder";

describe("createWordReminder", () => {
  const reminder = {
    minutes: 0,
    hours: 0,
    days: 0,
    weeks: 0,
    months: 0,
  };
  const wordReminderId = "1";
  const reminderId = "1";
  const wordReminder = {
    user_id: "1",
    is_active: true,
    has_reminder_onload: true,
    finish: new Date("December 17, 1995 03:24:00"),
  };
  const user_words = ["1", "2"];
  const wordReminderParams = {
    ...wordReminder,
    reminder,
    user_words,
  };

  const created_at = new Date("December 13, 1995 03:24:00");
  const updated_at = new Date("December 14, 1995 03:24:00");

  it("calls the function to create a word reminder", async () => {
    const mockWordReminderCreate = jest
      .spyOn(wordReminderQueries, "create")
      .mockImplementation(async () => {
        return {
          ...wordReminder,
          id: wordReminderId,
          created_at,
          updated_at,
        };
      });
    const mockAddToDateCreate = jest
      .spyOn(addToDateQueries, "create")
      .mockImplementation(async () => {
        return { ...reminder, id: reminderId };
      });
    const mockAddToDatesWordRemindersCreate = jest
      .spyOn(addToDatesWordRemindersQueries, "create")
      .mockImplementation(async () => {
        return {
          id: "1",
          word_reminder_id: wordReminderId,
          reminder_id: reminderId,
        };
      });
    const mockUserWordsWordRemindersCreate = jest
      .spyOn(userWordsWordRemindersQueries, "create")
      .mockImplementationOnce(async () => {
        return {
          user_word_id: user_words[0],
          word_reminder_id: wordReminderId,
          id: "1",
        };
      })
      .mockImplementationOnce(async () => {
        return {
          user_word_id: user_words[1],
          word_reminder_id: wordReminderId,
          id: "2",
        };
      });

    const newWordReminder = await createWordReminder(wordReminderParams);

    expect(mockWordReminderCreate).toHaveBeenCalledTimes(1);
    expect(mockWordReminderCreate).toHaveBeenCalledWith(wordReminder);
    expect(mockAddToDateCreate).toHaveBeenCalledTimes(1);
    expect(mockAddToDateCreate).toHaveBeenCalledWith(reminder);
    expect(mockAddToDatesWordRemindersCreate).toHaveBeenCalledTimes(1);
    expect(mockAddToDatesWordRemindersCreate).toHaveBeenCalledWith({
      word_reminder_id: wordReminderId,
      reminder_id: reminderId,
    });
    expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledTimes(2);
    expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledWith({
      user_word_id: user_words[0],
      word_reminder_id: wordReminderId,
    });
    expect(mockUserWordsWordRemindersCreate).toHaveBeenCalledWith({
      user_word_id: user_words[1],
      word_reminder_id: wordReminderId,
    });
    expect(newWordReminder).toEqual({
      ...wordReminder,
      id: "1",
      created_at,
      updated_at,
    });
  });
});
