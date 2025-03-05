import express from "express";
import request from "supertest";

import { create_user_word } from "../controllers/user_word_controller";
import { userWordQueries } from "../db/user_word_queries";
import { wordQueries } from "../db/word_queries";
import { csv } from "../utils/csv";
import { http } from "common";
import { WORD_MAX } from "common";
import { API_ENDPOINTS } from "../utils/api";
import { imageQueries } from "../db/image_queries";

const app = express();
app.use(express.json());
app.post("/api/users/:userId/userWords", create_user_word);

const status = 200;

const imagesResponse = {
  query: {
    pages: {
      "20705108": {
        title: "File:Blue pencil.svg",
        imageinfo: [
          {
            comment:
              "Colors aligned with Wikimedia color palette ([[phab:M82]])",
            url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Blue_pencil.svg",
            descriptionurl:
              "https://commons.wikimedia.org/wiki/File:Blue_pencil.svg",
          },
        ],
      },
      "83012544": {
        title: "File:GNOME Video icon 2019.svg",
        imageinfo: [
          {
            comment: undefined,
            url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/GNOME_Video_icon_2019.svg",
            descriptionurl:
              "https://commons.wikimedia.org/wiki/File:GNOME_Video_icon_2019.svg",
          },
        ],
      },
    },
  },
};
const wordId = 1;
const [page1, page2] = Object.values(imagesResponse.query.pages);
const image1 = {
  id: 1,
  url: page1.imageinfo[0].url,
  descriptionurl: page1.imageinfo[0].descriptionurl,
  comment: page1.imageinfo[0].comment ?? page1.title,
  word_id: wordId,
};
const image2 = {
  id: 2,
  url: page2.imageinfo[0].url,
  descriptionurl: page2.imageinfo[0].descriptionurl,
  comment: page2.imageinfo[0].comment ?? page2.title,
  word_id: wordId,
};
const textWord = "word";
const wordResponse = [
  {
    word: textWord,
    phonetics: [
      {
        text: "/wɜːd/",
        audio: "",
      },
      {
        text: "/wɝd/",
        audio:
          "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=1197728",
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
        ],
      },
    ],
  },
];
const userId = 1;
const userWord = {
  id: 1,
  user_id: userId,
  word_id: wordId,
  learned: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe("create_user_word", () => {
  const mockGetWordByWord = jest
    .spyOn(wordQueries, "getByWord")
    .mockResolvedValue(undefined);
  const mockGetHttp = jest.spyOn(http, "get");
  const mockCreateWord = jest.spyOn(wordQueries, "create");
  const mockCreateImage = jest.spyOn(imageQueries, "create");
  const mockCreateUserWord = jest.spyOn(userWordQueries, "create");

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("text word creation", () => {
    it("calls the functions to create a word and a user word", async () => {
      mockGetHttp
        .mockResolvedValueOnce({ json: wordResponse, status })
        .mockResolvedValueOnce({ json: imagesResponse, status });
      mockCreateWord.mockResolvedValue({ details: wordResponse, id: wordId });
      mockCreateImage
        .mockResolvedValueOnce(image1)
        .mockResolvedValueOnce(image2);
      mockCreateUserWord.mockResolvedValue(userWord);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .send({ word: textWord });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        word: {
          details: wordResponse,
          id: wordId,
        },
      });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord);
      expect(mockGetHttp).toHaveBeenCalledTimes(2);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord),
      });
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse });
      expect(mockCreateImage).toHaveBeenCalledTimes(2);
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image1.url,
        descriptionurl: image1.descriptionurl,
        comment: image1.comment,
        word_id: image1.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image2.url,
        descriptionurl: image2.descriptionurl,
        comment: image2.comment,
        word_id: image2.word_id,
      });
      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId,
        learned: false,
      });
    });

    it("calls the functions to create a word when more than 4 images are fetched", async () => {
      const newImagesResponse = {
        query: {
          pages: {
            ...imagesResponse.query.pages,
            "89492575": {
              title: "File:GNOME Videos 3.34 with its preferences.png",
              imageinfo: [
                {
                  comment:
                    "Uploaded a work by {{w|The GNOME Project}} from screen-shot taken by [[User:Editor-1]] with UploadWizard",
                  url: "https://upload.wikimedia.org/wikipedia/commons/1/16/GNOME_Videos_3.34_with_its_preferences.png",
                  descriptionurl:
                    "https://commons.wikimedia.org/wiki/File:GNOME_Videos_3.34_with_its_preferences.png",
                },
              ],
            },
            "20650832": {
              title: "File:Wikidata-logo.svg",
              imageinfo: [
                {
                  comment: "omg! forgot one more point",
                  url: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg",
                  descriptionurl:
                    "https://commons.wikimedia.org/wiki/File:Wikidata-logo.svg",
                },
              ],
            },
            "10337301": {
              title: "File:Wikipedia-logo-v2.svg",
              imageinfo: [
                {
                  comment:
                    "Optimized code; Valid SVG; Works fine in all browsers and editors; Created with Adobe Illustrator and manual code tweaking;",
                  url: "https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg",
                  descriptionurl:
                    "https://commons.wikimedia.org/wiki/File:Wikipedia-logo-v2.svg",
                },
              ],
            },
          },
        },
      };
      const [, , page3, page4] = Object.values(newImagesResponse.query.pages);
      const image3 = {
        id: 3,
        url: page3.imageinfo[0].url,
        descriptionurl: page3.imageinfo[0].descriptionurl,
        comment: page3.imageinfo[0].comment ?? page3.title,
        word_id: wordId,
      };
      const image4 = {
        id: 4,
        url: page4.imageinfo[0].url,
        descriptionurl: page4.imageinfo[0].descriptionurl,
        comment: page4.imageinfo[0].comment ?? page4.title,
        word_id: wordId,
      };
      mockGetHttp
        .mockResolvedValueOnce({ json: wordResponse, status })
        .mockResolvedValueOnce({
          json: newImagesResponse,
          status,
        });
      mockCreateWord.mockResolvedValue({ details: wordResponse, id: wordId });
      mockCreateImage
        .mockResolvedValueOnce(image1)
        .mockResolvedValueOnce(image2)
        .mockResolvedValueOnce(image3)
        .mockResolvedValueOnce(image4);
      mockCreateUserWord.mockResolvedValue(userWord);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .send({ word: textWord });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        word: {
          details: wordResponse,
          id: wordId,
        },
      });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord);
      expect(mockGetHttp).toHaveBeenCalledTimes(2);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord),
      });
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse });
      expect(mockCreateImage).toHaveBeenCalledTimes(4);
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image1.url,
        descriptionurl: image1.descriptionurl,
        comment: image1.comment,
        word_id: image1.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image2.url,
        descriptionurl: image2.descriptionurl,
        comment: image2.comment,
        word_id: image2.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image3.url,
        descriptionurl: image3.descriptionurl,
        comment: image3.comment,
        word_id: image3.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image4.url,
        descriptionurl: image4.descriptionurl,
        comment: image4.comment,
        word_id: image4.word_id,
      });
      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId,
        learned: false,
      });
    });

    it("creates the word if it is all uppercase", async () => {
      mockGetHttp
        .mockResolvedValueOnce({ json: wordResponse, status })
        .mockResolvedValueOnce({ json: imagesResponse, status });
      mockCreateWord.mockResolvedValue({ details: wordResponse, id: wordId });
      mockCreateImage
        .mockResolvedValueOnce(image1)
        .mockResolvedValueOnce(image2);
      mockCreateUserWord.mockResolvedValue(userWord);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .send({ word: textWord });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        word: {
          details: wordResponse,
          id: wordId,
        },
      });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord);
      expect(mockGetHttp).toHaveBeenCalledTimes(2);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord),
      });
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse });
      expect(mockCreateImage).toHaveBeenCalledTimes(2);
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image1.url,
        descriptionurl: image1.descriptionurl,
        comment: image1.comment,
        word_id: image1.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image2.url,
        descriptionurl: image2.descriptionurl,
        comment: image2.comment,
        word_id: image2.word_id,
      });
      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId,
        learned: false,
      });
    });

    it(`does not create a word when the provided word is greater than ${WORD_MAX} characters`, async () => {
      const word = new Array(WORD_MAX + 1).fill("a").join("");

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .send({ word });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'word' cannot be greater than 45 characters.",
            path: "word",
            type: "field",
            value: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          },
        ],
      });
    });

    it("does not create a word when the provided word is not a valid word", async () => {
      const textWord = "this is a sentence, not a word.";
      const message =
        "Sorry pal, we couldn't find definitions for the word you were looking for.";
      mockGetHttp.mockResolvedValue({ json: { message }, status: 200 });
      mockCreateWord.mockResolvedValue({ details: wordResponse, id: wordId });
      mockCreateImage
        .mockResolvedValueOnce(image1)
        .mockResolvedValueOnce(image2);
      mockCreateUserWord.mockResolvedValue(userWord);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .send({ word: textWord });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord);
      expect(mockGetHttp).toHaveBeenCalledTimes(1);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord),
      });
      expect(mockCreateImage).not.toHaveBeenCalled();
      expect(mockCreateWord).not.toHaveBeenCalled();
      expect(mockCreateUserWord).not.toHaveBeenCalled();
    });

    it("creates a user word if the word already exists", async () => {
      mockGetWordByWord.mockResolvedValue({
        id: wordId,
        details: wordResponse,
      });
      mockCreateUserWord.mockResolvedValue(userWord);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .send({ word: textWord });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        word: {
          details: wordResponse,
          id: wordId,
        },
      });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord);
      expect(mockGetHttp).not.toHaveBeenCalled();
      expect(mockCreateImage).not.toHaveBeenCalled();
      expect(mockCreateWord).not.toHaveBeenCalled();
      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId,
        learned: false,
      });
    });
  });

  describe("csv word creation", () => {
    const textWord1 = "dispensation";
    const wordResponse1 = [
      {
        word: textWord1,
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
            ],
            synonyms: [],
            antonyms: [],
          },
        ],
      },
    ];

    const textWord2 = "patronage";
    const wordResponse2 = [
      {
        word: textWord2,
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
            ],
            synonyms: [],
            antonyms: [],
          },
        ],
      },
    ];
    const imagesResponse1 = imagesResponse;
    const imagesResponse2 = {
      query: {
        pages: {
          "89492575": {
            title: "File:GNOME Videos 3.34 with its preferences.png",
            imageinfo: [
              {
                comment:
                  "Uploaded a work by {{w|The GNOME Project}} from screen-shot taken by [[User:Editor-1]] with UploadWizard",
                url: "https://upload.wikimedia.org/wikipedia/commons/1/16/GNOME_Videos_3.34_with_its_preferences.png",
                descriptionurl:
                  "https://commons.wikimedia.org/wiki/File:GNOME_Videos_3.34_with_its_preferences.png",
              },
            ],
          },
          "20650832": {
            title: "File:Wikidata-logo.svg",
            imageinfo: [
              {
                comment: "omg! forgot one more point",
                url: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg",
                descriptionurl:
                  "https://commons.wikimedia.org/wiki/File:Wikidata-logo.svg",
              },
            ],
          },
          "10337301": {
            title: "File:Wikipedia-logo-v2.svg",
            imageinfo: [
              {
                comment:
                  "Optimized code; Valid SVG; Works fine in all browsers and editors; Created with Adobe Illustrator and manual code tweaking;",
                url: "https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg",
                descriptionurl:
                  "https://commons.wikimedia.org/wiki/File:Wikipedia-logo-v2.svg",
              },
            ],
          },
        },
      },
    };
    const userId = 1;
    const wordId1 = wordId;
    const wordId2 = 2;
    const userWord1 = {
      id: 1,
      user_id: userId,
      word_id: wordId1,
      learned: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const userWord2 = {
      id: 1,
      user_id: userId,
      word_id: wordId2,
      learned: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const [page3, page4, page5] = Object.values(imagesResponse2.query.pages);
    const image3 = {
      id: 3,
      url: page3.imageinfo[0].url,
      descriptionurl: page3.imageinfo[0].descriptionurl,
      comment: page3.imageinfo[0].comment ?? page3.title,
      word_id: wordId2,
    };
    const image4 = {
      id: 4,
      url: page4.imageinfo[0].url,
      descriptionurl: page4.imageinfo[0].descriptionurl,
      comment: page4.imageinfo[0].comment ?? page4.title,
      word_id: wordId2,
    };
    const image5 = {
      id: 5,
      url: page5.imageinfo[0].url,
      descriptionurl: page5.imageinfo[0].descriptionurl,
      comment: page5.imageinfo[0].comment ?? page5.title,
      word_id: wordId2,
    };
    const mockGetHttp = jest.spyOn(http, "get");
    const mockCreateWord = jest.spyOn(wordQueries, "create");
    const mockCreateImage = jest.spyOn(imageQueries, "create");
    const mockCreateUserWord = jest.spyOn(userWordQueries, "create");

    it("creates words and user words", async () => {
      mockGetHttp
        .mockResolvedValueOnce({ json: wordResponse1, status })
        .mockResolvedValueOnce({ json: imagesResponse1, status })
        .mockResolvedValueOnce({ json: wordResponse2, status })
        .mockResolvedValueOnce({ json: imagesResponse2, status });
      mockCreateWord
        .mockResolvedValueOnce({
          details: wordResponse1,
          id: wordId1,
        })
        .mockResolvedValueOnce({
          details: wordResponse2,
          id: wordId2,
        });
      mockCreateImage
        .mockResolvedValueOnce(image1)
        .mockResolvedValueOnce(image2)
        .mockResolvedValueOnce(image3)
        .mockResolvedValueOnce(image4)
        .mockResolvedValueOnce(image5);
      mockCreateUserWord
        .mockResolvedValueOnce(userWord1)
        .mockResolvedValueOnce(userWord2);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .attach("csv", "src/__tests__/csv/column_words.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "2 words have been created." });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(2);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord2);
      expect(mockGetHttp).toHaveBeenCalledTimes(4);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord1),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord1),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord2),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord1),
      });
      expect(mockCreateWord).toHaveBeenCalledTimes(2);
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse1 });
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse2 });
      expect(mockCreateImage).toHaveBeenCalledTimes(5);
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image1.url,
        descriptionurl: image1.descriptionurl,
        comment: image1.comment,
        word_id: image1.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image2.url,
        descriptionurl: image2.descriptionurl,
        comment: image2.comment,
        word_id: image2.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image3.url,
        descriptionurl: image3.descriptionurl,
        comment: image3.comment,
        word_id: image3.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image4.url,
        descriptionurl: image4.descriptionurl,
        comment: image4.comment,
        word_id: image4.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image5.url,
        descriptionurl: image5.descriptionurl,
        comment: image5.comment,
        word_id: image5.word_id,
      });
      expect(mockCreateUserWord).toHaveBeenCalledTimes(2);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId1,
        learned: false,
      });
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId2,
        learned: false,
      });
    });

    it("creates words and user words when more than 4 images are available", async () => {
      const imagesResponse3 = {
        query: {
          pages: {
            ...imagesResponse1.query.pages,
            ...imagesResponse2.query.pages,
          },
        },
      }; // 5 images, only 4 images will be used
      mockGetHttp
        .mockResolvedValueOnce({ json: wordResponse1, status })
        .mockResolvedValueOnce({ json: imagesResponse3, status })
        .mockResolvedValueOnce({ json: wordResponse2, status })
        .mockResolvedValueOnce(
          { json: imagesResponse2, status } // 3 images
        );
      mockCreateWord
        .mockResolvedValueOnce({
          details: wordResponse1,
          id: wordId1,
        })
        .mockResolvedValueOnce({
          details: wordResponse2,
          id: wordId2,
        });
      mockCreateImage
        .mockResolvedValueOnce(image1)
        .mockResolvedValueOnce(image2)
        .mockResolvedValueOnce(image3)
        .mockResolvedValueOnce(image4)
        .mockResolvedValueOnce(image3)
        .mockResolvedValueOnce(image4)
        .mockResolvedValueOnce(image5);
      mockCreateUserWord
        .mockResolvedValueOnce(userWord1)
        .mockResolvedValueOnce(userWord2);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .attach("csv", "src/__tests__/csv/column_words.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "2 words have been created." });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(2);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord2);
      expect(mockGetHttp).toHaveBeenCalledTimes(4);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord1),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord1),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord2),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord2),
      });
      expect(mockCreateWord).toHaveBeenCalledTimes(2);
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse1 });
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse2 });
      expect(mockCreateImage).toHaveBeenCalledTimes(7);
      // not called 8 times. imageResponse3 has 5 images (one is ignored because it is over the limit), imageResponse2 has 3
      expect(mockCreateUserWord).toHaveBeenCalledTimes(2);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId1,
        learned: false,
      });
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId2,
        learned: false,
      });
    });

    it("creates words and user words when 0 images are available", async () => {
      const imagesResponse3 = { query: { pages: {} } }; // 5 images
      mockGetHttp
        .mockResolvedValueOnce({ json: wordResponse1, status })
        .mockResolvedValueOnce({ json: imagesResponse3, status })
        .mockResolvedValueOnce({ json: wordResponse2, status })
        .mockResolvedValueOnce({ json: imagesResponse2, status });
      mockCreateWord
        .mockResolvedValueOnce({
          details: wordResponse1,
          id: wordId1,
        })
        .mockResolvedValueOnce({
          details: wordResponse2,
          id: wordId2,
        });
      mockCreateImage
        .mockResolvedValueOnce(image3)
        .mockResolvedValueOnce(image4)
        .mockResolvedValueOnce(image5);
      mockCreateUserWord
        .mockResolvedValueOnce(userWord1)
        .mockResolvedValueOnce(userWord2);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .attach("csv", "src/__tests__/csv/column_words.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "2 words have been created." });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(2);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord2);
      expect(mockGetHttp).toHaveBeenCalledTimes(4);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord1),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord1),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord2),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord2),
      });
      expect(mockCreateWord).toHaveBeenCalledTimes(2);
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse1 });
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse2 });
      expect(mockCreateImage).toHaveBeenCalledTimes(3);
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image3.url,
        descriptionurl: image3.descriptionurl,
        comment: image3.comment,
        word_id: image3.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image4.url,
        descriptionurl: image4.descriptionurl,
        comment: image4.comment,
        word_id: image4.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image5.url,
        descriptionurl: image5.descriptionurl,
        comment: image5.comment,
        word_id: image5.word_id,
      });
      expect(mockCreateUserWord).toHaveBeenCalledTimes(2);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId1,
        learned: false,
      });
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId2,
        learned: false,
      });
    });

    it("creates user words even when any of words in the csv file already exist in the database", async () => {
      mockGetWordByWord
        .mockResolvedValueOnce({
          details: wordResponse1,
          id: wordId1,
        })
        .mockResolvedValueOnce(undefined);
      mockGetHttp
        .mockResolvedValueOnce({ json: wordResponse2, status })
        .mockResolvedValueOnce({ json: imagesResponse2, status });
      mockCreateWord.mockResolvedValueOnce({
        details: wordResponse2,
        id: wordId2,
      });
      mockCreateImage
        .mockResolvedValueOnce(image1)
        .mockResolvedValueOnce(image2)
        .mockResolvedValueOnce(image3)
        .mockResolvedValueOnce(image4)
        .mockResolvedValueOnce(image5);
      mockCreateUserWord
        .mockResolvedValueOnce(userWord1)
        .mockResolvedValueOnce(userWord2);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .attach("csv", "src/__tests__/csv/column_words.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "2 words have been created." });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(2);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord2);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord2);
      expect(mockGetHttp).toHaveBeenCalledTimes(2);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord2),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord2),
      });
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse2 });
      expect(mockCreateImage).toHaveBeenCalledTimes(3);
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image3.url,
        descriptionurl: image3.descriptionurl,
        comment: image3.comment,
        word_id: image3.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image4.url,
        descriptionurl: image4.descriptionurl,
        comment: image4.comment,
        word_id: image4.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image5.url,
        descriptionurl: image5.descriptionurl,
        comment: image5.comment,
        word_id: image5.word_id,
      });
      expect(mockCreateUserWord).toHaveBeenCalledTimes(2);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId1,
        learned: false,
      });
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId2,
        learned: false,
      });
    });

    it("creates no words and user words when the csv file is empty", async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .attach("csv", "src/__tests__/csv/empty.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "0 words have been created because the CSV file is empty.",
      });
      expect(mockGetWordByWord).not.toHaveBeenCalled();
      expect(mockGetHttp).not.toHaveBeenCalled();
      expect(mockCreateWord).not.toHaveBeenCalled();
      expect(mockCreateImage).not.toHaveBeenCalled();
      expect(mockCreateUserWord).not.toHaveBeenCalled();
    });

    it("creates no valid words when there are any invalid words in the csv", async () => {
      const textWord1 = "valid";
      const wordResponse1 = [
        {
          word: textWord1,
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
              ],
              synonyms: [],
              antonyms: ["invalid", "nonvalid"],
            },
          ],
        },
      ];
      const textWord2 = "not a valid word";
      mockGetHttp
        .mockResolvedValueOnce({ json: wordResponse1, status })
        .mockResolvedValueOnce({ json: imagesResponse1, status })
        .mockResolvedValueOnce({
          json: { message: "Invalid word." },
          status: 400,
        });
      mockCreateWord
        .mockResolvedValueOnce({
          details: wordResponse1,
          id: wordId1,
        })
        .mockResolvedValueOnce({
          details: wordResponse2,
          id: wordId2,
        });
      mockCreateImage
        .mockResolvedValueOnce(image1)
        .mockResolvedValueOnce(image2)
        .mockResolvedValueOnce(image3)
        .mockResolvedValueOnce(image4)
        .mockResolvedValueOnce(image5);
      mockCreateUserWord
        .mockResolvedValueOnce(userWord1)
        .mockResolvedValueOnce(userWord2);

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .attach("csv", "src/__tests__/csv/some_valid.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: `You have value(s) in your CSV file that are not words. Please change them to valid word(s) and re-import your words: ${textWord2}`,
      });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(2);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord1);
      expect(mockGetWordByWord).toHaveBeenCalledWith(textWord2);
      expect(mockGetHttp).toHaveBeenCalledTimes(3);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord1),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.images(textWord1),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(textWord2),
      });
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
      expect(mockCreateWord).toHaveBeenCalledWith({ json: wordResponse1 });
      expect(mockCreateImage).toHaveBeenCalledTimes(2);
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image1.url,
        descriptionurl: image1.descriptionurl,
        comment: image1.comment,
        word_id: image1.word_id,
      });
      expect(mockCreateImage).toHaveBeenCalledWith({
        url: image2.url,
        descriptionurl: image2.descriptionurl,
        comment: image2.comment,
        word_id: image2.word_id,
      });
      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({
        user_id: userId,
        word_id: wordId1,
        learned: false,
      });
    });

    it("creates no words when no valid words in the csv file exist", async () => {
      const phrases = ["a man", "a plan", "a canal"];
      mockGetHttp.mockResolvedValue({
        json: { message: "Invalid word." },
        status: 400,
      });

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .attach("csv", "src/__tests__/csv/phrases.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: `You have value(s) in your CSV file that are not words. Please change them to valid word(s) and re-import your words: ${phrases[0]}, ${phrases[1]}, and ${phrases[2]}`,
      });
      expect(mockGetWordByWord).toHaveBeenCalledTimes(3);
      expect(mockGetWordByWord).toHaveBeenCalledWith(phrases[0]);
      expect(mockGetWordByWord).toHaveBeenCalledWith(phrases[1]);
      expect(mockGetWordByWord).toHaveBeenCalledWith(phrases[2]);
      expect(mockGetHttp).toHaveBeenCalledTimes(3);
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(phrases[0]),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(phrases[1]),
      });
      expect(mockGetHttp).toHaveBeenCalledWith({
        url: API_ENDPOINTS.dictionary(phrases[2]),
      });
      expect(mockCreateWord).not.toHaveBeenCalled();
      expect(mockCreateImage).not.toHaveBeenCalled();
      expect(mockCreateUserWord).not.toHaveBeenCalled();
    });

    it("sends an error message when the CSV parser returns an error", async () => {
      const message = "CSV file was parsed incorrectly.";
      jest.spyOn(csv, "read").mockResolvedValue({
        records: [],
        count: 0,
        error: message,
      });

      const response = await request(app)
        .post(`/api/users/${userId}/userWords`)
        .set("Accept", "application/json")
        .attach("csv", "src/__tests__/csv/incorrect.csv");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message });
      expect(mockGetWordByWord).not.toHaveBeenCalled();
      expect(mockGetHttp).not.toHaveBeenCalled();
      expect(mockCreateWord).not.toHaveBeenCalled();
      expect(mockCreateUserWord).not.toHaveBeenCalled();
    });
  });

  it("returns 400 status code when neither a word or csv file was provided", async () => {
    const userId = "1";
    const response = await request(app)
      .post(`/api/users/${userId}/userWords`)
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
