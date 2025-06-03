/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { userQueries } from "../db/user_queries";
import { userWordQueries } from "../db/user_word_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { wordQueries } from "../db/word_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

const userId = 1;
const userParams = {
  email: "email@protonmail.com",
  password: "password",
};

const wordReminderParams = {
  user_id: userId,
  finish: new Date(Date.UTC(95, 12, 17, 3, 24)),
  is_active: true,
  reminder: "* * * * *",
  has_reminder_onload: true,
};

const milieuJson = [
  {
    word: "milieu",
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [{ definition: "A person's social environment." }],
      },
    ],
    phonetics: [],
  },
];
const clemencyJson = [
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
];

const helloJson = [
  {
    word: "hello",
    phonetic: "həˈləʊ",
    phonetics: [
      {
        text: "həˈləʊ",
        audio:
          "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3",
      },
      {
        text: "hɛˈləʊ",
      },
    ],
    origin: "early 19th century: variant of earlier hollo ; related to holla.",
    meanings: [
      {
        partOfSpeech: "exclamation",
        definitions: [
          {
            definition: "used as a greeting or to begin a phone conversation.",
            example: "hello there, Katie!",
            synonyms: [],
            antonyms: [],
          },
        ],
      },
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "an utterance of ‘hello’; a greeting.",
            example: "she was getting polite nods and hellos from people",
            synonyms: [],
            antonyms: [],
          },
        ],
      },
      {
        partOfSpeech: "verb",
        definitions: [
          {
            definition: "say or shout ‘hello’.",
            example: "I pressed the phone button and helloed",
            synonyms: [],
            antonyms: [],
          },
        ],
      },
    ],
  },
];

