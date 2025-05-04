import { service } from "../service";
import { userWordService } from "./user_word_service";

const { VITE_API_DOMAIN } = service;

vi.mock("../service");

describe("wordService", () => {
  const userId = "1";

  const userWordId = "1";

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

      const response = await userWordService.getUserWord({
        userId,
        userWordId,
      });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/userWords/${userWordId}`,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json,
        status,
      });
    });
  });

  describe("getUserWordList", () => {
    it("gets using the correct API endpoint with params", async () => {
      const params = new URLSearchParams({
        column: "created_at",
        direction: "-1",
      });
      const paramsObject = Object.fromEntries(params);
      const mockGet = vi.spyOn(service, "get").mockImplementation(async () => {
        return { json, status };
      });

      const response = await userWordService.getUserWordList({
        userId,
        params: paramsObject,
      });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/userWords`,
        params: paramsObject,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json,
        status,
      });
    });
  });

  describe("createUserWord", () => {
    it("creates using the correct API endpoint with word body", async () => {
      const word = json[0].word;
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return { json, status };
        });
      const formData = new FormData();
      formData.append("word", word);

      const response = await userWordService.createUserWord({
        userId,
        formData,
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/userWords`,
        options: { body: formData, credentials: "include" },
        params: undefined,
      });
      expect(response).toEqual({
        json,
        status,
      });
    });
  });

  describe("updateUserWord", () => {
    it("deletes using the correct API endpoint", async () => {
      const mockPut = vi.spyOn(service, "put").mockImplementation(async () => {
        return { json, status };
      });

      const body = { learned: false };
      const response = await userWordService.updateUserWord({
        userId,
        userWordId,
        body,
      });

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/userWords/${userWordId}`,
        options: {
          body: JSON.stringify(body),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
        },
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

      const response = await userWordService.deleteUserWord({
        userId,
        userWordId,
      });

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/userWords/${userWordId}`,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json,
        status,
      });
    });
  });
});
