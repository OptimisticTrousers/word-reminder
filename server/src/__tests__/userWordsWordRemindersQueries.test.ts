import { UserQueries } from "../db/userQueries";
import { UserWordQueries } from "../db/userWordQueries";
import { UserWordsWordRemindersQueries } from "../db/userWordsWordRemindersQueries";
import { WordQueries } from "../db/wordQueries";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("userWordsWordRemindersQueries", () => {
  const userQueries = new UserQueries();
  const userWordQueries = new UserWordQueries();
  const wordQueries = new WordQueries();
  const userWordsWordRemindersQueries = new UserWordsWordRemindersQueries();

  const sampleUser1 = {
    id: "1",
    username: "username",
    password: "password",
  };

  const json = [
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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });

      const userWord = await userWordQueries.create({
        userId: newUser!.id,
        wordId: newWord.id,
        learned: false,
      });
      // await userWordsWordRemindersQueries.create({
      //   userId: newUser?.id,
      //   wor,
      // });
    });

    it(
      "returns the user words word reminders if the junction table was already created"
    );
  });

  describe("deleteAllByUserId", () => {
    it("deletes all of the user's user words word reminders");
    it("does not fail if the user has no user words word reminders");
  });
});
