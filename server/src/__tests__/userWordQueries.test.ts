import { UserQueries } from "../db/userQueries";
import { UserWord, UserWordQueries } from "../db/userWordQueries";
import { Word, WordQueries } from "../db/wordQueries";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("userWordQueries", () => {
  const userQueries = new UserQueries();
  const userWordQueries = new UserWordQueries();
  const wordQueries = new WordQueries();

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
    it("creates user word", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );

      const userWord = await userWordQueries.create(newUser!.id, newWord.id);

      const createdAtTimestamp = new Date(userWord!.created_at).getTime();
      const updatedAtTimestamp = new Date(userWord!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(userWord).toEqual({
        id: 1,
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("creates a user word with the learned property of true", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );

      const userWord = await userWordQueries.create(
        newUser!.id,
        newWord.id,
        true
      );

      const createdAtTimestamp = new Date(userWord!.created_at).getTime();
      const updatedAtTimestamp = new Date(userWord!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(userWord).toEqual({
        id: 1,
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("does nothing when the user word already exists", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.create(newUser!.id, newWord.id);

      const userWord = await userWordQueries.create(newUser!.id, newWord.id);

      const createdAtTimestamp = new Date(userWord!.created_at).getTime();
      const updatedAtTimestamp = new Date(userWord!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(userWord).toEqual({
        id: 1,
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("setLearned", () => {
    it("changes the learned property on the user word to true", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.create(newUser!.id, newWord.id);

      // Set the 'learned' property to true since it is false by default
      await userWordQueries.setLearned(newUser!.id, newWord.id, true);

      const userWord = await userWordQueries.get(newUser!.id, newWord.id);
      const createdAtTimestamp = new Date(userWord!.created_at).getTime();
      const updatedAtTimestamp = new Date(userWord!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(userWord).toEqual({
        id: 1,
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("changes the learned property on the user word to false if already set to true", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.create(newUser!.id, newWord.id, true);

      // Set the 'learned' property to true since it is false by default
      await userWordQueries.setLearned(newUser!.id, newWord.id, false);

      const userWord = await userWordQueries.get(newUser!.id, newWord.id);
      const createdAtTimestamp = new Date(userWord!.created_at).getTime();
      const updatedAtTimestamp = new Date(userWord!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(userWord).toEqual({
        id: 1,
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("getByUserId", () => {
    it("gets the user word by user ID", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.create(newUser!.id, newWord.id);

      const result = await userWordQueries.getByUserId(newUser!.id);

      const userWord = result.userWords[0];
      const createdAtTimestamp = new Date(userWord!.created_at).getTime();
      const updatedAtTimestamp = new Date(userWord!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(result).toEqual({
        userWords: [
          {
            id: 1,
            details: json,
            user_id: newUser!.id,
            word_id: newWord.id,
            learned: false,
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
          },
        ],
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns an empty list of rows if the user has no user words", async () => {
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );

      const result = await userWordQueries.getByUserId(newUser!.id);

      expect(result).toEqual({
        userWords: [],
      });
    });

    describe("with options", () => {
      let milieuWord: Word | undefined = undefined;
      let clemencyWord: Word | undefined = undefined;
      let concomitantlyWord: Word | undefined = undefined;
      let sanguineWord: Word | undefined = undefined;
      let expropriationWord: Word | undefined = undefined;
      let admonitionWord: Word | undefined = undefined;
      let ignobleWord: Word | undefined = undefined;
      let dithyrambicWord: Word | undefined = undefined;
      let admonishWord: Word | undefined = undefined;

      let milieuUserWord: UserWord | undefined = undefined;
      let clemencyUserWord: UserWord | undefined = undefined;
      let concomitantlyUserWord: UserWord | undefined = undefined;
      let sanguineUserWord: UserWord | undefined = undefined;
      let expropriationUserWord: UserWord | undefined = undefined;
      let admonitionUserWord: UserWord | undefined = undefined;
      let ignobleUserWord: UserWord | undefined = undefined;
      let dithyrambicUserWord: UserWord | undefined = undefined;
      let admonishUserWord: UserWord | undefined = undefined;
      beforeEach(async () => {
        const newUser = await userQueries.create(
          sampleUser1.username,
          sampleUser1.password
        );
        milieuWord = await wordQueries.create([
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
        ]);
        clemencyWord = await wordQueries.create([
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
        ]);
        concomitantlyWord = await wordQueries.create([
          {
            word: "concomitantly",
            meanings: [
              {
                partOfSpeech: "adverb",
                definitions: [
                  { definition: "At the same time; simultaneously." },
                ],
              },
            ],
            phonetics: [],
          },
        ]);
        sanguineWord = await wordQueries.create([
          {
            word: "sanguine",
            meanings: [
              {
                partOfSpeech: "adjective",
                definitions: [
                  {
                    definition:
                      "Optimistic or positive, especially in an apparently bad or difficult situation.",
                  },
                ],
              },
            ],
            phonetics: [],
          },
        ]);
        expropriationWord = await wordQueries.create([
          {
            word: "expropriation",
            meanings: [
              {
                partOfSpeech: "noun",
                definitions: [
                  {
                    definition:
                      "The action of taking property from its owner for public use or benefit.",
                  },
                ],
              },
            ],
            phonetics: [],
          },
        ]);
        admonitionWord = await wordQueries.create([
          {
            word: "admonition",
            meanings: [
              {
                partOfSpeech: "noun",
                definitions: [{ definition: "A warning or reprimand." }],
              },
            ],
            phonetics: [],
          },
        ]);
        ignobleWord = await wordQueries.create([
          {
            word: "ignoble",
            meanings: [
              {
                partOfSpeech: "adjective",
                definitions: [
                  { definition: "Not honorable in character or purpose." },
                ],
              },
            ],
            phonetics: [],
          },
        ]);
        dithyrambicWord = await wordQueries.create([
          {
            word: "dithyrambic",
            meanings: [
              {
                partOfSpeech: "adjective",
                definitions: [
                  { definition: "Wildly enthusiastic or excited." },
                ],
              },
            ],
            phonetics: [],
          },
        ]);
        admonishWord = await wordQueries.create([
          {
            word: "admonish",
            meanings: [
              {
                partOfSpeech: "verb",
                definitions: [
                  { definition: "To warn or reprimand someone firmly." },
                ],
              },
            ],
            phonetics: [],
          },
        ]);
        milieuUserWord = await userWordQueries.create(
          newUser!.id,
          milieuWord.id,
          false
        );
        clemencyUserWord = await userWordQueries.create(
          newUser!.id,
          clemencyWord.id,
          true
        );
        concomitantlyUserWord = await userWordQueries.create(
          newUser!.id,
          concomitantlyWord.id,
          false
        );
        sanguineUserWord = await userWordQueries.create(
          newUser!.id,
          sanguineWord.id,
          true
        );
        expropriationUserWord = await userWordQueries.create(
          newUser!.id,
          expropriationWord.id,
          false
        );
        admonitionUserWord = await userWordQueries.create(
          newUser!.id,
          admonitionWord.id,
          true
        );
        ignobleUserWord = await userWordQueries.create(
          newUser!.id,
          ignobleWord.id,
          false
        );
        dithyrambicUserWord = await userWordQueries.create(
          newUser!.id,
          dithyrambicWord.id,
          true
        );
        admonishUserWord = await userWordQueries.create(
          newUser!.id,
          admonishWord.id,
          false
        );
      });

      it("returns all of the user's user words when no queries are provided", async () => {
        const result = await userWordQueries.getByUserId(sampleUser1.id);

        expect(result).toEqual({
          next: {
            page: 2,
            limit: 8, // default limit
          },
          userWords: [
            { ...milieuWord, ...milieuUserWord },
            { ...clemencyWord, ...clemencyUserWord },
            { ...concomitantlyWord, ...concomitantlyUserWord },
            { ...sanguineWord, ...sanguineUserWord },
            { ...expropriationWord, ...expropriationUserWord },
            { ...admonitionWord, ...admonitionUserWord },
            { ...ignobleWord, ...ignobleUserWord },
            { ...dithyrambicWord, ...dithyrambicUserWord },
            { ...admonishWord, ...admonishUserWord },
          ],
        });
      });

      it("returns correct user words when all queries are provided", async () => {
        const result = await userWordQueries.getByUserId(sampleUser1.id, {
          learned: true,
          sort: { column: "created_at", table: "user_words", direction: 1 },
          search: "ad",
          page: 1,
          limit: 2,
        });

        expect(result).toEqual({
          userWords: [{ ...admonitionWord, ...admonitionUserWord }],
        });
      });

      describe("learned query", () => {
        it("returns user words that are learned", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            learned: true,
          });

          expect(result).toEqual({
            userWords: [
              { ...clemencyWord, ...clemencyUserWord },
              { ...sanguineWord, ...sanguineUserWord },
              { ...admonitionWord, ...admonitionUserWord },
              { ...dithyrambicWord, ...dithyrambicUserWord },
            ],
          });
        });

        it("returns user words that are not learned", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            learned: false,
          });

          expect(result).toEqual({
            userWords: [
              { ...milieuWord, ...milieuUserWord },
              { ...concomitantlyWord, ...concomitantlyUserWord },
              { ...expropriationWord, ...expropriationUserWord },
              { ...ignobleWord, ...ignobleUserWord },
              { ...admonishWord, ...admonishUserWord },
            ],
          });
        });
      });

      describe("sort query", () => {
        it("returns words in alphabetically ascending order", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            sort: { table: "words", column: "details", direction: 1 },
          });

          expect(result).toEqual({
            next: {
              page: 2,
              limit: 8, // default limit
            },
            userWords: [
              { ...admonishWord, ...admonishUserWord },
              { ...admonitionWord, ...admonitionUserWord },
              { ...clemencyWord, ...clemencyUserWord },
              { ...concomitantlyWord, ...concomitantlyUserWord },
              { ...dithyrambicWord, ...dithyrambicUserWord },
              { ...expropriationWord, ...expropriationUserWord },
              { ...ignobleWord, ...ignobleUserWord },
              { ...milieuWord, ...milieuUserWord },
              { ...sanguineWord, ...sanguineUserWord },
            ],
          });
        });

        it("returns words in alphabetically descending order", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            sort: { table: "words", column: "details", direction: -1 },
          });

          expect(result).toEqual({
            next: {
              page: 2,
              limit: 8, // default limit
            },
            userWords: [
              { ...sanguineWord, ...sanguineUserWord },
              { ...milieuWord, ...milieuUserWord },
              { ...ignobleWord, ...ignobleUserWord },
              { ...expropriationWord, ...expropriationUserWord },
              { ...dithyrambicWord, ...dithyrambicUserWord },
              { ...concomitantlyWord, ...concomitantlyUserWord },
              { ...clemencyWord, ...clemencyUserWord },
              { ...admonitionWord, ...admonitionUserWord },
              { ...admonishWord, ...admonishUserWord },
            ],
          });
        });

        it("returns user words in ascending order for when the user words were created", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            sort: { table: "user_words", column: "created_at", direction: 1 },
          });

          expect(result).toEqual({
            next: {
              page: 2,
              limit: 8, // default limit
            },
            userWords: [
              { ...milieuWord, ...milieuUserWord },
              { ...clemencyWord, ...clemencyUserWord },
              { ...concomitantlyWord, ...concomitantlyUserWord },
              { ...sanguineWord, ...sanguineUserWord },
              { ...expropriationWord, ...expropriationUserWord },
              { ...admonitionWord, ...admonitionUserWord },
              { ...ignobleWord, ...ignobleUserWord },
              { ...dithyrambicWord, ...dithyrambicUserWord },
              { ...admonishWord, ...admonishUserWord },
            ],
          });
        });

        it("returns user words in descending order for when the user words were created", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            sort: {
              table: "user_words",
              column: "created_at",
              direction: -1,
            },
          });

          expect(result).toEqual({
            next: {
              limit: 8,
              page: 2,
            },
            userWords: [
              { ...admonishWord, ...admonishUserWord },
              { ...dithyrambicWord, ...dithyrambicUserWord },
              { ...ignobleWord, ...ignobleUserWord },
              { ...admonitionWord, ...admonitionUserWord },
              { ...expropriationWord, ...expropriationUserWord },
              { ...sanguineWord, ...sanguineUserWord },
              { ...concomitantlyWord, ...concomitantlyUserWord },
              { ...clemencyWord, ...clemencyUserWord },
              { ...milieuWord, ...milieuUserWord },
            ],
          });
        });
      });

      describe("search query", () => {
        it("returns user words that the user searches for", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            search: "mil",
          });

          expect(result).toEqual({
            userWords: [{ ...milieuWord, ...milieuUserWord }],
          });
        });

        it("returns user words that the user searches for when the search query is uppercase", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            search: "MIL",
          });

          expect(result).toEqual({
            userWords: [{ ...milieuWord, ...milieuUserWord }],
          });
        });

        it("returns no user words when the search contains no results", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            search: "no results",
          });

          expect(result).toEqual({
            userWords: [],
          });
        });
      });

      describe("page number and page limit query", () => {
        it("returns user words based on page and limit with a previous and next object", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            page: 2,
            limit: 2,
          });

          expect(result).toEqual({
            next: {
              page: 3,
              limit: 2,
            },
            previous: {
              page: 1,
              limit: 2,
            },
            userWords: [
              { ...concomitantlyWord, ...concomitantlyUserWord },
              { ...sanguineWord, ...sanguineUserWord },
            ],
          });
        });

        it("returns user words based on page and limit with a previous object when there is no next page", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            page: 5,
            limit: 2,
          });

          expect(result).toEqual({
            previous: {
              page: 4,
              limit: 2,
            },
            userWords: [{ ...admonishWord, ...admonishUserWord }],
          });
        });

        it("returns user words based on page and limit with a next object when there is no previous page", async () => {
          const result = await userWordQueries.getByUserId(sampleUser1.id, {
            page: 1,
            limit: 2,
          });

          expect(result).toEqual({
            next: {
              page: 2,
              limit: 2,
            },
            userWords: [
              { ...milieuWord, ...milieuUserWord },
              { ...clemencyWord, ...clemencyUserWord },
            ],
          });
        });
      });
    });
  });

  describe("get", () => {
    it("gets the user word by user and word IDs", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.create(newUser!.id, newWord.id);

      const userWord = await userWordQueries.get(newUser!.id, newWord.id);

      const createdAtTimestamp = new Date(userWord!.created_at).getTime();
      const updatedAtTimestamp = new Date(userWord!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(userWord).toEqual({
        id: 1,
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("getById", () => {
    it("returns a correct user word by ID", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      const newUserWord = await userWordQueries.create(newUser!.id, newWord.id);

      const existingUserWord = await userWordQueries.getById(newUserWord.id);

      const createdAtTimestamp = new Date(
        existingUserWord!.created_at
      ).getTime();
      const updatedAtTimestamp = new Date(
        existingUserWord!.updated_at
      ).getTime();
      const nowTimestamp = Date.now();
      expect(existingUserWord).toEqual({
        id: 1,
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns undefined when the user word does not exist", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.create(newUser!.id, newWord.id);

      const existingUserWord = await userWordQueries.getById("2");

      expect(existingUserWord).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("deletes the user word", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      const newUserWord = await userWordQueries.create(newUser!.id, newWord.id);

      await userWordQueries.delete(newUser!.id, newWord.id);

      const userWords = await userWordQueries.getById(newUserWord!.id);
      expect(userWords).toBeUndefined();
    });

    it("does nothing if the user word does not exist", async () => {
      const newWord = await wordQueries.create(json);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      const userWord = await userWordQueries.delete(newUser!.id, newWord.id);

      expect(userWord).toBeUndefined();
    });
  });

  describe("deleteAll", () => {
    it("deletes all of the user's words", async () => {
      const newWord1 = await wordQueries.create(json);
      const newWord2 = await wordQueries.create([
        {
          phonetic: "phonetic",
          phonetics: [
            {
              text: "/wɝd/",
              audio:
                "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3",
            },
          ],
          word: "word",
          origin: "origin",
          meanings: [],
        },
      ]);
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );
      const newUserWord1 = await userWordQueries.create(
        newUser!.id,
        newWord1.id
      );
      const newUserWord2 = await userWordQueries.create(
        newUser!.id,
        newWord2.id
      );

      const deletedUserWords = await userWordQueries.deleteAll(newUser!.id);

      const result = await userWordQueries.getByUserId(newUser!.id);
      expect(deletedUserWords).toEqual([newUserWord1, newUserWord2]);
      expect(result).toEqual({
        userWords: [],
      });
    });

    it("does not fail if the user has no user words", async () => {
      const newUser = await userQueries.create(
        sampleUser1.username,
        sampleUser1.password
      );

      const deletedUserWords = await userWordQueries.deleteAll(newUser!.id);

      const result = await userWordQueries.getByUserId(newUser!.id);
      expect(deletedUserWords).toEqual([]);
      expect(result).toEqual({
        userWords: [],
      });
    });
  });
});
