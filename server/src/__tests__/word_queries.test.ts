import { wordQueries } from "../db/word_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

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

describe("wordQueries", () => {
  describe("create", () => {
    it("creates word", async () => {
      const newWord = await wordQueries.create({ json });

      expect(newWord).toEqual({
        id: 1,
        details: json,
      });
    });

    it("returns word if the word was already created", async () => {
      await wordQueries.create({ json });
      const newWord = await wordQueries.create({ json });

      expect(newWord).toEqual({
        id: 1,
        details: json,
      });
    });
  });

  describe("getByWord", () => {
    it("returns a word", async () => {
      const newWord = await wordQueries.create({ json });

      const existingWord = await wordQueries.getByWord(word);

      expect(newWord).toEqual(existingWord);
    });

    it("returns word when the word exists in a different case", async () => {
      const newWord = await wordQueries.create({ json });

      const existingWord = await wordQueries.getByWord(word.toUpperCase());

      expect(newWord).toEqual(existingWord);
    });

    it("returns undefined when the word does not exist", async () => {
      const word = await wordQueries.getByWord("undefined");

      expect(word).toBeUndefined();
    });
  });
});
