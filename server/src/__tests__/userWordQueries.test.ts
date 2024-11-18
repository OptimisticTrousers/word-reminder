import { UserQueries } from "../db/userQueries";
import { UserWordQueries } from "../db/userWordQueries";
import { WordQueries } from "../db/wordQueries";
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

  const word = {
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
  };

  describe("createUserWord", () => {
    it("creates user word", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const { userWord } = await userWordQueries.createUserWord(
        newUser.id,
        newWord.id
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser.id
      );
      expect(userWord.user_id).toBe(newUser.id);
      expect(userWord.word_id).toBe(newWord.id);
      expect(userWord.learned).toBe(false);
      expect(new Date(userWord.created_at).getTime()).toBeLessThanOrEqual(
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

      await userWordQueries.createUserWord(newUser.id, newWord.id);

      const { message } = await userWordQueries.createUserWord(
        newUser.id,
        newWord.id
      );
      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser.id
      );
      expect(message).toBe(
        "You have already added this word in your dictionary."
      );
      expect(userWordsExists).toBe(true);
    });

    it("fails when the user id is invalid", async () => {
      const newWord = await wordQueries.createWord(word);
      const userId = "1";

      const { message } = await userWordQueries.createUserWord(
        userId,
        newWord.id
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        userId
      );
      expect(message).toBe(`User with ID ${userId} does not exist.`);
      expect(userWordsExists).toBe(false);
    });

    it("fails when the word id is invalid", async () => {
      const wordId = "1";
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const { message } = await userWordQueries.createUserWord(
        newUser.id,
        wordId
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser.id
      );
      expect(message).toBe(`Word with ID ${wordId} does not exist.`);
      expect(userWordsExists).toBe(false);
    });

    it("fails when the user id and word id is invalid", async () => {
      const wordId = "1";
      const userId = "1";

      const { message } = await userWordQueries.createUserWord(userId, wordId);

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        userId
      );
      expect(message).toBe(`User with ID ${userId} does not exist.`);
      expect(userWordsExists).toBe(false);
    });
  });

  describe("getUserWordsByUserId", () => {
    it("gets the user word by user ID", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      await userWordQueries.createUserWord(newUser.id, newWord.id);

      const existingUserWords = await userWordQueries.getUserWordsByUserId(
        newUser.id
      );
      const existingUserWord = existingUserWords[0];
      expect(existingUserWord.user_id).toBe(newUser.id);
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

      const existingUserWords = await userWordQueries.getUserWordsByUserId(
        newUser.id
      );

      expect(existingUserWords).toEqual([]);
    });
  });

  describe("existsUserWordsByUserId", () => {
    it("returns true when the user word exists", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      await userWordQueries.createUserWord(newUser.id, newWord.id);

      const userWordsExist = await userWordQueries.existsUserWordsByUserId(
        newUser.id
      );

      expect(userWordsExist).toBe(true);
    });

    it("returns false when no user words for the user exist", async () => {
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const userWordsExist = await userWordQueries.existsUserWordsByUserId(
        newUser.id
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
      await userWordQueries.createUserWord(newUser.id, newWord.id);

      const { userWord } = await userWordQueries.getUserWord(
        newUser.id,
        newWord.id
      );

      expect(userWord.user_id).toBe(newUser.id);
      expect(userWord.word_id).toBe(newWord.id);
      expect(userWord.learned).toBe(false);
      expect(new Date(userWord.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it("returns a message when the user does not exist", async () => {
      const userId = "2";
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser.id, newWord.id);

      const { message } = await userWordQueries.getUserWord("2", newWord.id);

      expect(message).toBe(`User with ID ${userId} does not exist.`);
    });

    it("returns a message when the word does not exist", async () => {
      const wordId = "2";
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser.id, newWord.id);

      const { message } = await userWordQueries.getUserWord(newUser.id, wordId);

      expect(message).toBe(`Word with ID ${wordId} does not exist.`);
    });

    it("returns a message when the user and word does not exist", async () => {
      const userId = "2";
      const wordId = "2";
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser.id, newWord.id);

      const { message } = await userWordQueries.getUserWord(userId, wordId);

      expect(message).toBe(`User with ID ${userId} does not exist.`);
    });
  });

  describe("userWordExists", () => {
    it("returns true if the user word exists", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser.id, newWord.id);

      const userWordExists = await userWordQueries.userWordExists(
        newUser.id,
        newWord.id
      );

      expect(userWordExists).toBe(true);
    });

    it("returns false when the user word does not exist", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const userWordExists = await userWordQueries.userWordExists(
        newUser.id,
        newWord.id
      );

      expect(userWordExists).toBe(false);
    });

    it("returns false when the user does not exist", async () => {
      const newWord = await wordQueries.createWord(word);
      const userId = "1";

      const userWordExists = await userWordQueries.userWordExists(
        userId,
        newWord.id
      );

      expect(userWordExists).toBe(false);
    });

    it("returns false when the word does not exist", async () => {
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      const wordId = "2";
      await userWordQueries.createUserWord(newUser.id, wordId);

      const userWordExists = await userWordQueries.userWordExists(
        newUser.id,
        wordId
      );

      expect(userWordExists).toBe(false);
    });

    it("returns a message when the user and word does not exist", async () => {
      const userId = "2";
      const wordId = "2";
      await userWordQueries.createUserWord(userId, wordId);

      const { message } = await userWordQueries.getUserWord(userId, wordId);

      expect(message).toBe(`User with ID ${userId} does not exist.`);
    });
  });

  describe("deleteUserWord", () => {
    it("deletes the user word", async () => {
      const newWord = await wordQueries.createWord(word);
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser.id, newWord.id);

      await userWordQueries.deleteUserWord(newUser.id, newWord.id);

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser.id
      );
      expect(userWordsExists).toBe(false);
    });

    it("does nothing when the user id is invalid", async () => {
      const newWord = await wordQueries.createWord(word);
      const userId = "1";
      await userWordQueries.createUserWord(userId, newWord.id);

      const { message } = await userWordQueries.deleteUserWord(
        userId,
        newWord.id
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        userId
      );
      expect(message).toBe(`User with ID ${userId} does not exist.`);
      expect(userWordsExists).toBe(false);
    });

    it("does nothing when the word id is invalid", async () => {
      const wordId = "1";
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      await userWordQueries.createUserWord(newUser.id, wordId);

      const { message } = await userWordQueries.deleteUserWord(
        newUser.id,
        wordId
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser.id
      );
      expect(message).toBe(`Word with ID ${wordId} does not exist.`);
      expect(userWordsExists).toBe(false);
    });

    it("does nothing when the user id and word id is invalid", async () => {
      const wordId = "1";
      const userId = "1";
      await userWordQueries.createUserWord(userId, wordId);

      const { message } = await userWordQueries.deleteUserWord(userId, wordId);

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        userId
      );
      expect(message).toBe(`User with ID ${userId} does not exist.`);
      expect(userWordsExists).toBe(false);
    });
  });

  describe("deleteAllUserWords", () => {
    it("deletes all of the user's words", async () => {
      const newWord1 = await wordQueries.createWord(word);
      const newWord2 = await wordQueries.createWord({
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
      });
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );
      const userWord1 = await userWordQueries.createUserWord(
        newUser.id,
        newWord1.id
      );
      const userWord2 = await userWordQueries.createUserWord(
        newUser.id,
        newWord2.id
      );

      const deletedUserWords = await userWordQueries.deleteAllUserWords(
        newUser.id
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser.id
      );
      expect(deletedUserWords).toEqual([
        userWord1.userWord,
        userWord2.userWord,
      ]);
      expect(userWordsExists).toBe(false);
    });

    it("does not fail if the user has no user words", async () => {
      const newUser = await userQueries.createUser(
        sampleUser1.username,
        sampleUser1.password
      );

      const deletedUserWords = await userWordQueries.deleteAllUserWords(
        newUser.id
      );

      const userWordsExists = await userWordQueries.existsUserWordsByUserId(
        newUser.id
      );
      expect(deletedUserWords).toEqual([]);
      expect(userWordsExists).toBe(false);
    });
  });
});
