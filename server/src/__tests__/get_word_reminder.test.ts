import express from "express";
import request from "supertest";

import { get_word_reminder } from "../controllers/word_reminder_controller";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { userWordsWordRemindersQueries } from "../db/user_words_word_reminders_queries";

const app = express();
app.use(express.json());
app.get("/api/users/:userId/wordReminders/:wordReminderId", get_word_reminder);

const json = [
  {
    word: "hello",
    phonetics: [
      {
        audio:
          "https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=75797336",
        license: {
          name: "BY-SA 4.0",
          url: "https://creativecommons.org/licenses/by-sa/4.0",
        },
      },
      {
        text: "/həˈləʊ/",
        audio:
          "https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=9021983",
        license: {
          name: "BY 3.0 US",
          url: "https://creativecommons.org/licenses/by/3.0/us",
        },
      },
      {
        text: "/həˈloʊ/",
        audio: "",
      },
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: '"Hello!" or an equivalent greeting.',
            synonyms: [],
            antonyms: [],
          },
        ],
        synonyms: ["greeting"],
        antonyms: [],
      },
      {
        partOfSpeech: "verb",
        definitions: [
          {
            definition: 'To greet with "hello".',
            synonyms: [],
            antonyms: [],
          },
        ],
        synonyms: [],
        antonyms: [],
      },
      {
        partOfSpeech: "interjection",
        definitions: [
          {
            definition:
              "A greeting (salutation) said when meeting someone or acknowledging someone’s arrival or presence.",
            synonyms: [],
            antonyms: [],
            example: "Hello, everyone.",
          },
          {
            definition: "A greeting used when answering the telephone.",
            synonyms: [],
            antonyms: [],
            example: "Hello? How may I help you?",
          },
          {
            definition:
              "A call for response if it is not clear if anyone is present or listening, or if a telephone conversation may have been disconnected.",
            synonyms: [],
            antonyms: [],
            example: "Hello? Is anyone there?",
          },
          {
            definition:
              "Used sarcastically to imply that the person addressed or referred to has done something the speaker or writer considers to be foolish.",
            synonyms: [],
            antonyms: [],
            example:
              "You just tried to start your car with your cell phone. Hello?",
          },
          {
            definition: "An expression of puzzlement or discovery.",
            synonyms: [],
            antonyms: [],
            example: "Hello! What’s going on here?",
          },
        ],
        synonyms: [],
        antonyms: ["bye", "goodbye"],
      },
    ],
    license: {
      name: "CC BY-SA 3.0",
      url: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    sourceUrls: ["https://en.wiktionary.org/wiki/hello"],
  },
];

const userId = 1;
const wordReminder = {
  id: 1,
  user_id: userId,
  reminder: "* * * * *",
  is_active: true,
  has_reminder_onload: true,
  finish: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  created_at: new Date(),
  updated_at: new Date(),
};

const wordId1 = 1;
const word1 = {
  id: wordId1,
  details: json,
};
const wordId2 = 2;
const word2 = {
  id: wordId2,
  details: json,
};
const wordId3 = 3;
const word3 = {
  id: wordId3,
  details: json,
};

const userWord1 = {
  id: 1,
  user_id: userId,
  word_id: wordId1,
  learned: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const userWord2 = {
  id: 2,
  user_id: userId,
  word_id: wordId2,
  learned: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const userWord3 = {
  id: 3,
  user_id: userId,
  word_id: wordId3,
  learned: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const userWords = [userWord1, userWord2, userWord3];

describe("get_word_reminder", () => {
  const mockUserWordsWordReminderGetByWordReminderId = jest
    .spyOn(userWordsWordRemindersQueries, "getByWordReminderId")
    .mockResolvedValue({
      ...wordReminder,
      user_words: [
        {
          details: word1.details,
          learned: userWord1.learned,
        },
        {
          details: word2.details,
          learned: userWord2.learned,
        },
        {
          details: word3.details,
          learned: userWord3.learned,
        },
      ],
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("it gets a word reminder", async () => {
    const response = await request(app).get(
      `/api/users/${userId}/wordReminders/${wordReminder.id}`
    );

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      wordReminder: {
        ...wordReminder,
        user_words: [
          {
            details: word1.details,
            learned: userWord1.learned,
          },
          {
            details: word2.details,
            learned: userWord2.learned,
          },
          {
            details: word3.details,
            learned: userWord3.learned,
          },
        ],
        created_at: wordReminder.created_at.toISOString(),
        updated_at: wordReminder.updated_at.toISOString(),
        finish: wordReminder.finish.toISOString(),
      },
    });
    expect(mockUserWordsWordReminderGetByWordReminderId).toHaveBeenCalledTimes(
      1
    );
    expect(mockUserWordsWordReminderGetByWordReminderId).toHaveBeenCalledWith(
      wordReminder.id
    );
  });
});
