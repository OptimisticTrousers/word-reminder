import { UserQueries } from "../db/userQueries";
import { UserWordQueries } from "../db/userWordQueries";
import { UserWordsWordRemindersQueries } from "../db/userWordsWordRemindersQueries";
import { WordReminderQueries } from "../db/wordReminderQueries";
import { WordReminderQueries } from "../db/wordReminderQueries";
import { WordQueries } from "../db/wordQueries";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("userWordsWordRemindersQueries", () => {
  const userQueries = new UserQueries();
  const userWordQueries = new UserWordQueries();
  const wordQueries = new WordQueries();
  const wordReminderQueries = new WordReminderQueries();
  const wordReminderQueries = new WordReminderQueries();
  const userWordsWordRemindersQueries = new UserWordsWordRemindersQueries();

  const sampleUser1 = {
    id: "1",
    username: "username",
    password: "password",
  };

  const wordReminder1 = {
    user_id: sampleUser1.id,
    finish: new Date(),
    reminder: "every 2 hours",
    is_active: true,
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
  const wordReminder1 = {
    user_id: sampleUser1.id,
    finish: new Date(),
    reminder: "every 2 hours",
    is_active: true,
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
      origin:
        "early 19th century: variant of earlier hollo ; related to holla.",
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

  describe("create", () => {
    it("creates the junction table", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json: helloJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
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
      const wordReminder = await wordReminderQueries.create(wordReminder1);

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
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
      const userWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: helloWord.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);
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

  describe("deleteAllByUserId", () => {
    it("deletes all of the user's user words word reminders", async () => {
      const word = await wordQueries.create({ json: helloJson });
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
      const userWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: word.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);
      await userWordsWordRemindersQueries.create({
        user_word_id: userWord.id,
        word_reminder_id: wordReminder.id,
      });

      const deletedUserWordsWordReminders =
        await userWordsWordRemindersQueries.deleteAllByUserId(user!.id);

      expect(deletedUserWordsWordReminders).toEqual([
        {
          id: 1,
          user_word_id: userWord.id,
          word_reminder_id: wordReminder.id,
        },
      ]);
    });

    it("returns undefined if the user has no user words word reminders", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json: helloJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
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
      const wordReminder = await wordReminderQueries.create(wordReminder1);

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
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
      const userWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: helloWord.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);
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

  describe("deleteAllByUserId", () => {
    it("deletes all of the user's user words word reminders", async () => {
      const word = await wordQueries.create({ json: helloJson });
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
      const userWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: word.id,
        learned: false,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);
      await userWordsWordRemindersQueries.create({
        user_word_id: userWord.id,
        word_reminder_id: wordReminder.id,
      });

      const deletedUserWordsWordReminders =
        await userWordsWordRemindersQueries.deleteAllByUserId(user!.id);

      expect(deletedUserWordsWordReminders).toEqual([
        {
          id: 1,
          user_word_id: userWord.id,
          word_reminder_id: wordReminder.id,
        },
      ]);
    });

    it("returns undefined if the user has no user words word reminders", async () => {
      const newUser = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });

      const deletedUserWordsWordReminders =
        await userWordsWordRemindersQueries.deleteAllByUserId(newUser!.id);

      expect(deletedUserWordsWordReminders).toEqual([]);
    });
  });

  describe("deleteAllByWordReminderId", () => {
    it("deletes all of the words in a user's word reminder", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json: helloJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
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
      const newWordReminder = await wordReminderQueries.create(wordReminder1);

      const userWordsWordReminders1 =
        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: newWordReminder.id,
        });
      const userWordsWordReminders2 =
        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: newWordReminder.id,
        });
      const userWordsWordReminders3 =
        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: newWordReminder.id,
        });

      const wordReminders =
        await userWordsWordRemindersQueries.deleteAllByWordReminderId(
          newWordReminder.id
        );
      expect(wordReminders).toEqual([
        userWordsWordReminders1,
        userWordsWordReminders2,
        userWordsWordReminders3,
      ]);
    });

    it("returns undefined if the user's word reminder has no words", async () => {
      await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
      const newWordReminder = await wordReminderQueries.create(wordReminder1);

      const wordReminders =
        await userWordsWordRemindersQueries.deleteAllByWordReminderId(
          newWordReminder.id
        );

      expect(wordReminders).toEqual([]);
    });
  });

  describe("getByUserId", () => {
    it("returns all of the word reminders", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json: helloJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
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
      const newWordReminder1 = await wordReminderQueries.create(wordReminder1);
      const newWordReminder2 = await wordReminderQueries.create(wordReminder1);
      const newWordReminder3 = await wordReminderQueries.create(wordReminder1);

      await userWordsWordRemindersQueries.create({
        user_word_id: clemencyUserWord.id,
        word_reminder_id: newWordReminder1.id,
      });

      await userWordsWordRemindersQueries.create({
        user_word_id: helloUserWord.id,
        word_reminder_id: newWordReminder2.id,
      });

      await userWordsWordRemindersQueries.create({
        user_word_id: milieuUserWord.id,
        word_reminder_id: newWordReminder3.id,
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
            words: [
              {
                learned: false,
                details: clemencyJson,
              },
            ],
          },
          {
            id: 2,
            reminder: wordReminder1.reminder,
            is_active: wordReminder1.is_active,
            has_reminder_onload: wordReminder1.has_reminder_onload,
            finish: wordReminder1.finish,
            words: [
              {
                learned: false,
                details: helloJson,
              },
            ],
          },
          {
            id: 3,
            reminder: wordReminder1.reminder,
            is_active: wordReminder1.is_active,
            has_reminder_onload: wordReminder1.has_reminder_onload,
            finish: wordReminder1.finish,
            words: [
              {
                learned: false,
                details: milieuJson,
              },
            ],
          },
        ],
      });
    });

    it("returns an empty list if the user has no word reminders", async () => {
      const user = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });

      const result = await userWordsWordRemindersQueries.getByUserId(user!.id);

      expect(result).toEqual({
        wordReminders: [],
      });
    });

    describe("with options", () => {
      it("returns correct word reminders all queries are provided", async () => {
        const clemencyWord = await wordQueries.create({ json: clemencyJson });
        const helloWord = await wordQueries.create({ json: helloJson });
        const milieuWord = await wordQueries.create({ json: milieuJson });
        const user = await userQueries.create({
          username: sampleUser1.username,
          password: sampleUser1.password,
        });
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
        const newWordReminder1 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: newWordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: newWordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: newWordReminder3.id,
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
              words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
          ],
        });
      });

      it("returns an empty list of rows if the user has no word reminders", async () => {
        const newUser = await userQueries.create({
          username: sampleUser1.username,
          password: sampleUser1.password,
        });

        const result = await userWordsWordRemindersQueries.getByUserId(
          newUser!.id
        );

        expect(result).toEqual({
          wordReminders: [],
        });
      });

      describe("page number and page limit query", () => {
        it("returns word reminders based on page and limit with a previous and next object", async () => {
          const clemencyWord = await wordQueries.create({ json: clemencyJson });
          const helloWord = await wordQueries.create({ json: helloJson });
          const milieuWord = await wordQueries.create({ json: milieuJson });
          const user = await userQueries.create({
            username: sampleUser1.username,
            password: sampleUser1.password,
          });
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
          const newWordReminder1 = await wordReminderQueries.create(
            wordReminder1
          );
          const newWordReminder2 = await wordReminderQueries.create(
            wordReminder1
          );
          const newWordReminder3 = await wordReminderQueries.create(
            wordReminder1
          );

          await userWordsWordRemindersQueries.create({
            user_word_id: clemencyUserWord.id,
            word_reminder_id: newWordReminder1.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: helloUserWord.id,
            word_reminder_id: newWordReminder2.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: milieuUserWord.id,
            word_reminder_id: newWordReminder3.id,
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
                reminder: wordReminder1.reminder,
                is_active: wordReminder1.is_active,
                has_reminder_onload: wordReminder1.has_reminder_onload,
                finish: wordReminder1.finish,
                words: [
                  {
                    learned: false,
                    details: helloJson,
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
          const user = await userQueries.create({
            username: sampleUser1.username,
            password: sampleUser1.password,
          });
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
          const newWordReminder1 = await wordReminderQueries.create(
            wordReminder1
          );
          const newWordReminder2 = await wordReminderQueries.create(
            wordReminder1
          );
          const newWordReminder3 = await wordReminderQueries.create(
            wordReminder1
          );

          await userWordsWordRemindersQueries.create({
            user_word_id: clemencyUserWord.id,
            word_reminder_id: newWordReminder1.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: helloUserWord.id,
            word_reminder_id: newWordReminder2.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: milieuUserWord.id,
            word_reminder_id: newWordReminder3.id,
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
                reminder: wordReminder1.reminder,
                is_active: wordReminder1.is_active,
                has_reminder_onload: wordReminder1.has_reminder_onload,
                finish: wordReminder1.finish,
                words: [
                  {
                    learned: false,
                    details: milieuJson,
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
          const user = await userQueries.create({
            username: sampleUser1.username,
            password: sampleUser1.password,
          });
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
          const newWordReminder1 = await wordReminderQueries.create(
            wordReminder1
          );
          const newWordReminder2 = await wordReminderQueries.create(
            wordReminder1
          );

          await userWordsWordRemindersQueries.create({
            user_word_id: clemencyUserWord.id,
            word_reminder_id: newWordReminder1.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: helloUserWord.id,
            word_reminder_id: newWordReminder1.id,
          });

          await userWordsWordRemindersQueries.create({
            user_word_id: milieuUserWord.id,
            word_reminder_id: newWordReminder2.id,
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
                words: [
                  {
                    learned: false,
                    details: clemencyJson,
                  },
                  {
                    learned: false,
                    details: helloJson,
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
        const user = await userQueries.create({
          username: sampleUser1.username,
          password: sampleUser1.password,
        });
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
        const newWordReminder1 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: newWordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: newWordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: newWordReminder3.id,
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
              words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 3,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
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
        const user = await userQueries.create({
          username: sampleUser1.username,
          password: sampleUser1.password,
        });
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
        const newWordReminder1 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: newWordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: newWordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: newWordReminder3.id,
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
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: milieuJson,
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 1,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: clemencyJson,
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
        const user = await userQueries.create({
          username: sampleUser1.username,
          password: sampleUser1.password,
        });
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
        const newWordReminder1 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: newWordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: newWordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: newWordReminder3.id,
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
              words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 3,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
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
        const user = await userQueries.create({
          username: sampleUser1.username,
          password: sampleUser1.password,
        });
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
        const newWordReminder1 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );

        await userWordsWordRemindersQueries.create({
          user_word_id: clemencyUserWord.id,
          word_reminder_id: newWordReminder1.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: helloUserWord.id,
          word_reminder_id: newWordReminder2.id,
        });

        await userWordsWordRemindersQueries.create({
          user_word_id: milieuUserWord.id,
          word_reminder_id: newWordReminder3.id,
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
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: milieuJson,
                },
              ],
            },
            {
              id: 2,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 1,
              reminder: wordReminder1.reminder,
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
          ],
        });
      });
    });
  });

  // describe("autoCreate", () => {
  //   it("automatically creates word reminder", async () => {
  //     const clemencyWord = await wordQueries.create({ json: clemencyJson });
  //     const milieuWord = await wordQueries.create({ json: milieuJson });
  //     const helloWord = await wordQueries.create({ json: helloJson });
  //     const newUser = await userQueries.create({
  //       username: sampleUser1.username,
  //       password: sampleUser1.password,
  //     });
  //     await userWordQueries.create({
  //       user_id: newUser!.id,
  //       word_id: helloWord.id,
  //       learned: false,
  //     });
  //     await userWordQueries.create({
  //       user_id: newUser!.id,
  //       word_id: clemencyWord.id,
  //       learned: false,
  //     });
  //     await userWordQueries.create({
  //       user_id: newUser!.id,
  //       word_id: milieuWord.id,
  //       learned: false,
  //     });

  //     const autoWordReminder = {
  //       userId: sampleUser1.id,
  //       wordCount: 3,
  //       hasLearnedWords: false,
  //       isActive: false,
  //       reminder: "2 hours",
  //       hasReminderOnload: true,
  //       duration: "1 week",
  //     };
  //     await userWordsWordRemindersQueries.autoCreate(autoWordReminder);

  //     const result = await userWordsWordRemindersQueries.getByUserId(
  //       newUser!.id
  //     );
  //     const wordReminder = result.userWords[0];
  //     const createdAtTimestamp = new Date(wordReminder!.created_at).getTime();
  //     const updatedAtTimestamp = new Date(wordReminder!.updated_at).getTime();
  //     const nowTimestamp = Date.now();
  //     expect(result).toEqual({
  //       wordReminder: {
  //         reminder: autoWordReminder.reminder,
  //         is_active: autoWordReminder.isActive,
  //         has_reminder_onload: autoWordReminder.hasReminderOnload,
  //         finish: expect.any(Date),
  //       },
  //       userWords: [
  //         {
  //           id: 1,
  //           word_id: Number(helloWord.id),
  //           learned: false,
  //           details: helloJson,
  //           created_at: expect.any(Date),
  //           updated_at: expect.any(Date),
  //         },
  //         {
  //           id: 2,
  //           word_id: Number(clemencyWord.id),
  //           learned: false,
  //           details: clemencyJson,
  //           created_at: expect.any(Date),
  //           updated_at: expect.any(Date),
  //         },
  //         {
  //           id: 3,
  //           word_id: Number(milieuWord.id),
  //           learned: false,
  //           details: milieuWord,
  //           created_at: expect.any(Date),
  //           updated_at: expect.any(Date),
  //         },
  //       ],
  //     });
  //     expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
  //     expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
  //     expect(
  //       Math.abs(nowTimestamp + 7 * 24 * 60 * 60 * 1000 - nowTimestamp)
  //     ).toBeLessThan(1000); // one week from now
  //   });
  // });
});
