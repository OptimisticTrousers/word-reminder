import { userQueries } from "../db/user_queries";
import { Order, UserWord, userWordQueries } from "../db/user_word_queries";
import { Word, wordQueries } from "../db/word_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("userWordQueries", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const userWord = await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const userWord = await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: true,
      });

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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

      const userWord = await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

      // Set the 'learned' property to true since it is false by default
      const userWord = await userWordQueries.setLearned({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: true,
      });

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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: true,
      });

      // Set the 'learned' property to true since it is false by default
      const userWord = await userWordQueries.setLearned({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

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
    it("returns the user words", async () => {
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

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
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

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
        const newUser = await userQueries.create({
          email: sampleUser1.email,
          password: sampleUser1.password,
        });
        milieuWord = await wordQueries.create({
          json: [
            {
              word: "milieu",
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    { definition: "A person's social environment." },
                  ],
                },
              ],
              phonetics: [],
            },
          ],
        });
        clemencyWord = await wordQueries.create({
          json: [
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
        });
        concomitantlyWord = await wordQueries.create({
          json: [
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
          ],
        });
        sanguineWord = await wordQueries.create({
          json: [
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
          ],
        });
        expropriationWord = await wordQueries.create({
          json: [
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
          ],
        });
        admonitionWord = await wordQueries.create({
          json: [
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
          ],
        });
        ignobleWord = await wordQueries.create({
          json: [
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
          ],
        });
        dithyrambicWord = await wordQueries.create({
          json: [
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
          ],
        });
        admonishWord = await wordQueries.create({
          json: [
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
          ],
        });
        milieuUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: milieuWord.id,
          learned: false,
        });
        clemencyUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: clemencyWord.id,
          learned: true,
        });
        concomitantlyUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: concomitantlyWord.id,
          learned: false,
        });
        sanguineUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: sanguineWord.id,
          learned: true,
        });
        expropriationUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: expropriationWord.id,
          learned: false,
        });
        admonitionUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: admonitionWord.id,
          learned: true,
        });
        ignobleUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: ignobleWord.id,
          learned: false,
        });
        dithyrambicUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: dithyrambicWord.id,
          learned: true,
        });
        admonishUserWord = await userWordQueries.create({
          user_id: newUser!.id,
          word_id: admonishWord.id,
          learned: false,
        });
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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

      const userWord = await userWordQueries.get({
        user_id: newUser!.id,
        word_id: newWord.id,
      });

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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const newUserWord = await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

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
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

      const existingUserWord = await userWordQueries.getById("2");

      expect(existingUserWord).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("deletes the user word", async () => {
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const newUserWord = await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord.id,
        learned: false,
      });

      await userWordQueries.delete({
        user_id: newUser!.id,
        word_id: newWord.id,
      });

      const userWords = await userWordQueries.getById(newUserWord!.id);
      expect(userWords).toBeUndefined();
    });

    it("does nothing if the user word does not exist", async () => {
      const newWord = await wordQueries.create({ json });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const userWord = await userWordQueries.delete({
        user_id: newUser!.id,
        word_id: newWord.id,
      });

      expect(userWord).toBeUndefined();
    });
  });

  describe("deleteAllByUserId", () => {
    it("deletes all of the user's words", async () => {
      const newWord1 = await wordQueries.create({ json });
      const newWord2 = await wordQueries.create({
        json: [
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
        ],
      });
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const newUserWord1 = await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord1.id,
        learned: false,
      });
      const newUserWord2 = await userWordQueries.create({
        user_id: newUser!.id,
        word_id: newWord2.id,
        learned: false,
      });

      const deletedUserWords = await userWordQueries.deleteAllByUserId(
        newUser!.id
      );

      const result = await userWordQueries.getByUserId(newUser!.id);
      expect(deletedUserWords).toEqual([newUserWord1, newUserWord2]);
      expect(result).toEqual({
        userWords: [],
      });
    });

    it("returns empty list if the user has no user words", async () => {
      const newUser = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const deletedUserWords = await userWordQueries.deleteAllByUserId(
        newUser!.id
      );

      const result = await userWordQueries.getByUserId(newUser!.id);
      expect(deletedUserWords).toEqual([]);
      expect(result).toEqual({
        userWords: [],
      });
    });
  });

  describe("getUserWords", () => {
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

    it("returns the oldest user words", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json });
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

      const randomUserWords = await userWordQueries.getUserWords(user!.id, {
        count: 7,
        learned: false,
        order: Order.Oldest,
      });

      const expectedUserWords = [
        clemencyUserWord,
        helloUserWord,
        milieuUserWord,
      ];
      expect(randomUserWords).toEqual(expectedUserWords);
    });

    it("returns the most recent user words", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json });
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

      const randomUserWords = await userWordQueries.getUserWords(user!.id, {
        count: 7,
        learned: false,
        order: Order.Newest,
      });

      const expectedUserWords = [
        milieuUserWord,
        helloUserWord,
        clemencyUserWord,
      ];
      expect(randomUserWords).toEqual(expectedUserWords);
    });

    it("returns x rows", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json });
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

      const randomUserWords = await userWordQueries.getUserWords(user!.id, {
        count: 2,
        learned: false,
        order: Order.Random,
      });

      const expectedUserWords = [
        clemencyUserWord,
        helloUserWord,
        milieuUserWord,
      ];
      const validPermutations = [
        [expectedUserWords[0], expectedUserWords[1]],
        [expectedUserWords[1], expectedUserWords[0]],
        [expectedUserWords[0], expectedUserWords[2]],
        [expectedUserWords[2], expectedUserWords[0]],
        [expectedUserWords[1], expectedUserWords[2]],
        [expectedUserWords[2], expectedUserWords[1]],
      ];
      const randomUserWordsString = JSON.stringify(randomUserWords);
      const matchesPermutation =
        randomUserWordsString === JSON.stringify(validPermutations[0]) ||
        randomUserWordsString === JSON.stringify(validPermutations[1]) ||
        randomUserWordsString === JSON.stringify(validPermutations[2]) ||
        randomUserWordsString === JSON.stringify(validPermutations[3]) ||
        randomUserWordsString === JSON.stringify(validPermutations[4]) ||
        randomUserWordsString === JSON.stringify(validPermutations[5]);
      expect(matchesPermutation).toBe(true);
    });

    it("returns x rows when only x exist, but y where y > x is requested", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json });
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

      const randomUserWords = await userWordQueries.getUserWords(user!.id, {
        count: 7,
        learned: false,
        order: Order.Random,
      });

      const expectedUserWords = [
        clemencyUserWord,
        helloUserWord,
        milieuUserWord,
      ];
      expect(randomUserWords).toEqual(
        expect.arrayContaining([
          expect.objectContaining(expectedUserWords[0]),
          expect.objectContaining(expectedUserWords[1]),
          expect.objectContaining(expectedUserWords[2]),
        ])
      );
    });

    it("returns no rows when none exist", async () => {
      const user = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const randomUserWords = await userWordQueries.getUserWords(user!.id, {
        count: 7,
        learned: false,
        order: Order.Random,
      });

      expect(randomUserWords).toEqual([]);
    });

    it("returns learned user words", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const helloWord = await wordQueries.create({ json });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      const user = await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const clemencyUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: clemencyWord.id,
        learned: true,
      });
      const helloUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: helloWord.id,
        learned: false,
      });
      const milieuUserWord = await userWordQueries.create({
        user_id: user!.id,
        word_id: milieuWord.id,
        learned: true,
      });

      const randomUserWords = await userWordQueries.getUserWords(user!.id, {
        count: 2,
        learned: true,
        order: Order.Random,
      });

      const expectedUserWords = [
        clemencyUserWord,
        helloUserWord,
        milieuUserWord,
      ];
      expect(randomUserWords).toEqual(
        expect.arrayContaining([
          expect.objectContaining(expectedUserWords[0]),
          expect.objectContaining(expectedUserWords[2]),
        ])
      );
    });
  });
});
