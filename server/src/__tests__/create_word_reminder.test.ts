import express from "express";
import request from "supertest";

import { create_word_reminder } from "../controllers/word_reminder_controller";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";
import { userWordQueries } from "../db/user_word_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { Order } from "common";

describe("create_word_reminder", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminder1 = {
    id: "1",
    user_id: sampleUser1.id,
    finish: new Date(Date.now() + 1000), // make sure date comes after current date
    reminder: "2 hours",
    is_active: true,
    has_reminder_onload: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const milieuWordId = "1";
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

  const clemencyWordId = "2";
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

  const helloWordId = "3";
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

  const userWord1 = {
    id: "1",
    user_id: sampleUser1.id,
    word_id: helloWordId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: "2",
    user_id: sampleUser1.id,
    word_id: clemencyWordId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord3 = {
    id: "3",
    user_id: sampleUser1.id,
    word_id: milieuWordId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWordsWordReminders1 = {
    id: "1",
    user_word_id: userWord1.id,
    word_reminder_id: wordReminder1.id,
  };

  const getUserWordsMock = jest
    .spyOn(userWordQueries, "getUserWords")
    .mockImplementation(async () => {
      return [
        { ...userWord1, ...clemencyJson },
        { ...userWord2, ...helloJson },
        { ...userWord3, ...milieuJson },
      ];
    });

  const wordReminderCreateMock = jest
    .spyOn(wordReminderQueries, "create")
    .mockImplementation(async () => {
      return wordReminder1;
    });

  const userWordsWordRemindersMock = jest
    .spyOn(userWordsWordRemindersQueries, "create")
    .mockImplementation(async () => {
      return userWordsWordReminders1;
    });

  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/wordReminders", create_word_reminder);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when 'auto' is true", () => {
    it("calls the functions to create the word reminder with the user words in it", async () => {
      const body = {
        auto: true,
        word_count: 7,
        is_active: false,
        has_reminder_onload: false,
        reminder: "1 week",
        duration: "1 week",
        has_learned_words: false,
        order: Order.Random,
      };

      const response = await request(app)
        .post(`/api/users/${sampleUser1.id}/wordReminders`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        wordReminder: {
          ...wordReminder1,
          finish: wordReminder1.finish.toISOString(),
          created_at: wordReminder1.created_at.toISOString(),
          updated_at: wordReminder1.updated_at.toISOString(),
        },
      });
      expect(getUserWordsMock).toHaveBeenCalledTimes(1);
      expect(getUserWordsMock).toHaveBeenCalledWith(sampleUser1.id, {
        count: body.word_count,
        learned: body.has_learned_words,
        order: body.order,
      });
      expect(wordReminderCreateMock).toHaveBeenCalledTimes(1);
      expect(wordReminderCreateMock).toHaveBeenCalledWith({
        user_id: sampleUser1.id,
        reminder: body.reminder,
        is_active: body.is_active,
        has_reminder_onload: body.has_reminder_onload,
        finish: expect.any(Date),
      });
      expect(userWordsWordRemindersMock).toHaveBeenCalledTimes(3);
      expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
        user_word_id: userWord1.id,
        word_reminder_id: wordReminder1.id,
      });
      expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
        user_word_id: userWord2.id,
        word_reminder_id: wordReminder1.id,
      });
      expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
        user_word_id: userWord3.id,
        word_reminder_id: wordReminder1.id,
      });
    });
  });

  describe("when 'auto' is false", () => {
    it("calls the functions to create the word reminder with the user words in it", async () => {
      const body = {
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        auto: false,
        user_words: [userWord1.id, userWord2.id, userWord3.id],
        is_active: false,
        has_reminder_onload: false,
        reminder: "1 week",
      };

      const response = await request(app)
        .post(`/api/users/${sampleUser1.id}/wordReminders`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        wordReminder: {
          ...wordReminder1,
          finish: wordReminder1.finish.toISOString(),
          created_at: wordReminder1.created_at.toISOString(),
          updated_at: wordReminder1.updated_at.toISOString(),
        },
      });
      expect(wordReminderCreateMock).toHaveBeenCalledTimes(1);
      expect(wordReminderCreateMock).toHaveBeenCalledWith({
        user_id: sampleUser1.id,
        reminder: body.reminder,
        is_active: body.is_active,
        has_reminder_onload: body.has_reminder_onload,
        finish: body.finish.toISOString(),
      });
      expect(userWordsWordRemindersMock).toHaveBeenCalledTimes(3);
      expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
        user_word_id: userWord1.id,
        word_reminder_id: wordReminder1.id,
      });
      expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
        user_word_id: userWord2.id,
        word_reminder_id: wordReminder1.id,
      });
      expect(userWordsWordRemindersMock).toHaveBeenCalledWith({
        user_word_id: userWord3.id,
        word_reminder_id: wordReminder1.id,
      });
    });
  });
});
