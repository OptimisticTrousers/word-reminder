import { UserQueries } from "../db/userQueries";
import { UserWord, UserWordQueries } from "../db/userWordQueries";
import { Word, WordQueries, WordWithId } from "../db/wordQueries";
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

  const word = [
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

  describe("createUserWord", () => {
    it("creates user word", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const userWord = await userWordQueries.createUserWord(
        newUser!.id,
        newWord.id
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser!.id
      );
      expect(userWord!.user_id).toBe(newUser!.id);
      expect(userWord!.word_id).toBe(newWord.id);
      expect(userWord!.learned).toBe(false);
      expect(new Date(userWord!.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
      expect(userWordsExists).toBe(true);
    });

    it("creates a user word with the learned property of true", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const userWord = await userWordQueries.createUserWord(
        newUser!.id,
        newWord.id,
        true
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser!.id
      );
      expect(userWord!.user_id).toBe(newUser!.id);
      expect(userWord!.word_id).toBe(newWord.id);
      expect(userWord!.learned).toBe(true);
      expect(new Date(userWord!.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
      expect(userWordsExists).toBe(true);
    });

    it("does nothing when the user word already exists", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      await userWordQueries.createUserWord(newUser!.id, newWord.id);

      const userWord = await userWordQueries.createUserWord(
        newUser!.id,
        newWord.id
      );
      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser!.id
      );
      expect(userWordsExists).toBe(true);
      expect(userWord!.user_id).toBe(newUser!.id);
      expect(userWord!.word_id).toBe(newWord.id);
      expect(userWord!.learned).toBe(false);
      expect(new Date(userWord!.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });
  });

  describe("toggleLearnedUserWord", () => {
    it("changes the learned property on the user word to true", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      await userWordQueries.createUserWord(newUser!.id, newWord.id);
      // Set the 'learned' property to true since it is false by default
      await userWordQueries.setLearnedUserWord(newUser!.id, newWord.id, true);
      const userWord = await userWordQueries.getUserWord(
        newUser!.id,
        newWord.id
      );

      expect(userWord!.user_id).toBe(newUser!.id);
      expect(userWord!.word_id).toBe(newWord.id);
      expect(userWord!.learned).toBe(true);
      expect(new Date(userWord!.updated_at).getTime()).toBeGreaterThanOrEqual(
        new Date(userWord!.created_at).getTime()
      );
    });

    it("changes the learned property on the user word to false if already set to true", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      await userWordQueries.createUserWord(newUser!.id, newWord.id);
      // Set the 'learned' property to true since it is false by default
      await userWordQueries.setLearnedUserWord(newUser!.id, newWord.id, false);
      const userWord = await userWordQueries.getUserWord(
        newUser!.id,
        newWord.id
      );

      expect(userWord!.user_id).toBe(newUser!.id);
      expect(userWord!.word_id).toBe(newWord.id);
      expect(userWord!.learned).toBe(false);
      expect(new Date(userWord!.updated_at).getTime()).toBeGreaterThanOrEqual(
        new Date(userWord!.created_at).getTime()
      );
    });
  });

  describe("getUserWordsByUserId", () => {
    it("gets the user word by user ID", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      await userWordQueries.createUserWord(newUser!.id, newWord.id);

      const result = await userWordQueries.getUserWordsByUserId(newUser!.id);
      const existingUserWord = result.userWords[0];
      expect(existingUserWord.user_id).toBe(newUser!.id);
      expect(existingUserWord.word_id).toBe(newWord.id);
      expect(existingUserWord.learned).toBe(false);
      expect(
        new Date(existingUserWord.created_at).getTime()
      ).toBeLessThanOrEqual(Date.now());
    });

    it("returns an empty list of rows if the user has no user words", async () => {
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const result = await userWordQueries.getUserWordsByUserId(newUser!.id);

      expect(result.userWords).toEqual([]);
    });

    describe("getUserWordsByUserId with options", () => {
      let milieuWord: WordWithId | null = null;
      let clemencyWord: WordWithId | null = null;
      let concomitantlyWord: WordWithId | null = null;
      let sanguineWord: WordWithId | null = null;
      let expropriationWord: WordWithId | null = null;
      let admonitionWord: WordWithId | null = null;
      let ignobleWord: WordWithId | null = null;
      let dithyrambicWord: WordWithId | null;
      let admonishWord: WordWithId | null;

      let milieuUserWord: UserWord | null = null;
      let clemencyUserWord: UserWord | null = null;
      let concomitantlyUserWord: UserWord | null = null;
      let sanguineUserWord: UserWord | null = null;
      let expropriationUserWord: UserWord | null = null;
      let admonitionUserWord: UserWord | null = null;
      let ignobleUserWord: UserWord | null = null;
      let dithyrambicUserWord: UserWord | null;
      let admonishUserWord: UserWord | null;
      beforeEach(async () => {
        const newUser = await userQueries.createUser(
          sampleUser1.username,
          sampleUser1.password
        );
        milieuWord = await wordQueries.createWord([
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
        clemencyWord = await wordQueries.createWord([
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
        concomitantlyWord = await wordQueries.createWord([
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
        sanguineWord = await wordQueries.createWord([
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
        expropriationWord = await wordQueries.createWord([
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
        admonitionWord = await wordQueries.createWord([
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
        ignobleWord = await wordQueries.createWord([
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
        dithyrambicWord = await wordQueries.createWord([
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
        admonishWord = await wordQueries.createWord([
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
        milieuUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          milieuWord.id,
          false
        );
        clemencyUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          clemencyWord.id,
          true
        );
        concomitantlyUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          concomitantlyWord.id,
          false
        );
        sanguineUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          sanguineWord.id,
          true
        );
        expropriationUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          expropriationWord.id,
          false
        );
        admonitionUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          admonitionWord.id,
          true
        );
        ignobleUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          ignobleWord.id,
          false
        );
        dithyrambicUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          dithyrambicWord.id,
          true
        );
        admonishUserWord = await userWordQueries.createUserWord(
          newUser!.id,
          admonishWord.id,
          false
        );
      });

      it("returns all of the user's user words when no queries are provided", async () => {
        const result = await userWordQueries.getUserWordsByUserId(
          sampleUser1.id
        );

        expect(result.userWords).toEqual([
          { ...milieuWord, ...milieuUserWord },
          { ...clemencyWord, ...clemencyUserWord },
          { ...concomitantlyWord, ...concomitantlyUserWord },
          { ...sanguineWord, ...sanguineUserWord },
          { ...expropriationWord, ...expropriationUserWord },
          { ...admonitionWord, ...admonitionUserWord },
          { ...ignobleWord, ...ignobleUserWord },
          { ...dithyrambicWord, ...dithyrambicUserWord },
          { ...admonishWord, ...admonishUserWord },
        ]);
        expect(result.previous).toBeUndefined();
        expect(result.next).toEqual({
          page: 2,
          limit: 8, // default limit
        });
      });

      it("returns correct user words when all queries are provided", async () => {
        const result = await userWordQueries.getUserWordsByUserId(
          sampleUser1.id,
          {
            learned: true,
            sort: { column: "created_at", table: "user_words", direction: 1 },
            search: "ad",
            page: 1,
            limit: 2,
          }
        );

        expect(result.userWords).toEqual([
          { ...admonitionWord, ...admonitionUserWord },
        ]);
        expect(result.previous).toBeUndefined();
        expect(result.next).toBeUndefined();
      });

      describe("learned query", () => {
        it("returns user words that are learned", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { learned: true }
          );

          expect(result.userWords).toEqual([
            { ...clemencyWord, ...clemencyUserWord },
            { ...sanguineWord, ...sanguineUserWord },
            { ...admonitionWord, ...admonitionUserWord },
            { ...dithyrambicWord, ...dithyrambicUserWord },
          ]);
          expect(result.previous).toBeUndefined();
          expect(result.next).toBeUndefined();
        });

        it("returns user words that are not learned", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { learned: false }
          );

          expect(result.userWords).toEqual([
            { ...milieuWord, ...milieuUserWord },
            { ...concomitantlyWord, ...concomitantlyUserWord },
            { ...expropriationWord, ...expropriationUserWord },
            { ...ignobleWord, ...ignobleUserWord },
            { ...admonishWord, ...admonishUserWord },
          ]);
          expect(result.previous).toBeUndefined();
          expect(result.next).toBeUndefined();
        });
      });

      describe("sort query", () => {
        it("returns words in alphabetically ascending order", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { sort: { table: "words", column: "word", direction: 1 } }
          );

          expect(result.userWords).toEqual([
            { ...admonishWord, ...admonishUserWord },
            { ...admonitionWord, ...admonitionUserWord },
            { ...clemencyWord, ...clemencyUserWord },
            { ...concomitantlyWord, ...concomitantlyUserWord },
            { ...dithyrambicWord, ...dithyrambicUserWord },
            { ...expropriationWord, ...expropriationUserWord },
            { ...ignobleWord, ...ignobleUserWord },
            { ...milieuWord, ...milieuUserWord },
            { ...sanguineWord, ...sanguineUserWord },
          ]);
          expect(result.previous).toBeUndefined();
          expect(result.next).toEqual({
            page: 2,
            limit: 8, // default limit
          });
        });

        it("returns words in alphabetically descending order", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { sort: { table: "words", column: "word", direction: -1 } }
          );

          expect(result.userWords).toEqual([
            { ...sanguineWord, ...sanguineUserWord },
            { ...milieuWord, ...milieuUserWord },
            { ...ignobleWord, ...ignobleUserWord },
            { ...expropriationWord, ...expropriationUserWord },
            { ...dithyrambicWord, ...dithyrambicUserWord },
            { ...concomitantlyWord, ...concomitantlyUserWord },
            { ...clemencyWord, ...clemencyUserWord },
            { ...admonitionWord, ...admonitionUserWord },
            { ...admonishWord, ...admonishUserWord },
          ]);
          expect(result.previous).toBeUndefined();
          expect(result.next).toEqual({
            page: 2,
            limit: 8, // default limit
          });
        });

        it("returns user words in ascending order for when the user words were created", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            {
              sort: { table: "user_words", column: "created_at", direction: 1 },
            }
          );

          expect(result.userWords).toEqual([
            { ...milieuWord, ...milieuUserWord },
            { ...clemencyWord, ...clemencyUserWord },
            { ...concomitantlyWord, ...concomitantlyUserWord },
            { ...sanguineWord, ...sanguineUserWord },
            { ...expropriationWord, ...expropriationUserWord },
            { ...admonitionWord, ...admonitionUserWord },
            { ...ignobleWord, ...ignobleUserWord },
            { ...dithyrambicWord, ...dithyrambicUserWord },
            { ...admonishWord, ...admonishUserWord },
          ]);
          expect(result.previous).toBeUndefined();
          expect(result.next).toEqual({
            page: 2,
            limit: 8, // default limit
          });
        });

        it("returns user words in descending order for when the user words were created", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            {
              sort: {
                table: "user_words",
                column: "created_at",
                direction: -1,
              },
            }
          );

          expect(result.userWords).toEqual([
            { ...admonishWord, ...admonishUserWord },
            { ...dithyrambicWord, ...dithyrambicUserWord },
            { ...ignobleWord, ...ignobleUserWord },
            { ...admonitionWord, ...admonitionUserWord },
            { ...expropriationWord, ...expropriationUserWord },
            { ...sanguineWord, ...sanguineUserWord },
            { ...concomitantlyWord, ...concomitantlyUserWord },
            { ...clemencyWord, ...clemencyUserWord },
            { ...milieuWord, ...milieuUserWord },
          ]);
        });
      });

      describe("search query", () => {
        it("returns user words that the user searches for", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { search: "mil" }
          );

          expect(result.userWords).toEqual([
            { ...milieuWord, ...milieuUserWord },
          ]);
        });

        it("returns user words that the user searches for when the search query is uppercase", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { search: "MIL" }
          );

          expect(result.userWords).toEqual([
            { ...milieuWord, ...milieuUserWord },
          ]);
        });

        it("returns no user words when the search contains no results", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { search: "no results" }
          );

          expect(result.userWords).toEqual([]);
        });
      });

      describe("page number and page limit query", () => {
        it("returns user words based on page and limit with a previous and next object", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { page: 2, limit: 2 }
          );

          expect(result.userWords).toEqual([
            { ...concomitantlyWord, ...concomitantlyUserWord },
            { ...sanguineWord, ...sanguineUserWord },
          ]);
          expect(result.previous).toEqual({
            page: 1,
            limit: 2,
          });
          expect(result.next).toEqual({
            page: 3,
            limit: 2,
          });
        });

        it("returns user words based on page and limit with a previous object when there is no next page", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { page: 5, limit: 2 }
          );

          expect(result.userWords).toEqual([
            { ...admonishWord, ...admonishUserWord },
          ]);
          expect(result.previous).toEqual({
            page: 4,
            limit: 2,
          });
          expect(result.next).toBeUndefined();
        });

        it("returns user words based on page and limit with a next object when there is no previous page", async () => {
          const result = await userWordQueries.getUserWordsByUserId(
            sampleUser1.id,
            { page: 1, limit: 2 }
          );

          expect(result.userWords).toEqual([
            { ...milieuWord, ...milieuUserWord },
            { ...clemencyWord, ...clemencyUserWord },
          ]);
          expect(result.previous).toBeUndefined();
          expect(result.next).toEqual({
            page: 2,
            limit: 2,
          });
        });
      });
    });
  });

  describe("existsUserWordsByUserId", () => {
    it("returns true when the user word exists", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      await userWordQueries.createUserWord(newUser!.id, newWord.id);

      const userWordsExist = await userWordQueries.existsUserWordsByUserId(
        newUser!.id
      );

      expect(userWordsExist).toBe(true);
    });

    it("returns false when no user words for the user exist", async () => {
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const userWordsExist = await userWordQueries.existsUserWordsByUserId(
        newUser!.id
      );

      expect(userWordsExist).toBe(false);
    });
  });

  describe("getUserWord", () => {
    it("gets the user word by user and word IDs", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser!.id, newWord.id);

      const userWord = await userWordQueries.getUserWord(
        newUser!.id,
        newWord.id
      );

      expect(userWord!.user_id).toBe(newUser!.id);
      expect(userWord!.word_id).toBe(newWord.id);
      expect(userWord!.learned).toBe(false);
      expect(new Date(userWord!.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });
  });

  describe("userWordExists", () => {
    it("returns true if the user word exists", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser!.id, newWord.id);

      const userWordExists = await userWordQueries.userWordExists(
        newUser!.id,
        newWord.id
      );

      expect(userWordExists).toBe(true);
    });
  });

  describe("deleteUserWord", () => {
    it("deletes the user word", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser!.id, newWord.id);

      await userWordQueries.deleteUserWord(newUser!.id, newWord.id);

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser!.id
      );
      expect(userWordsExists).toBe(false);
    });
  });

  describe("deleteAllUserWords", () => {
    it("deletes all of the user's words", async () => {
      const newWord1 = await wordQueries.createWord(word);
      const newWord2 = await wordQueries.createWord([
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
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      const userWord1 = await userWordQueries.createUserWord(
        newUser!.id,
        newWord1.id
      );
      const userWord2 = await userWordQueries.createUserWord(
        newUser!.id,
        newWord2.id
      );

      const deletedUserWords = await userWordQueries.deleteAllUserWords(
        newUser!.id
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser!.id
      );
      expect(deletedUserWords).toEqual([userWord1, userWord2]);
      expect(userWordsExists).toBe(false);
    });

    it("does not fail if the user has no user words", async () => {
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const deletedUserWords = await userWordQueries.deleteAllUserWords(
        newUser!.id
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser!.id
      );
      expect(deletedUserWords).toEqual([]);
      expect(userWordsExists).toBe(false);
    });
  });
});