describe("userWordsWordRemindersQueries", () => {
  describe("create", () => {
    it("creates the junction table", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json: helloJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create(userParams);
      const clemencyUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: clemencyWord.id,
        learned: false,
      });
      const helloUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: helloWord.id,
        learned: false,
      });
      const milieuUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: milieuWord.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminderParams);

      const userWordsWordReminders1 =
        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: wordReminder.id,
        });
      const userWordsWordReminders2 =
        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: wordReminder.id,
        });
      const userWordsWordReminders3 =
        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: wordReminder.id,
        });

      expect(userWordsWordReminders1).toEqual({
        id: 1,
        user_word_id: clemencyUserWord.id,
        word_reminder_id: wordReminder.id,
      });
      expect(userWordsWordReminders2).toEqual({
        id: 2,
        user_word_id: helloUserWord.id,
        word_reminder_id: wordReminder.id,
      });
      expect(userWordsWordReminders3).toEqual({
        id: 3,
        user_word_id: milieuUserWord.id,
        word_reminder_id: wordReminder.id,
      });
    });

    it("returns the user words word reminders if the junction table was already created", async () => {
      const helloWord = await wordQueries.create({ json: helloJson });
      const user = await userQueries.create(userParams);
      const userWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: helloWord.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminderParams);
      await userWordsWordRemindersQueries.create({
        user_word_id: userWord.id,
        word_reminder_id: wordReminder.id,
      });

      const newUserWordsWordReminders =
        await userWordsWordRemindersQueries.create({
          user_word_id: userWord.id,
          word_reminder_id: wordReminder.id,
        });

      expect(newUserWordsWordReminders).toEqual({
        id: 1,
        user_word_id: userWord.id,
        word_reminder_id: wordReminder.id,
      });
    });
  });

  describe("deleteByUserId", () => {
    it("deletes all of the user's user words word reminders", async () => {
      const word = await wordQueries.create({ json: helloJson });
      const user = await userQueries.create(userParams);
      const userWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: word.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminderParams);
      await userWordsWordRemindersQueries.create({
        user_word_id: userWord.id,
        word_reminder_id: wordReminder.id,
      });

      const deletedUserWordsWordReminders =
        await userWordsWordRemindersQueries.deleteByUserId(user!.id);

      expect(deletedUserWordsWordReminders).toEqual([
        {
          id: 1,
          user_word_id: userWord.id,
          word_reminder_id: wordReminder.id,
        },
      ]);
    });
  });

  describe("deleteByWordReminderId", () => {
    it("deletes all of the user words and word reminder", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json: helloJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create(userParams);
      const clemencyUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: clemencyWord.id,
        learned: false,
      });
      const helloUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: helloWord.id,
        learned: false,
      });
      const milieuUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: milieuWord.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminderParams);

      const userWordsWordReminders1 =
        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: wordReminder.id,
        });
      const userWordsWordReminders2 =
        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: wordReminder.id,
        });
      const userWordsWordReminders3 =
        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: wordReminder.id,
        });

      const wordReminders =
        await userWordsWordRemindersQueries.deleteByWordReminderId(
          wordReminder.id
        );
      expect(wordReminders).toEqual([
        userWordsWordReminders1,
        userWordsWordReminders2,
        userWordsWordReminders3,
      ]);
    });
  });

  describe("getByWordReminderId", () => {
    it("gets all of the user words and the word reminder", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json: helloJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create(userParams);
      const clemencyUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: clemencyWord.id,
        learned: false,
      });
      const helloUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: helloWord.id,
        learned: false,
      });
      const milieuUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: milieuWord.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminderParams);

      await userWordsWordRemindersQueries.create({
        user_word_id: clemencyUserWord.id,
        word_reminder_id: wordReminder.id,
      });
      await userWordsWordRemindersQueries.create({
        user_word_id: helloUserWord.id,
        word_reminder_id: wordReminder.id,
      });
      await userWordsWordRemindersQueries.create({
        user_word_id: milieuUserWord.id,
        word_reminder_id: wordReminder.id,
      });

      const wordReminderUserWords =
        await userWordsWordRemindersQueries.getByWordReminderId(
          wordReminder.id
        );
      expect(wordReminderUserWords).toEqual({
        id: 1,
        reminder: wordReminder.reminder,
        is_active: wordReminder.is_active,
        has_reminder_onload: wordReminder.has_reminder_onload,
        finish: wordReminder.finish,
        created_at: wordReminder.created_at,
        updated_at: wordReminder.updated_at,
        user_words: [
          {
            learned: clemencyUserWord.learned,
            id: clemencyUserWord.id,
            details: clemencyJson,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
          {
            learned: helloUserWord.learned,
            id: helloUserWord.id,
            details: helloJson,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
          {
            learned: milieuUserWord.learned,
            id: milieuUserWord.id,
            details: milieuJson,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
        ],
      });
    });
  });

  describe("getByUserId", () => {
    it("returns all of the word reminders", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json: helloJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create(userParams);
      const clemencyUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: clemencyWord.id,
        learned: false,
      });
      const helloUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: helloWord.id,
        learned: false,
      });
      const milieuUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: milieuWord.id,
        learned: false,
      });
      const wordReminder1 = await wordReminderQueries.create(
        wordReminderParams
      );
      const wordReminder2 = await wordReminderQueries.create({
        ...wordReminderParams,
        is_active: false,
      });
      const wordReminder3 = await wordReminderQueries.create({
        ...wordReminderParams,
        is_active: false,
      });

      await userWordsWordRemindersQueries.create({
        user_word_id: clemencyUserWord.id,
        word_reminder_id: wordReminder1.id,
      });

      await userWordsWordRemindersQueries.create({
        user_word_id: helloUserWord.id,
        word_reminder_id: wordReminder2.id,
      });

      await userWordsWordRemindersQueries.create({
        user_word_id: milieuUserWord.id,
        word_reminder_id: wordReminder3.id,
      });

      const result = await userWordsWordRemindersQueries.getByUserId(user!.id);

      expect(result).toEqual({
        wordReminders: [
          {
            id: 1,
            reminder: wordReminder1.reminder,
            is_active: wordReminder1.is_active,
            has_reminder_onload: wordReminder1.has_reminder_onload,
            finish: wordReminder1.finish,
            created_at: wordReminder1.created_at,
            updated_at: wordReminder1.updated_at,
            user_words: [
              {
                learned: clemencyUserWord.learned,
                id: clemencyUserWord.id,
                details: clemencyJson,
                created_at: expect.any(String),
                updated_at: expect.any(String),
              },
            ],
          },
          {
            id: 2,
            reminder: wordReminder2.reminder,
            is_active: wordReminder2.is_active,
            has_reminder_onload: wordReminder2.has_reminder_onload,
            finish: wordReminder2.finish,
            created_at: wordReminder2.created_at,
            updated_at: wordReminder2.updated_at,
            user_words: [
              {
                learned: helloUserWord.learned,
                id: helloUserWord.id,
                details: helloJson,
                created_at: expect.any(String),
                updated_at: expect.any(String),
              },
            ],
          },
          {
            id: 3,
            reminder: wordReminder3.reminder,
            is_active: wordReminder3.is_active,
            has_reminder_onload: wordReminder3.has_reminder_onload,
            finish: wordReminder3.finish,
            created_at: wordReminder3.created_at,
            updated_at: wordReminder3.updated_at,
            user_words: [
              {
                learned: milieuUserWord.learned,
                id: milieuUserWord.id,
                details: milieuJson,
                created_at: expect.any(String),
                updated_at: expect.any(String),
              },
            ],
          },
        ],
      });
    });

    describe("with options", () => {
      it("returns correct word reminders all queries are provided", async () => {
        const clemencyWord = await wordQueries.create({ json: clemencyJson });
        const helloWord = await wordQueries.create({ json: helloJson });
        const milieuWord = await wordQueries.create({ json: milieuJson });
        const user = await userQueries.create(userParams);
        const clemencyUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: clemencyWord.id,
          learned: false,
        });
        const helloUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: helloWord.id,
          learned: false,
        });
        const milieuUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: milieuWord.id,
          learned: false,
        });
        const wordReminder1 = await wordReminderQueries.create(
          wordReminderParams
        );
        const wordReminder2 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });
        const wordReminder3 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: wordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: wordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: wordReminder3.id,
        });

        const result = await userWordsWordRemindersQueries.getByUserId(
          user!.id,
          {
            page: 1,
            limit: 2,
            sort: {
              column: "created_at",
              direction: 1,
              table: "word_reminders",
            },
          }
        );

        expect(result).toEqual({
          next: {
            limit: 2,
            page: 2,
          },
          wordReminders: [
            {
              id: 1,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              created_at: wordReminder1.created_at,
              updated_at: wordReminder1.updated_at,
              user_words: [
                {
                  learned: clemencyUserWord.learned,
                  id: clemencyUserWord.id,
                  details: clemencyJson,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder2.reminder,
              is_active: wordReminder2.is_active,
              has_reminder_onload: wordReminder2.has_reminder_onload,
              finish: wordReminder2.finish,
              created_at: wordReminder2.created_at,
              updated_at: wordReminder2.updated_at,
              user_words: [
                {
                  learned: helloUserWord.learned,
                  id: helloUserWord.id,
                  details: helloJson,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                },
              ],
            },
          ],
        });
      });

      describe("page number and page limit query", () => {
        it("returns word reminders based on page and limit with a previous and next object", async () => {
          const clemencyWord = await wordQueries.create({ json: clemencyJson });
          const helloWord = await wordQueries.create({ json: helloJson });
          const milieuWord = await wordQueries.create({ json: milieuJson });
          const user = await userQueries.create(userParams);
          const clemencyUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: clemencyWord.id,
            learned: false,
          });
          const helloUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: helloWord.id,
            learned: false,
          });
          const milieuUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: milieuWord.id,
            learned: false,
          });
          const wordReminder1 = await wordReminderQueries.create(
            wordReminderParams
          );
          const wordReminder2 = await wordReminderQueries.create({
            ...wordReminderParams,
            is_active: false,
          });
          const wordReminder3 = await wordReminderQueries.create({
            ...wordReminderParams,
            is_active: false,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: clemencyUserWord.id,
            word_reminder_id: wordReminder1.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: helloUserWord.id,
            word_reminder_id: wordReminder2.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: milieuUserWord.id,
            word_reminder_id: wordReminder3.id,
          });

          const result = await userWordsWordRemindersQueries.getByUserId(
            user!.id,
            {
              page: 2,
              limit: 1,
            }
          );

          expect(result).toEqual({
            wordReminders: [
              {
                id: 2,
                reminder: wordReminder2.reminder,
                is_active: wordReminder2.is_active,
                has_reminder_onload: wordReminder2.has_reminder_onload,
                finish: wordReminder2.finish,
                created_at: wordReminder2.created_at,
                updated_at: wordReminder2.updated_at,
                user_words: [
                  {
                    learned: helloUserWord.learned,
                    id: helloUserWord.id,
                    details: helloJson,
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                  },
                ],
              },
            ],
            next: {
              page: 3,
              limit: 1,
            },
            previous: {
              page: 1,
              limit: 1,
            },
          });
        });

        it("returns user reminders based on page and limit with a previous object when there is no next page", async () => {
          const clemencyWord = await wordQueries.create({ json: clemencyJson });
          const helloWord = await wordQueries.create({ json: helloJson });
          const milieuWord = await wordQueries.create({ json: milieuJson });
          const user = await userQueries.create(userParams);
          const clemencyUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: clemencyWord.id,
            learned: false,
          });
          const helloUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: helloWord.id,
            learned: false,
          });
          const milieuUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: milieuWord.id,
            learned: false,
          });
          const wordReminder1 = await wordReminderQueries.create(
            wordReminderParams
          );
          const wordReminder2 = await wordReminderQueries.create({
            ...wordReminderParams,
            is_active: false,
          });
          const wordReminder3 = await wordReminderQueries.create({
            ...wordReminderParams,
            is_active: false,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: clemencyUserWord.id,
            word_reminder_id: wordReminder1.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: helloUserWord.id,
            word_reminder_id: wordReminder2.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: milieuUserWord.id,
            word_reminder_id: wordReminder3.id,
          });

          const result = await userWordsWordRemindersQueries.getByUserId(
            user!.id,
            {
              page: 2,
              limit: 2,
            }
          );

          expect(result).toEqual({
            wordReminders: [
              {
                id: 3,
                reminder: wordReminder3.reminder,
                is_active: wordReminder3.is_active,
                has_reminder_onload: wordReminder3.has_reminder_onload,
                finish: wordReminder3.finish,
                created_at: wordReminder3.created_at,
                updated_at: wordReminder3.updated_at,
                user_words: [
                  {
                    learned: milieuUserWord.learned,
                    id: milieuUserWord.id,
                    details: milieuJson,
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                  },
                ],
              },
            ],
            previous: {
              page: 1,
              limit: 2,
            },
          });
        });

        it("returns user words based on page and limit with a next object when there is no previous page", async () => {
          const clemencyWord = await wordQueries.create({ json: clemencyJson });
          const helloWord = await wordQueries.create({ json: helloJson });
          const milieuWord = await wordQueries.create({ json: milieuJson });
          const user = await userQueries.create(userParams);
          const clemencyUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: clemencyWord.id,
            learned: false,
          });
          const helloUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: helloWord.id,
            learned: false,
          });
          const milieuUserWord = await userWordQueries.create({
            user_id: user!.id,
            word_id: milieuWord.id,
            learned: false,
          });
          const wordReminder1 = await wordReminderQueries.create(
            wordReminderParams
          );
          const wordReminder2 = await wordReminderQueries.create({
            ...wordReminderParams,
            is_active: false,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: clemencyUserWord.id,
            word_reminder_id: wordReminder1.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: helloUserWord.id,
            word_reminder_id: wordReminder1.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: milieuUserWord.id,
            word_reminder_id: wordReminder2.id,
          });

          const result = await userWordsWordRemindersQueries.getByUserId(
            user!.id,
            {
              page: 1,
              limit: 1,
            }
          );

          expect(result).toEqual({
            wordReminders: [
              {
                id: 1,
                reminder: wordReminder1.reminder,
                is_active: wordReminder1.is_active,
                has_reminder_onload: wordReminder1.has_reminder_onload,
                finish: wordReminder1.finish,
                created_at: wordReminder1.created_at,
                updated_at: wordReminder1.updated_at,
                user_words: [
                  {
                    learned: clemencyUserWord.learned,
                    id: clemencyUserWord.id,
                    details: clemencyJson,
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                  },
                  {
                    learned: helloUserWord.learned,
                    id: helloUserWord.id,
                    details: helloJson,
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                  },
                ],
              },
            ],
            next: {
              page: 2,
              limit: 1,
            },
          });
        });
      });
    });

    describe("sort query", () => {
      it("returns word reminders in ascending order for when the word reminders were created", async () => {
        const clemencyWord = await wordQueries.create({ json: clemencyJson });
        const helloWord = await wordQueries.create({ json: helloJson });
        const milieuWord = await wordQueries.create({ json: milieuJson });
        const user = await userQueries.create(userParams);
        const clemencyUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: clemencyWord.id,
          learned: false,
        });
        const helloUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: helloWord.id,
          learned: false,
        });
        const milieuUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: milieuWord.id,
          learned: false,
        });
        const wordReminder1 = await wordReminderQueries.create(
          wordReminderParams
        );
        const wordReminder2 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });
        const wordReminder3 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: wordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: wordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: wordReminder3.id,
        });

        const result = await userWordsWordRemindersQueries.getByUserId(
          user!.id,
          {
            sort: {
              column: "created_at",
              direction: 1,
              table: "word_reminders",
            },
          }
        );

        expect(result).toEqual({
          wordReminders: [
            {
              id: 1,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              created_at: wordReminder1.created_at,
              updated_at: wordReminder1.updated_at,
              user_words: [
                {
                  learned: clemencyUserWord.learned,
                  id: clemencyUserWord.id,
                  details: clemencyJson,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder2.reminder,
              is_active: wordReminder2.is_active,
              has_reminder_onload: wordReminder2.has_reminder_onload,
              finish: wordReminder2.finish,
              created_at: wordReminder2.created_at,
              updated_at: wordReminder2.updated_at,
              user_words: [
                {
                  learned: helloUserWord.learned,
                  id: helloUserWord.id,
                  details: helloJson,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                },
              ],
            },
            {
              id: 3,
              reminder: wordReminder3.reminder,
              is_active: wordReminder3.is_active,
              has_reminder_onload: wordReminder3.has_reminder_onload,
              finish: wordReminder3.finish,
              created_at: wordReminder3.created_at,
              updated_at: wordReminder3.updated_at,
              user_words: [
                {
                  learned: milieuUserWord.learned,
                  id: milieuUserWord.id,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  details: milieuJson,
                },
              ],
            },
          ],
        });
      });

      it("returns word reminders in descending order for when the word reminders were created", async () => {
        const clemencyWord = await wordQueries.create({ json: clemencyJson });
        const helloWord = await wordQueries.create({ json: helloJson });
        const milieuWord = await wordQueries.create({ json: milieuJson });
        const user = await userQueries.create(userParams);
        const clemencyUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: clemencyWord.id,
          learned: false,
        });
        const helloUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: helloWord.id,
          learned: false,
        });
        const milieuUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: milieuWord.id,
          learned: false,
        });
        const wordReminder1 = await wordReminderQueries.create(
          wordReminderParams
        );
        const wordReminder2 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });
        const wordReminder3 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: wordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: wordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: wordReminder3.id,
        });

        const result = await userWordsWordRemindersQueries.getByUserId(
          user!.id,
          {
            sort: {
              column: "created_at",
              direction: -1,
              table: "word_reminders",
            },
          }
        );

        expect(result).toEqual({
          wordReminders: [
            {
              id: 3,
              reminder: wordReminder3.reminder,
              is_active: wordReminder3.is_active,
              has_reminder_onload: wordReminder3.has_reminder_onload,
              finish: wordReminder3.finish,
              created_at: wordReminder3.created_at,
              updated_at: wordReminder3.updated_at,
              user_words: [
                {
                  learned: milieuUserWord.learned,
                  id: milieuUserWord.id,
                  details: milieuJson,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder2.reminder,
              is_active: wordReminder2.is_active,
              has_reminder_onload: wordReminder2.has_reminder_onload,
              finish: wordReminder2.finish,
              created_at: wordReminder2.created_at,
              updated_at: wordReminder2.updated_at,
              user_words: [
                {
                  learned: helloUserWord.learned,
                  id: helloUserWord.id,
                  details: helloJson,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                },
              ],
            },
            {
              id: 1,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              created_at: wordReminder1.created_at,
              updated_at: wordReminder1.updated_at,
              user_words: [
                {
                  learned: clemencyUserWord.learned,
                  id: clemencyUserWord.id,
                  details: clemencyJson,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                },
              ],
            },
          ],
        });
      });

      it("returns word reminders in ascending order for when the word reminders were updated", async () => {
        const clemencyWord = await wordQueries.create({ json: clemencyJson });
        const helloWord = await wordQueries.create({ json: helloJson });
        const milieuWord = await wordQueries.create({ json: milieuJson });
        const user = await userQueries.create(userParams);
        const clemencyUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: clemencyWord.id,
          learned: false,
        });
        const helloUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: helloWord.id,
          learned: false,
        });
        const milieuUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: milieuWord.id,
          learned: false,
        });
        const wordReminder1 = await wordReminderQueries.create(
          wordReminderParams
        );
        const wordReminder2 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });
        const wordReminder3 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: wordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: wordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: wordReminder3.id,
        });

        const result = await userWordsWordRemindersQueries.getByUserId(
          user!.id,
          {
            sort: {
              column: "updated_at",
              direction: 1,
              table: "word_reminders",
            },
          }
        );

        expect(result).toEqual({
          wordReminders: [
            {
              id: 1,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              created_at: wordReminder1.created_at,
              updated_at: wordReminder1.updated_at,
              user_words: [
                {
                  learned: clemencyUserWord.learned,
                  id: clemencyUserWord.id,
                  details: clemencyJson,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder2.reminder,
              is_active: wordReminder2.is_active,
              has_reminder_onload: wordReminder2.has_reminder_onload,
              finish: wordReminder2.finish,
              created_at: wordReminder2.created_at,
              updated_at: wordReminder2.updated_at,
              user_words: [
                {
                  learned: helloUserWord.learned,
                  id: helloUserWord.id,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  details: helloJson,
                },
              ],
            },
            {
              id: 3,
              reminder: wordReminder3.reminder,
              is_active: wordReminder3.is_active,
              has_reminder_onload: wordReminder3.has_reminder_onload,
              finish: wordReminder3.finish,
              created_at: wordReminder3.created_at,
              updated_at: wordReminder3.updated_at,
              user_words: [
                {
                  learned: milieuUserWord.learned,
                  id: milieuUserWord.id,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  details: milieuJson,
                },
              ],
            },
          ],
        });
      });

      it("returns word reminders in descending order for when the word reminders were updated", async () => {
        const clemencyWord = await wordQueries.create({ json: clemencyJson });
        const helloWord = await wordQueries.create({ json: helloJson });
        const milieuWord = await wordQueries.create({ json: milieuJson });
        const user = await userQueries.create(userParams);
        const clemencyUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: clemencyWord.id,
          learned: false,
        });
        const helloUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: helloWord.id,
          learned: false,
        });
        const milieuUserWord = await userWordQueries.create({
          user_id: user!.id,
          word_id: milieuWord.id,
          learned: false,
        });
        const wordReminder1 = await wordReminderQueries.create(
          wordReminderParams
        );
        const wordReminder2 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });
        const wordReminder3 = await wordReminderQueries.create({
          ...wordReminderParams,
          is_active: false,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: wordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: wordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: wordReminder3.id,
        });

        const result = await userWordsWordRemindersQueries.getByUserId(
          user!.id,
          {
            sort: {
              column: "updated_at",
              direction: -1,
              table: "word_reminders",
            },
          }
        );

        expect(result).toEqual({
          wordReminders: [
            {
              id: 3,
              reminder: wordReminder3.reminder,
              is_active: wordReminder3.is_active,
              has_reminder_onload: wordReminder3.has_reminder_onload,
              finish: wordReminder3.finish,
              created_at: wordReminder3.created_at,
              updated_at: wordReminder3.updated_at,
              user_words: [
                {
                  details: milieuJson,
                  learned: milieuUserWord.learned,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  id: milieuUserWord.id,
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder2.reminder,
              is_active: wordReminder2.is_active,
              has_reminder_onload: wordReminder2.has_reminder_onload,
              finish: wordReminder2.finish,
              created_at: wordReminder2.created_at,
              updated_at: wordReminder2.updated_at,
              user_words: [
                {
                  details: helloJson,
                  learned: helloUserWord.learned,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  id: helloUserWord.id,
                },
              ],
            },
            {
              id: 1,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              created_at: wordReminder1.created_at,
              updated_at: wordReminder1.updated_at,
              user_words: [
                {
                  learned: clemencyUserWord.learned,
                  created_at: expect.any(String),
                  updated_at: expect.any(String),
                  id: clemencyUserWord.id,
                  details: clemencyJson,
                },
              ],
            },
          ],
        });
      });
    });
  });
});
