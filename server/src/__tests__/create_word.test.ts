import express from "express";
import request from "supertest";

import { create_word } from "../controllers/word_controller";
import { userWordQueries } from "../db/user_word_queries";
import { wordQueries } from "../db/word_queries";
import { csv } from "../utils/csv";
import { http } from "../utils/http";

describe("create_word", () => {
  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/words", create_word);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("text word creation", () => {
    const response1 = [
      {
        word: "word",
        phonetic: "/wɜːd/",
        phonetics: [
          {
            text: "/wɜːd/",
            audio: "",
          },
          {
            text: "/wɝd/",
            audio:
              "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3",
            sourceUrl:
              "https://commons.wikimedia.org/w/index.php?curid=1197728",
            license: {
              name: "BY-SA 3.0",
              url: "https://creativecommons.org/licenses/by-sa/3.0",
            },
          },
        ],
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition:
                  "The smallest unit of language that has a particular meaning and can be expressed by itself; the smallest discrete, meaningful unit of language. (contrast morpheme.)",
                synonyms: [],
                antonyms: [],
              },
              {
                definition: "Something like such a unit of language:",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "The fact or act of speaking, as opposed to taking action. .",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "Something that someone said; a comment, utterance; speech.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "A watchword or rallying cry, a verbal signal (even when consisting of multiple words).",
                synonyms: [],
                antonyms: [],
                example: "mum's the word",
              },
              {
                definition: "A proverb or motto.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition: "News; tidings (used without an article).",
                synonyms: [],
                antonyms: [],
                example: "Have you had any word from John yet?",
              },
              {
                definition:
                  "An order; a request or instruction; an expression of will.",
                synonyms: [],
                antonyms: [],
                example: "Don't fire till I give the word",
              },
              {
                definition: "A promise; an oath or guarantee.",
                synonyms: ["promise"],
                antonyms: [],
                example: "I give you my word that I will be there on time.",
              },
              {
                definition: "A brief discussion or conversation.",
                synonyms: [],
                antonyms: [],
                example: "Can I have a word with you?",
              },
              {
                definition: "(in the plural) See words.",
                synonyms: [],
                antonyms: [],
                example:
                  "There had been words between him and the secretary about the outcome of the meeting.",
              },
              {
                definition:
                  "(sometimes Word) Communication from God; the message of the Christian gospel; the Bible, Scripture.",
                synonyms: ["Bible", "word of God"],
                antonyms: [],
                example:
                  "Her parents had lived in Botswana, spreading the word among the tribespeople.",
              },
              {
                definition: "(sometimes Word) Logos, Christ.",
                synonyms: ["God", "Logos"],
                antonyms: [],
              },
            ],
            synonyms: [
              "Bible",
              "word of God",
              "God",
              "Logos",
              "promise",
              "vocable",
            ],
            antonyms: [],
          },
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition:
                  "To say or write (something) using particular words; to phrase (something).",
                synonyms: ["express", "phrase", "put into words", "state"],
                antonyms: [],
                example: "I’m not sure how to word this letter to the council.",
              },
              {
                definition: "To flatter with words, to cajole.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition: "To ply or overpower with words.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition: "To conjure with a word.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "To speak, to use words; to converse, to discourse.",
                synonyms: [],
                antonyms: [],
              },
            ],
            synonyms: ["express", "phrase", "put into words", "state"],
            antonyms: [],
          },
          {
            partOfSpeech: "interjection",
            definitions: [
              {
                definition:
                  'Truth, indeed, that is the truth! The shortened form of the statement "My word is my bond."',
                synonyms: [],
                antonyms: [],
                example:
                  '"Yo, that movie was epic!" / "Word?" ("You speak the truth?") / "Word." ("I speak the truth.")',
              },
              {
                definition:
                  "(stereotypically) An abbreviated form of word up; a statement of the acknowledgment of fact with a hint of nonchalant approval.",
                synonyms: [],
                antonyms: [],
              },
            ],
            synonyms: [],
            antonyms: [],
          },
        ],
        license: {
          name: "CC BY-SA 3.0",
          url: "https://creativecommons.org/licenses/by-sa/3.0",
        },
        sourceUrls: ["https://en.wiktionary.org/wiki/word"],
      },
      {
        word: "word",
        phonetic: "/wɜːd/",
        phonetics: [
          {
            text: "/wɜːd/",
            audio: "",
          },
          {
            text: "/wɝd/",
            audio:
              "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3",
            sourceUrl:
              "https://commons.wikimedia.org/w/index.php?curid=1197728",
            license: {
              name: "BY-SA 3.0",
              url: "https://creativecommons.org/licenses/by-sa/3.0",
            },
          },
        ],
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition: "(except in set phrases) To be, become, betide.",
                synonyms: [],
                antonyms: [],
                example: "Well worth thee, me friend.",
              },
            ],
            synonyms: [],
            antonyms: [],
          },
        ],
        license: {
          name: "CC BY-SA 3.0",
          url: "https://creativecommons.org/licenses/by-sa/3.0",
        },
        sourceUrls: [
          "https://en.wiktionary.org/wiki/word",
          "https://en.wiktionary.org/wiki/worth",
        ],
      },
    ];
    const userId = "1";
    const wordId = "1";
    const userWord = {
      id: "1",
      user_id: userId,
      word_id: wordId,
      learned: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it("calls the functions to create a word and a user word", async () => {
      /* Mock implementation of the `getWordByWord` function:
      - This mock simulates a scenario where the queried word does not exist in the database.

      - Purpose: To test the behavior of the application when a word needs to be fetched from an external API and added to the database.

      - Example Use Case: Ensures that the system correctly handles the creation of a new word if it doesn't already exist in the database. */
      const getWordByWordMock = jest
        .spyOn(wordQueries, "getByWord")
        .mockImplementation(async () => {
          return undefined;
        });
      const httpGetMock = jest
        .spyOn(http, "get")
        .mockImplementation(async () => {
          return { json: response1, status: 200 };
        });
      const createWordMock = jest
        .spyOn(wordQueries, "create")
        .mockImplementation(async () => {
          return { details: response1, id: wordId, created_at: new Date() };
        });
      const createUserWordMock = jest
        .spyOn(userWordQueries, "create")
        .mockImplementation(async () => {
          return userWord;
        });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word: response1[0].word });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        word: {
          details: response1,
          id: wordId,
          created_at: expect.any(String),
        },
      });
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(response1[0].word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${response1[0].word}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(1);
      expect(createWordMock).toHaveBeenCalledWith({ json: response1 });
      expect(createUserWordMock).toHaveBeenCalledTimes(1);
      expect(createUserWordMock).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId,
        learned: false,
      });
    });

    it("creates the word if it is all uppercase", async () => {
      const getWordByWordMock = jest
        .spyOn(wordQueries, "getByWord")
        .mockImplementation(async () => {
          return undefined;
        });
      const httpGetMock = jest
        .spyOn(http, "get")
        .mockImplementation(async () => {
          return { json: response1, status: 200 };
        });
      const createWordMock = jest
        .spyOn(wordQueries, "create")
        .mockImplementation(async () => {
          return { details: response1, id: wordId, created_at: new Date() };
        });
      const createUserWordMock = jest
        .spyOn(userWordQueries, "create")
        .mockImplementation(async () => {
          return userWord;
        });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word: response1[0].word.toUpperCase() });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        word: {
          details: response1,
          id: wordId,
          created_at: expect.any(String),
        },
      });
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(response1[0].word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${response1[0].word}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(1);
      expect(createWordMock).toHaveBeenCalledWith({ json: response1 });
      expect(createUserWordMock).toHaveBeenCalledTimes(1);
      expect(createUserWordMock).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId,
        learned: false,
      });
    });

    it("does not create a word when the provided word is not a valid word", async () => {
      const word = "this is a sentence, not a word.";
      const message =
        "Sorry pal, we couldn't find definitions for the word you were looking for.";
      const getWordByWordMock = jest
        .spyOn(wordQueries, "getByWord")
        .mockImplementation(async () => {
          return undefined;
        });
      const httpGetMock = jest
        .spyOn(http, "get")
        .mockImplementation(async () => {
          return { json: { message }, status: 200 };
        });
      const createWordMock = jest
        .spyOn(wordQueries, "create")
        .mockImplementation(async () => {
          return { details: response1, id: wordId, created_at: new Date() };
        });
      const createUserWordMock = jest
        .spyOn(userWordQueries, "create")
        .mockImplementation(async () => {
          return userWord;
        });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message });
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).not.toHaveBeenCalled();
    });

    it("creates a user word if the word already exists", async () => {
      /* Mock implementation of the `getWordByWord` function:
      - This mock simulates a scenario where the queried word does not exist in the database.

      - Purpose: To test the behavior of the application when a word needs to be fetched from an external API and added to the database.

      - Example Use Case: Ensures that the system correctly handles the creation of a new word if it doesn't already exist in the database. */
      const getWordByWordMock = jest
        .spyOn(wordQueries, "getByWord")
        .mockImplementation(async () => {
          return {
            id: wordId,
            created_at: new Date(),
            updated_at: new Date(),
            details: response1,
          };
        });
      const httpGetMock = jest
        .spyOn(http, "get")
        .mockImplementation(async () => {
          return { json: response1, status: 200 };
        });
      const createWordMock = jest
        .spyOn(wordQueries, "create")
        .mockImplementation(async () => {
          return { details: response1, id: wordId, created_at: new Date() };
        });
      const createUserWordMock = jest
        .spyOn(userWordQueries, "create")
        .mockImplementation(async () => {
          return userWord;
        });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .send({ word: response1[0].word });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        word: {
          details: response1,
          id: wordId,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      });
      expect(getWordByWordMock).toHaveBeenCalledTimes(1);
      expect(getWordByWordMock).toHaveBeenCalledWith(response1[0].word);
      expect(httpGetMock).not.toHaveBeenCalled();
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).toHaveBeenCalledTimes(1);
      expect(createUserWordMock).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId,
        learned: false,
      });
    });
  });

  describe("csv word creation", () => {
    const response1 = [
      {
        word: "dispensation",
        phonetic: "/dɪsˌpɛnˈseɪʃən/",
        phonetics: [
          {
            text: "/dɪsˌpɛnˈseɪʃən/",
            audio:
              "https://api.dictionaryapi.dev/media/pronunciations/en/dispensation-uk.mp3",
            sourceUrl:
              "https://commons.wikimedia.org/w/index.php?curid=90913126",
            license: {
              name: "BY-SA 4.0",
              url: "https://creativecommons.org/licenses/by-sa/4.0",
            },
          },
        ],
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition:
                  "The act of dispensing or dealing out; distribution; often used of the distribution of good and evil by God to man, or more generically, of the acts and modes of his administration.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "That which is dispensed, dealt out, or appointed; that which is enjoined or bestowed",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "A system of principles, promises, and rules ordained and administered; scheme; economy; as, the Patriarchal, Mosaic, and Christian dispensations.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "The relaxation of a law in a particular case; permission to do something forbidden, or to omit doing something enjoined; specifically, in the Roman Catholic Church, exemption from some ecclesiastical law or obligation to God which a man has incurred of his own free will (oaths, vows, etc.).",
                synonyms: [],
                antonyms: [],
              },
            ],
            synonyms: [],
            antonyms: [],
          },
        ],
        license: {
          name: "CC BY-SA 3.0",
          url: "https://creativecommons.org/licenses/by-sa/3.0",
        },
        sourceUrls: ["https://en.wiktionary.org/wiki/dispensation"],
      },
    ];

    const response2 = [
      {
        word: "patronage",
        phonetic: "/ˈpeɪtɹənɪd͡ʒ/",
        phonetics: [
          {
            text: "/ˈpeɪtɹənɪd͡ʒ/",
            audio: "",
          },
        ],
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition:
                  "The act of providing approval and support; backing; championship.",
                synonyms: [],
                antonyms: [],
                example:
                  "His vigorous patronage of the conservatives got him in trouble with progressives.",
              },
              {
                definition: "Customers collectively; clientele; business.",
                synonyms: [],
                antonyms: [],
                example: "The restaurant had an upper-class patronage.",
              },
              {
                definition:
                  "A communication that indicates lack of respect by patronizing the recipient; condescension; disdain.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "Granting favours or giving contracts or making appointments to office in return for political support.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition: "Guardianship, as of a saint; tutelary care.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition: "The right of nomination to political office.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "The right of presentation to church or ecclesiastical benefice; advowson.",
                synonyms: [],
                antonyms: [],
              },
            ],
            synonyms: [],
            antonyms: [],
          },
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition: "To support by being a patron of.",
                synonyms: [],
                antonyms: [],
              },
              {
                definition:
                  "To be a regular customer or client of; to patronize",
                synonyms: ["keep going", "support"],
                antonyms: [],
              },
            ],
            synonyms: ["keep going", "support"],
            antonyms: [],
          },
        ],
        license: {
          name: "CC BY-SA 3.0",
          url: "https://creativecommons.org/licenses/by-sa/3.0",
        },
        sourceUrls: ["https://en.wiktionary.org/wiki/patronage"],
      },
    ];
    const userId = "1";
    const wordId1 = "1";
    const wordId2 = "2";
    const userWord1 = {
      id: "1",
      user_id: userId,
      word_id: wordId1,
      learned: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const userWord2 = {
      id: "1",
      user_id: userId,
      word_id: wordId2,
      learned: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it("creates words and user words", async () => {
      const getWordByWordMock = jest
        .spyOn(wordQueries, "getByWord")
        .mockImplementation(async () => {
          return undefined;
        });
      const httpGetMock = jest
        .spyOn(http, "get")
        .mockImplementationOnce(async () => {
          return { json: response1, status: 200 };
        });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: response2, status: 200 };
      });
      const createWordMock = jest
        .spyOn(wordQueries, "create")
        .mockImplementationOnce(async () => {
          return { details: response1, id: wordId1, created_at: new Date() };
        });
      createWordMock.mockImplementationOnce(async () => {
        return { details: response2, id: wordId2, created_at: new Date() };
      });
      const createUserWordMock = jest
        .spyOn(userWordQueries, "create")
        .mockImplementationOnce(async () => {
          return userWord1;
        });
      createUserWordMock.mockImplementationOnce(async () => {
        return userWord2;
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/column_words.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "2 words have been created." });
      expect(getWordByWordMock).toHaveBeenCalledTimes(2);
      expect(getWordByWordMock).toHaveBeenCalledWith(response1[0].word);
      expect(getWordByWordMock).toHaveBeenCalledWith(response2[0].word);
      expect(httpGetMock).toHaveBeenCalledTimes(2);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${response1[0].word}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${response2[0].word}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(2);
      expect(createWordMock).toHaveBeenCalledWith({ json: response1 });
      expect(createWordMock).toHaveBeenCalledWith({ json: response2 });
      expect(createUserWordMock).toHaveBeenCalledTimes(2);
      expect(createUserWordMock).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId1,
        learned: false,
      });
      expect(createUserWordMock).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId2,
        learned: false,
      });
    });

    it("creates user words even when any of words in the csv file already exist in the database", async () => {
      const getWordByWordMock = jest
        .spyOn(wordQueries, "getByWord")
        .mockImplementationOnce(async () => {
          return { details: response1, id: wordId1, created_at: new Date() };
        });
      getWordByWordMock.mockImplementationOnce(async () => {
        return undefined;
      });
      const httpGetMock = jest
        .spyOn(http, "get")
        .mockImplementationOnce(async () => {
          return { json: response2, status: 200 };
        });
      const createWordMock = jest
        .spyOn(wordQueries, "create")
        .mockImplementationOnce(async () => {
          return { details: response2, id: wordId2, created_at: new Date() };
        });
      const createUserWordMock = jest
        .spyOn(userWordQueries, "create")
        .mockImplementationOnce(async () => {
          return userWord1;
        });
      createUserWordMock.mockImplementationOnce(async () => {
        return userWord2;
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/column_words.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "2 words have been created." });
      expect(getWordByWordMock).toHaveBeenCalledTimes(2);
      expect(getWordByWordMock).toHaveBeenCalledWith(response1[0].word);
      expect(getWordByWordMock).toHaveBeenCalledWith(response2[0].word);
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${response2[0].word}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(1);
      expect(createWordMock).toHaveBeenCalledWith({ json: response2 });
      expect(createUserWordMock).toHaveBeenCalledTimes(2);
      expect(createUserWordMock).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId1,
        learned: false,
      });
      expect(createUserWordMock).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId2,
        learned: false,
      });
    });

    it("creates no words and user words when the csv file is empty", async () => {
      const getWordByWordMock = jest.spyOn(wordQueries, "getByWord");
      const httpGetMock = jest.spyOn(http, "get");
      const createWordMock = jest.spyOn(wordQueries, "create");
      const createUserWordMock = jest.spyOn(userWordQueries, "create");

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/empty.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "0 words have been created because the CSV file is empty.",
      });
      expect(getWordByWordMock).not.toHaveBeenCalled();
      expect(httpGetMock).not.toHaveBeenCalled();
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).not.toHaveBeenCalled();
    });

    it("creates no valid words when there are any invalid words in the csv", async () => {
      const response1 = [
        {
          word: "valid",
          phonetic: "/ˈvælɪd/",
          phonetics: [
            {
              text: "/ˈvælɪd/",
              audio:
                "https://api.dictionaryapi.dev/media/pronunciations/en/valid-uk.mp3",
              sourceUrl:
                "https://commons.wikimedia.org/w/index.php?curid=94709661",
              license: {
                name: "BY-SA 4.0",
                url: "https://creativecommons.org/licenses/by-sa/4.0",
              },
            },
          ],
          meanings: [
            {
              partOfSpeech: "adjective",
              definitions: [
                {
                  definition: "Well grounded or justifiable, pertinent.",
                  synonyms: [],
                  antonyms: [],
                  example:
                    "I will believe him as soon as he offers a valid answer.",
                },
                {
                  definition:
                    "Acceptable, proper or correct; in accordance with the rules.",
                  synonyms: [],
                  antonyms: [],
                  example: "A valid format for the date is MM/DD/YY.",
                },
                {
                  definition:
                    "Related to the current topic, or presented within context, relevant.",
                  synonyms: [],
                  antonyms: [],
                },
                {
                  definition:
                    "Of a formula or system: such that it evaluates to true regardless of the input values.",
                  synonyms: [],
                  antonyms: [],
                },
                {
                  definition:
                    "Of an argument: whose conclusion is always true whenever its premises are true.",
                  synonyms: [],
                  antonyms: [],
                  example:
                    "An argument is valid if and only if the set consisting of both (1) all of its premises and (2) the contradictory of its conclusion is inconsistent.",
                },
                {
                  definition: "Effective.",
                  synonyms: [],
                  antonyms: [],
                  example:
                    "He is a priest now: although his ordination was contrary to the law of the church, it was still valid.",
                },
              ],
              synonyms: [],
              antonyms: ["invalid", "nonvalid"],
            },
          ],
          license: {
            name: "CC BY-SA 3.0",
            url: "https://creativecommons.org/licenses/by-sa/3.0",
          },
          sourceUrls: ["https://en.wiktionary.org/wiki/valid"],
        },
      ];
      const word2 = "not a valid word";
      const getWordByWordMock = jest
        .spyOn(wordQueries, "getByWord")
        .mockImplementation(async () => {
          return undefined;
        });
      const httpGetMock = jest
        .spyOn(http, "get")
        .mockImplementationOnce(async () => {
          return { json: response1, status: 200 };
        });
      httpGetMock.mockImplementationOnce(async () => {
        return { json: { message: "Invalid word." }, status: 400 };
      });
      const createWordMock = jest
        .spyOn(wordQueries, "create")
        .mockImplementationOnce(async () => {
          return { details: response1, id: wordId1, created_at: new Date() };
        });
      const createUserWordMock = jest
        .spyOn(userWordQueries, "create")
        .mockImplementationOnce(async () => {
          return userWord1;
        });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/some_valid.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: `You have value(s) in your CSV file that are not words. Please change them to valid word(s) and re-import your words: ${word2}`,
      });
      expect(getWordByWordMock).toHaveBeenCalledTimes(2);
      expect(getWordByWordMock).toHaveBeenCalledWith(response1[0].word);
      expect(getWordByWordMock).toHaveBeenCalledWith(word2);
      expect(httpGetMock).toHaveBeenCalledTimes(2);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${response1[0].word}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word2}`
      );
      expect(createWordMock).toHaveBeenCalledTimes(1);
      expect(createWordMock).toHaveBeenCalledWith({ json: response1 });
      expect(createUserWordMock).toHaveBeenCalledTimes(1);
      expect(createUserWordMock).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId1,
        learned: false,
      });
    });

    it("creates no words when no valid words in the csv file exist", async () => {
      const phrases = ["a man", "a plan", "a canal"];
      const getWordByWordMock = jest
        .spyOn(wordQueries, "getByWord")
        .mockImplementation(async () => {
          return undefined;
        });
      const httpGetMock = jest
        .spyOn(http, "get")
        .mockImplementation(async () => {
          return { json: { message: "Invalid word." }, status: 400 };
        });
      const createWordMock = jest.spyOn(wordQueries, "create");
      const createUserWordMock = jest.spyOn(userWordQueries, "create");

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/phrases.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: `You have value(s) in your CSV file that are not words. Please change them to valid word(s) and re-import your words: ${phrases[0]}, ${phrases[1]}, and ${phrases[2]}`,
      });
      expect(getWordByWordMock).toHaveBeenCalledTimes(3);
      expect(getWordByWordMock).toHaveBeenCalledWith(phrases[0]);
      expect(getWordByWordMock).toHaveBeenCalledWith(phrases[1]);
      expect(getWordByWordMock).toHaveBeenCalledWith(phrases[2]);
      expect(httpGetMock).toHaveBeenCalledTimes(3);
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${phrases[0]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${phrases[1]}`
      );
      expect(httpGetMock).toHaveBeenCalledWith(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${phrases[2]}`
      );
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).not.toHaveBeenCalled();
    });

    it("sends an error message when the CSV parser returns an error", async () => {
      const getWordByWordMock = jest.spyOn(wordQueries, "getByWord");
      const httpGetMock = jest.spyOn(http, "get");
      const createWordMock = jest.spyOn(wordQueries, "create");
      const createUserWordMock = jest.spyOn(userWordQueries, "create");
      const message = "CSV file was parsed incorrectly.";
      jest.spyOn(csv, "read").mockImplementationOnce(async () => {
        return {
          records: [],
          count: 0,
          error: message,
        };
      });

      const response = await request(app)
        .post(`/api/users/${userId}/words`)
        .set("Accept", "application/json")
        .attach("csv", "src/csv/incorrect.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message });
      expect(getWordByWordMock).not.toHaveBeenCalled();
      expect(httpGetMock).not.toHaveBeenCalled();
      expect(createWordMock).not.toHaveBeenCalled();
      expect(createUserWordMock).not.toHaveBeenCalled();
    });
  });

  it("returns 400 status code when neither a word or csv file was provided", async () => {
    const userId = "1";
    const response = await request(app)
      .post(`/api/users/${userId}/words`)
      .set("Accept", "application/json")
      .send({});

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Word or CSV file is required.",
          path: "word",
          type: "field",
          value: "",
        },
      ],
    });
  });
});
