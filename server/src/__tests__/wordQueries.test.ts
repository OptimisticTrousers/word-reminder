import { pool } from "../db/pool";
import { WordQueries } from "../db/wordQueries";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("wordQueries", () => {
  const wordQueries = new WordQueries();

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

  const word = json[0].word;
  const phonetics = json[0].phonetics;
  const meanings = json[0].meanings;

  describe("createWord", () => {
    it("creates word with all fields", async () => {
      await wordQueries.createWord(json);

      const wordExists = await wordQueries.wordExistsByWord(word);
      expect(wordExists).toBe(true);
    });

    it("creates word without an origin field", async () => {
      await wordQueries.createWord([
        {
          word,
          phonetics,
          meanings,
        },
      ]);

      const wordExists = await wordQueries.wordExistsByWord(word);
      expect(wordExists).toBe(true);
    });

    it("creates word after a word is created", async () => {
      const newWord = await wordQueries.createWord(json);

      const { rows } = await pool.query(
        `SELECT words.*
         FROM words 
         WHERE words.id = $1`,
        [newWord.id]
      );

      expect(rows).toEqual([
        {
          created_at: expect.any(Date),
          id: 1,
          origin: null,
          phonetic: null,
          word: "hello",
        },
      ]);
      expect(new Date(newWord.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it("creates meanings after a word is created", async () => {
      const newWord = await wordQueries.createWord(json);

      const { rows } = await pool.query(
        `SELECT meanings.*
         FROM words 
         JOIN meanings ON meanings.word_id = words.id 
         WHERE words.id = $1`,
        [newWord.id]
      );

      expect(rows).toEqual([
        {
          id: 1,
          part_of_speech: "noun",
          word_id: 1,
        },
        {
          id: 2,
          part_of_speech: "verb",
          word_id: 1,
        },
        {
          id: 3,
          part_of_speech: "interjection",
          word_id: 1,
        },
      ]);
    });

    it("creates definitions after a word is created", async () => {
      const newWord = await wordQueries.createWord(json);

      const { rows } = await pool.query(
        `SELECT definitions.*
         FROM words 
         JOIN meanings ON meanings.word_id = words.id 
         JOIN definitions ON definitions.meaning_id = meanings.id 
         WHERE words.id = $1`,
        [newWord.id]
      );
      expect(rows).toEqual([
        {
          antonyms: [],
          definition: '"Hello!" or an equivalent greeting.',
          example: null,
          id: 1,
          meaning_id: 1,
          synonyms: [],
        },
        {
          antonyms: [],
          definition: 'To greet with "hello".',
          example: null,
          id: 2,
          meaning_id: 2,
          synonyms: [],
        },
        {
          antonyms: [],
          definition:
            "A greeting (salutation) said when meeting someone or acknowledging someone’s arrival or presence.",
          example: "Hello, everyone.",
          id: 3,
          meaning_id: 3,
          synonyms: [],
        },
        {
          antonyms: [],
          definition: "A greeting used when answering the telephone.",
          example: "Hello? How may I help you?",
          id: 4,
          meaning_id: 3,
          synonyms: [],
        },
        {
          antonyms: [],
          definition:
            "A call for response if it is not clear if anyone is present or listening, or if a telephone conversation may have been disconnected.",
          example: "Hello? Is anyone there?",
          id: 5,
          meaning_id: 3,
          synonyms: [],
        },
        {
          antonyms: [],
          definition:
            "Used sarcastically to imply that the person addressed or referred to has done something the speaker or writer considers to be foolish.",
          example:
            "You just tried to start your car with your cell phone. Hello?",
          id: 6,
          meaning_id: 3,
          synonyms: [],
        },
        {
          antonyms: [],
          definition: "An expression of puzzlement or discovery.",
          example: "Hello! What’s going on here?",
          id: 7,
          meaning_id: 3,
          synonyms: [],
        },
      ]);
    });
    it("creates phonetics after a word is created", async () => {
      const newWord = await wordQueries.createWord(json);

      const { rows } = await pool.query(
        `SELECT phonetics.* 
         FROM words 
         JOIN phonetics ON phonetics.word_id = words.id 
         WHERE words.id = $1`,
        [newWord.id]
      );
      expect(rows).toEqual([
        {
          audio:
            "https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3",
          id: 1,
          source_url: null,
          text: null,
          word_id: 1,
        },
        {
          audio:
            "https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3",
          id: 2,
          source_url: null,
          text: "/həˈləʊ/",
          word_id: 1,
        },
        {
          audio: "",
          id: 3,
          source_url: null,
          text: "/həˈloʊ/",
          word_id: 1,
        },
      ]);
    });
  });

  describe("wordExistsById", () => {
    it("returns true when word exists", async () => {
      const newWord = await wordQueries.createWord(json);

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
      await wordQueries.createWord(json);

      const wordExists = await wordQueries.wordExistsByWord(word);

      expect(wordExists).toBe(true);
    });

    it("returns true when the word exists in a different case", async () => {
      await wordQueries.createWord(json);

      const wordExists = await wordQueries.wordExistsByWord(word.toUpperCase());

      expect(wordExists).toBe(true);
    });

    it("returns false when word does not exist", async () => {
      const wordExists = await wordQueries.wordExistsByWord("nonexistent");

      expect(wordExists).toBe(false);
    });
  });

  describe("getWordByWord", () => {
    it("returns a word", async () => {
      await wordQueries.createWord(json);

      const newWord = await wordQueries.getWordByWord(word);

      expect(newWord).toEqual({
        created_at: expect.any(Date),
        id: 1,
        origin: null,
        phonetic: null,
        word: "hello",
      });
      expect(new Date(newWord.created_at).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it("returns word when the word exists in a different case", async () => {
      await wordQueries.createWord(json);

      const newWord = await wordQueries.getWordByWord(word.toUpperCase());

      expect(newWord).toEqual({
        created_at: expect.any(Date),
        id: 1,
        origin: null,
        phonetic: null,
        word: "hello",
      });
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
      const { id } = await wordQueries.createWord(json);

      const newWord = await wordQueries.getWordById(id);

      expect(newWord).toEqual({
        created_at: expect.any(Date),
        id: 1,
        origin: null,
        phonetic: null,
        word: "hello",
      });
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
