import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { createWordReminder } from "../utils/word_reminder";

const userId = 1;
const word1 = {
  id: 1,
  details: [
    {
      word: "hello",
      phonetics: [
        {
          text: "hɛˈləʊ",
        },
      ],
      meanings: [
        {
          partOfSpeech: "exclamation",
          definitions: [
            {
              definition:
                "used as a greeting or to begin a phone conversation.",
              example: "hello there, Katie!",
              synonyms: [],
              antonyms: [],
            },
          ],
        },
      ],
    },
  ],
  created_at: new Date(),
};
const word2 = {
  id: 2,
  details: [
    {
      word: "clemency",
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [{ definition: "Mercy; lenience." }],
        },
      ],
      phonetics: [],
    },
  ],
  created_at: new Date(),
};
const userWord1 = {
  id: 1,
  word_id: 1,
  user_id: userId,
  learned: false,
  details: word1.details,
  created_at: new Date(),
  updated_at: new Date(),
};
const userWord2 = {
  id: 2,
  word_id: 2,
  user_id: userId,
  learned: false,
  details: word2.details,
  created_at: new Date(),
  updated_at: new Date(),
};
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
  user_word_id: userWord1.id,
};
const userWordsWordReminders2 = {
  id: 2,
  word_reminder_id: wordReminder.id,
  user_word_id: userWord2.id,
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
      user_words: [userWord1, userWord2],
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
