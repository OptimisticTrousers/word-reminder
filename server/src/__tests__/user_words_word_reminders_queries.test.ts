import { userQueries } from "../db/user_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { userWordQueries } from "../db/user_word_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { wordQueries } from "../db/word_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";
import { addToDateQueries } from "../db/add_to_date_queries";
import { addToDatesWordRemindersQueries } from "../db/add_to_dates_word_reminders_queries";

describe("userWordsWordRemindersQueries", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminder1 = {
    user_id: sampleUser1.id,
    finish: new Date(Date.UTC(95, 12, 17, 3, 24)),
    is_active: true,
    has_reminder_onload: true,
  };
  const reminder1 = {
    minutes: 0,
    hours: 1,
    days: 0,
    weeks: 0,
    months: 0,
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
        email: sampleUser1.email,
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
        email: sampleUser1.email,
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
        email: sampleUser1.email,
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
        email: sampleUser1.email,
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
        email: sampleUser1.email,
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
        email: sampleUser1.email,
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
        email: sampleUser1.email,
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
      const addToDate1 = await addToDateQueries.create(reminder1);
      await addToDatesWordRemindersQueries.create({
        word_reminder_id: newWordReminder1.id,
        reminder_id: addToDate1.id,
      });
      const newWordReminder2 = await wordReminderQueries.create(wordReminder1);
      const addToDate2 = await addToDateQueries.create(reminder1);
      await addToDatesWordRemindersQueries.create({
        word_reminder_id: newWordReminder2.id,
        reminder_id: addToDate2.id,
      });
      const newWordReminder3 = await wordReminderQueries.create(wordReminder1);
      const addToDate3 = await addToDateQueries.create(reminder1);
      await addToDatesWordRemindersQueries.create({
        word_reminder_id: newWordReminder3.id,
        reminder_id: addToDate3.id,
      });

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
            reminder: {
              minutes: reminder1.minutes,
              hours: reminder1.hours,
              days: reminder1.days,
              weeks: reminder1.weeks,
              months: reminder1.months,
            },
            is_active: wordReminder1.is_active,
            has_reminder_onload: wordReminder1.has_reminder_onload,
            finish: wordReminder1.finish,
            user_words: [
              {
                learned: false,
                details: clemencyJson,
              },
            ],
          },
          {
            id: 2,
            reminder: {
              minutes: reminder1.minutes,
              hours: reminder1.hours,
              days: reminder1.days,
              weeks: reminder1.weeks,
              months: reminder1.months,
            },
            is_active: wordReminder1.is_active,
            has_reminder_onload: wordReminder1.has_reminder_onload,
            finish: wordReminder1.finish,
            user_words: [
              {
                learned: false,
                details: helloJson,
              },
            ],
          },
          {
            id: 3,
            reminder: {
              minutes: reminder1.minutes,
              hours: reminder1.hours,
              days: reminder1.days,
              weeks: reminder1.weeks,
              months: reminder1.months,
            },
            is_active: wordReminder1.is_active,
            has_reminder_onload: wordReminder1.has_reminder_onload,
            finish: wordReminder1.finish,
            user_words: [
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
        email: sampleUser1.email,
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
          email: sampleUser1.email,
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
        const addToDate1 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder1.id,
          reminder_id: addToDate1.id,
        });
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate2 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder2.id,
          reminder_id: addToDate2.id,
        });
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate3 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder3.id,
          reminder_id: addToDate3.id,
        });

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
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
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
          email: sampleUser1.email,
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
            email: sampleUser1.email,
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
          const addToDate1 = await addToDateQueries.create(reminder1);
          await addToDatesWordRemindersQueries.create({
            word_reminder_id: newWordReminder1.id,
            reminder_id: addToDate1.id,
          });
          const newWordReminder2 = await wordReminderQueries.create(
            wordReminder1
          );
          const addToDate2 = await addToDateQueries.create(reminder1);
          await addToDatesWordRemindersQueries.create({
            word_reminder_id: newWordReminder2.id,
            reminder_id: addToDate2.id,
          });
          const newWordReminder3 = await wordReminderQueries.create(
            wordReminder1
          );
          const addToDate3 = await addToDateQueries.create(reminder1);
          await addToDatesWordRemindersQueries.create({
            word_reminder_id: newWordReminder3.id,
            reminder_id: addToDate3.id,
          });

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
                reminder: {
                  minutes: reminder1.minutes,
                  hours: reminder1.hours,
                  days: reminder1.days,
                  weeks: reminder1.weeks,
                  months: reminder1.months,
                },
                is_active: wordReminder1.is_active,
                has_reminder_onload: wordReminder1.has_reminder_onload,
                finish: wordReminder1.finish,
                user_words: [
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
            email: sampleUser1.email,
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
          const addToDate1 = await addToDateQueries.create(reminder1);
          await addToDatesWordRemindersQueries.create({
            word_reminder_id: newWordReminder1.id,
            reminder_id: addToDate1.id,
          });
          const newWordReminder2 = await wordReminderQueries.create(
            wordReminder1
          );
          const addToDate2 = await addToDateQueries.create(reminder1);
          await addToDatesWordRemindersQueries.create({
            word_reminder_id: newWordReminder2.id,
            reminder_id: addToDate2.id,
          });
          const newWordReminder3 = await wordReminderQueries.create(
            wordReminder1
          );
          const addToDate3 = await addToDateQueries.create(reminder1);
          await addToDatesWordRemindersQueries.create({
            word_reminder_id: newWordReminder3.id,
            reminder_id: addToDate3.id,
          });

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
                reminder: {
                  minutes: reminder1.minutes,
                  hours: reminder1.hours,
                  days: reminder1.days,
                  weeks: reminder1.weeks,
                  months: reminder1.months,
                },
                is_active: wordReminder1.is_active,
                has_reminder_onload: wordReminder1.has_reminder_onload,
                finish: wordReminder1.finish,
                user_words: [
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
            email: sampleUser1.email,
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
          const addToDate1 = await addToDateQueries.create(reminder1);
          await addToDatesWordRemindersQueries.create({
            word_reminder_id: newWordReminder1.id,
            reminder_id: addToDate1.id,
          });
          const newWordReminder2 = await wordReminderQueries.create(
            wordReminder1
          );
          const addToDate2 = await addToDateQueries.create(reminder1);
          await addToDatesWordRemindersQueries.create({
            word_reminder_id: newWordReminder2.id,
            reminder_id: addToDate2.id,
          });

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
                reminder: {
                  minutes: reminder1.minutes,
                  hours: reminder1.hours,
                  days: reminder1.days,
                  weeks: reminder1.weeks,
                  months: reminder1.months,
                },
                is_active: wordReminder1.is_active,
                has_reminder_onload: wordReminder1.has_reminder_onload,
                finish: wordReminder1.finish,
                user_words: [
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
          email: sampleUser1.email,
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
        const addToDate1 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder1.id,
          reminder_id: addToDate1.id,
        });
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate2 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder2.id,
          reminder_id: addToDate2.id,
        });
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate3 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder3.id,
          reminder_id: addToDate3.id,
        });

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
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 3,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
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
          email: sampleUser1.email,
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
        const addToDate1 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder1.id,
          reminder_id: addToDate1.id,
        });
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate2 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder2.id,
          reminder_id: addToDate2.id,
        });
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate3 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder3.id,
          reminder_id: addToDate3.id,
        });

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
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: milieuJson,
                },
              ],
            },
            {
              id: 2,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 1,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
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
          email: sampleUser1.email,
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
        const addToDate1 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder1.id,
          reminder_id: addToDate1.id,
        });
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate2 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder2.id,
          reminder_id: addToDate2.id,
        });
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate3 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder3.id,
          reminder_id: addToDate3.id,
        });

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
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: clemencyJson,
                },
              ],
            },
            {
              id: 2,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 3,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
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
          email: sampleUser1.email,
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
        const addToDate1 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder1.id,
          reminder_id: addToDate1.id,
        });
        const newWordReminder2 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate2 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder2.id,
          reminder_id: addToDate2.id,
        });
        const newWordReminder3 = await wordReminderQueries.create(
          wordReminder1
        );
        const addToDate3 = await addToDateQueries.create(reminder1);
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: newWordReminder3.id,
          reminder_id: addToDate3.id,
        });

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
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: milieuJson,
                },
              ],
            },
            {
              id: 2,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
                {
                  learned: false,
                  details: helloJson,
                },
              ],
            },
            {
              id: 1,
              reminder: {
                minutes: reminder1.minutes,
                hours: reminder1.hours,
                days: reminder1.days,
                weeks: reminder1.weeks,
                months: reminder1.months,
              },
              is_active: wordReminder1.is_active,
              has_reminder_onload: wordReminder1.has_reminder_onload,
              finish: wordReminder1.finish,
              user_words: [
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
});
