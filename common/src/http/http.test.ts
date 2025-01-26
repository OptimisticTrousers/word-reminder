import { http } from "./http";

describe("http", () => {
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
              definition: "To speak, to use words; to converse, to discourse.",
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

  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockImplementation(
      jest.fn(() =>
        Promise.resolve({ json: () => Promise.resolve(json), status: 200 })
      ) as jest.Mock
    );

  beforeEach(() => {
    fetchMock.mockClear();
  });

  describe("invalid url", () => {
    it("calls the get method", async () => {
      await expect(http.get({ url: "www.example.com" })).rejects.toThrow(
        "Invalid URL"
      );
    });

    it("calls the post method", async () => {
      await expect(http.post({ url: "www.example.com" })).rejects.toThrow(
        "Invalid URL"
      );
    });

    it("calls the put method", async () => {
      await expect(http.put({ url: "www.example.com" })).rejects.toThrow(
        "Invalid URL"
      );
    });

    it("calls the remove method", async () => {
      await expect(http.remove({ url: "www.example.com" })).rejects.toThrow(
        "Invalid URL"
      );
    });
  });

  describe("no options and no params", () => {
    it("calls the get method with no options and no params", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.get({ url });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(response).toEqual({
        json,
        status: 200,
      });
    });

    it("calls the post method with no options and no params", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.post({ url });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(response).toEqual({
        json,
        status: 200,
      });
    });

    it("calls the put method with no options and no params", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.put({ url });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(response).toEqual({
        json,
        status: 200,
      });
    });

    it("calls the remove method with no options and no params", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.remove({ url });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(response).toEqual({
        json,
        status: 200,
      });
    });
  });

  describe("options and no params", () => {
    it("calls the get method", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.get({
        url,
        options: {
          credentials: "include",
        },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      expect(response).toEqual({
        json,
        status: 200,
      });
    });

    describe("post method", () => {
      it("has stringified body", async () => {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";
        const body = JSON.stringify({
          email: "email@protonmail.com",
          password: "password",
        });

        const response = await http.post({
          url,
          options: {
            credentials: "include",
            body,
          },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body,
        });
        expect(response).toEqual({
          json,
          status: 200,
        });
      });

      it("has FormData body", async () => {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";
        const formData = new FormData();
        formData.append("email", "email");
        formData.append("password", "password");

        const response = await http.post({
          url,
          options: {
            credentials: "include",
            body: formData,
          },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: formData,
        });
        expect(response).toEqual({
          json,
          status: 200,
        });
      });
    });

    describe("put method", () => {
      it("has stringified body", async () => {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";
        const body = JSON.stringify({
          email: "email@protonmail.com",
          password: "password",
        });

        const response = await http.put({
          url,
          options: {
            credentials: "include",
            body,
          },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body,
        });
        expect(response).toEqual({
          json,
          status: 200,
        });
      });

      it("has FormData body", async () => {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";
        const formData = new FormData();
        formData.append("email", "email");
        formData.append("password", "password");

        const response = await http.put({
          url,
          options: {
            credentials: "include",
            body: formData,
          },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: formData,
        });
        expect(response).toEqual({
          json,
          status: 200,
        });
      });
    });

    it("calls the remove method", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.remove({
        url,
        options: {
          credentials: "include",
        },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(new URL(url), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      expect(response).toEqual({
        json,
        status: 200,
      });
    });
  });

  describe("no options and params", () => {
    it("calls the get method with no options and params", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.get({
        url,
        params: { partOfSpeech: "noun" },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        new URL(`${url}?partOfSpeech=noun`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(response).toEqual({
        json,
        status: 200,
      });
    });

    it("calls the post method with no options and params", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.post({
        url,
        params: { partOfSpeech: "noun" },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        new URL(`${url}?partOfSpeech=noun`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(response).toEqual({
        json,
        status: 200,
      });
    });

    it("calls the put method with no options and params", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.put({
        url,
        params: { partOfSpeech: "noun" },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        new URL(`${url}?partOfSpeech=noun`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(response).toEqual({
        json,
        status: 200,
      });
    });

    it("calls the remove method with no options and params", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.remove({
        url,
        params: { partOfSpeech: "noun" },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        new URL(`${url}?partOfSpeech=noun`),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(response).toEqual({
        json,
        status: 200,
      });
    });
  });

  describe("options and params", () => {
    it("calls the get method", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.get({
        url,
        params: { partOfSpeech: "noun" },
        options: {
          credentials: "include",
        },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        new URL(`${url}?partOfSpeech=noun`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      expect(response).toEqual({
        json,
        status: 200,
      });
    });

    describe("post method", () => {
      it("has stringified body", async () => {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";
        const body = JSON.stringify({
          word: "word",
        });

        const response = await http.post({
          url,
          params: { partOfSpeech: "noun" },
          options: {
            credentials: "include",
            body,
          },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          new URL(`${url}?partOfSpeech=noun`),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body,
          }
        );
        expect(response).toEqual({
          json,
          status: 200,
        });
      });

      it("has FormData body", async () => {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";
        const formData = new FormData();
        formData.append("word", "word");

        const response = await http.post({
          url,
          params: { partOfSpeech: "noun" },
          options: {
            credentials: "include",
            body: formData,
          },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          new URL(`${url}?partOfSpeech=noun`),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: formData,
          }
        );
        expect(response).toEqual({
          json,
          status: 200,
        });
      });
    });

    describe("put method", () => {
      it("has stringified body", async () => {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";
        const body = JSON.stringify({
          word: "word",
        });

        const response = await http.put({
          url,
          params: { partOfSpeech: "noun" },
          options: {
            credentials: "include",
            body,
          },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          new URL(`${url}?partOfSpeech=noun`),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body,
          }
        );
        expect(response).toEqual({
          json,
          status: 200,
        });
      });

      it("has FormData body", async () => {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";
        const formData = new FormData();
        formData.append("word", "word");

        const response = await http.put({
          url,
          params: { partOfSpeech: "noun" },
          options: {
            credentials: "include",
            body: formData,
          },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          new URL(`${url}?partOfSpeech=noun`),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: formData,
          }
        );
        expect(response).toEqual({
          json,
          status: 200,
        });
      });
    });

    it("calls the remove method", async () => {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

      const response = await http.remove({
        url,
        params: { partOfSpeech: "noun" },
        options: {
          credentials: "include",
        },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        new URL(`${url}?partOfSpeech=noun`),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      expect(response).toEqual({
        json,
        status: 200,
      });
    });
  });
});
