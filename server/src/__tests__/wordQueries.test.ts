import { pool } from "../db/pool";
import { WordQueries } from "../db/wordQueries";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("wordQueries", () => {
  const wordQueries = new WordQueries();

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

  describe("createWord", () => {
    it("creates word with all fields", async () => {
      await wordQueries.createWord(word);

      const wordExists = await wordQueries.wordExistsByWord(word.word);
      expect(wordExists).toBe(true);
    });

    it("creates word without an origin field", async () => {
      await wordQueries.createWord({
        word: word.word,
        phonetics: word.phonetics,
        phonetic: word.phonetic,
        meanings: word.meanings,
      });

      const wordExists = await wordQueries.wordExistsByWord(word.word);
      expect(wordExists).toBe(true);
    });

    it("creates definitions, meanings, and phonetics after a word is created", async () => {
      const newWord = await wordQueries.createWord(word);

      const { rows } = await pool.query(
        `SELECT words.*, meanings.*, definitions.*, phonetics.* 
         FROM words 
         JOIN meanings ON meanings.word_id = words.id 
         JOIN definitions ON definitions.meaning_id = meanings.id 
         JOIN phonetics ON phonetics.word_id = words.id 
         WHERE words.id = $1`,
        [newWord.id]
      );

      expect(rows).toEqual([
        {
          antonyms: [],
          audio:
            "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3",
          created_at: expect.any(Date),
          definition: "used as a greeting or to begin a phone conversation.",
          example: "hello there, Katie!",
          id: 1,
          meaning_id: 1,
          origin:
            "early 19th century: variant of earlier hollo ; related to holla.",
          part_of_speech: "exclamation",
          phonetic: "həˈləʊ",
          source_url: null,
          synonyms: [],
          text: "həˈləʊ",
          word: "hello",
          word_id: 1,
        },
        {
          antonyms: [],
          audio:
            "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3",
          created_at: expect.any(Date),
          definition: "an utterance of ‘hello’; a greeting.",
          example: "she was getting polite nods and hellos from people",
          id: 1,
          meaning_id: 2,
          origin:
            "early 19th century: variant of earlier hollo ; related to holla.",
          part_of_speech: "noun",
          phonetic: "həˈləʊ",
          source_url: null,
          synonyms: [],
          text: "həˈləʊ",
          word: "hello",
          word_id: 1,
        },
        {
          antonyms: [],
          audio:
            "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3",
          created_at: expect.any(Date),
          definition: "say or shout ‘hello’.",
          example: "I pressed the phone button and helloed",
          id: 1,
          meaning_id: 3,
          origin:
            "early 19th century: variant of earlier hollo ; related to holla.",
          part_of_speech: "verb",
          phonetic: "həˈləʊ",
          source_url: null,
          synonyms: [],
          text: "həˈləʊ",
          word: "hello",
          word_id: 1,
        },
        {
          antonyms: [],
          audio: null,
          created_at: expect.any(Date),
          definition: "used as a greeting or to begin a phone conversation.",
          example: "hello there, Katie!",
          id: 2,
          meaning_id: 1,
          origin:
            "early 19th century: variant of earlier hollo ; related to holla.",
          part_of_speech: "exclamation",
          phonetic: "həˈləʊ",
          source_url: null,
          synonyms: [],
          text: "hɛˈləʊ",
          word: "hello",
          word_id: 1,
        },
        {
          antonyms: [],
          audio: null,
          created_at: expect.any(Date),
          definition: "an utterance of ‘hello’; a greeting.",
          example: "she was getting polite nods and hellos from people",
          id: 2,
          meaning_id: 2,
          origin:
            "early 19th century: variant of earlier hollo ; related to holla.",
          part_of_speech: "noun",
          phonetic: "həˈləʊ",
          source_url: null,
          synonyms: [],
          text: "hɛˈləʊ",
          word: "hello",
          word_id: 1,
        },
        {
          antonyms: [],
          audio: null,
          created_at: expect.any(Date),
          definition: "say or shout ‘hello’.",
          example: "I pressed the phone button and helloed",
          id: 2,
          meaning_id: 3,
          origin:
            "early 19th century: variant of earlier hollo ; related to holla.",
          part_of_speech: "verb",
          phonetic: "həˈləʊ",
          source_url: null,
          synonyms: [],
          text: "hɛˈləʊ",
          word: "hello",
          word_id: 1,
        },
      ]);
    });
  });

  describe("wordExistsById", () => {
    it("returns true when word exists", async () => {
      const newWord = await wordQueries.createWord(word);

      const wordExists = await wordQueries.wordExistsById(newWord.id);

      expect(wordExists).toBe(true);
    });

    it("returns false when word does not exist", async () => {
      const wordExists = await wordQueries.wordExistsById("1");

      expect(wordExists).toBe(false);
    });
  });

  describe("wordExistsByWord", () => {
    it("returns true when word exists", async () => {
      await wordQueries.createWord(word);

      const wordExists = await wordQueries.wordExistsByWord(word.word);

      expect(wordExists).toBe(true);
    });

    it("returns true when the word exists in a different case", async () => {
      await wordQueries.createWord(word);

      const wordExists = await wordQueries.wordExistsByWord(
        word.word.toUpperCase()
      );

      expect(wordExists).toBe(true);
    });

    it("returns false when word does not exist", async () => {
      const wordExists = await wordQueries.wordExistsByWord("nonexistent");

      expect(wordExists).toBe(false);
    });
  });

  describe("getWordByWord", () => {
    it("returns a word", async () => {
      await wordQueries.createWord(word);

      const newWord = await wordQueries.getWordByWord(word.word);

      expect(newWord.word).toBe(word.word);
      expect(newWord.origin).toBe(word.origin);
      expect(newWord.phonetic).toBe(word.phonetic);
      expect(new Date(newWord.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it("returns word when the word exists in a different case", async () => {
      await wordQueries.createWord(word);

      const newWord = await wordQueries.getWordByWord(word.word.toUpperCase());

      expect(newWord.word).toBe(word.word);
      expect(newWord.origin).toBe(word.origin);
      expect(newWord.phonetic).toBe(word.phonetic);
      expect(new Date(newWord.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it("returns undefined when the word does not exist", async () => {
      const word = await wordQueries.getWordByWord("undefined");

      expect(word).toBeUndefined();
    });
  });

  describe("getWordById", () => {
    it("returns a correct word", async () => {
      const { id } = await wordQueries.createWord(word);

      const newWord = await wordQueries.getWordById(id);

      expect(newWord.word).toBe(word.word);
      expect(newWord.origin).toBe(word.origin);
      expect(newWord.phonetic).toBe(word.phonetic);
      expect(new Date(newWord.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it("returns undefined when the word does not exist", async () => {
      const word = await wordQueries.getWordById("1");

      expect(word).toBeUndefined();
    });
  });
});
