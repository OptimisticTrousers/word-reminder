import { service } from "../service";
import { wordService } from "./word_service";

const { VITE_API_DOMAIN } = service;

vi.mock("../service");

describe("wordService", () => {
  const userId = "1";

  const wordId = "1";

  const json = [
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
          sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=1197728",
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

  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserWord", async () => {
    it("gets using the correct API endpoint", async () => {
      const mockGet = vi.spyOn(service, "get").mockImplementation(async () => {
        return { json, status };
      });

      const response = await wordService.getUserWord(userId, wordId);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/words/${wordId}`,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json,
        status,
      });
    });
  });

  describe("getWordList", () => {
    it("gets using the correct API endpoint with params", async () => {
      const params = new URLSearchParams({
        column: "created_at",
        direction: "-1",
      });
      const paramsObject = Object.fromEntries(params);
      const mockGet = vi.spyOn(service, "get").mockImplementation(async () => {
        return { json, status };
      });

      const response = await wordService.getWordList(userId, paramsObject);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/words`,
        params: paramsObject,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json,
        status,
      });
    });
  });

  describe("createWord", () => {
    it("creates using the correct API endpoint with word body", async () => {
      const word = json[0].word;
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return { json, status };
        });
      const formData = new FormData();
      formData.append("word", word);

      const response = await wordService.createWord({ userId, formData });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/words`,
        options: { body: formData, credentials: "include" },
        params: undefined,
      });
      expect(response).toEqual({
        json,
        status,
      });
    });
  });

  describe("deleteUserWord", () => {
    it("deletes using the correct API endpoint", async () => {
      const mockRemove = vi
        .spyOn(service, "remove")
        .mockImplementation(async () => {
          return { json, status };
        });

      const response = await wordService.deleteUserWord({ userId, wordId });

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/${wordId}`,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json,
        status,
      });
    });
  });
});
