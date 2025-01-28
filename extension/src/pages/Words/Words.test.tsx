import { WORD_MAX } from "common";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AUTH_NOTIFICATION_MSGS } from "../Auth/constants";
import { Props } from "../../components/ui/PaginatedList";
import { NotificationProvider } from "../../context/Notification";
import { wordService } from "../../services/word_service/word_service";
import * as utils from "../../utils/download";
import { Words } from "./Words";

vi.mock("../../components/ui/PaginatedList", function () {
  return {
    PaginatedList: function (props: Props) {
      return (
        <>
          <div data-testid="name">{props.name}</div>
          <div data-testid="totalRows">{props.totalRows}</div>
          <div data-testid="list">{props.list}</div>
          <div data-testid="isLoading">{props.isLoading.toString()}</div>
          <div data-testid="isSuccess">{props.isSuccess.toString()}</div>
          <div data-testid="error">{JSON.stringify(props.error)}</div>
          <div data-testid="previous">{JSON.stringify(props.previous)}</div>
          <div data-testid="next">{JSON.stringify(props.next)}</div>
        </>
      );
    },
  };
});

describe("Words component", () => {
  const json = [
    {
      id: "1",
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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function setup() {
    const path = "/app/words";
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <Outlet context={{ user: testUser }} />;
        },
        children: [
          {
            path,
            Component: Words,
          },
          {
            path: "/login",
            Component: function () {
              return <form></form>;
            },
          },
        ],
      },
    ]);

    return {
      user: userEvent.setup(),
      ...render(
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <Stub initialEntries={[path]} />
          </QueryClientProvider>
        </NotificationProvider>
      ),
    };
  }

  const testUser = {
    id: "1",
  };

  const PAGINATION_LIMIT = "10";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return {
        json: {
          userWords: json,
          totalRows: 1,
          previous: {
            page: 1,
            limit: PAGINATION_LIMIT,
          },
          next: { page: 3, limit: PAGINATION_LIMIT },
        },
        status: 200,
      };
    });
  });

  describe("query words", () => {
    describe("paginated list", () => {
      it("error response", async () => {
        const message = "Bad Request.";
        const status = 400;
        vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
          return Promise.reject({ json: { message }, status });
        });

        setup();

        await waitFor(() => {
          const name = screen.getByTestId("name");
          const list = screen.getByTestId("list");
          const totalRows = screen.getByTestId("totalRows");
          const isLoading = screen.getByTestId("isLoading");
          const isSuccess = screen.getByTestId("isSuccess");
          const error = screen.getByTestId("error");
          const previous = screen.getByTestId("previous");
          const next = screen.getByTestId("next");
          expect(name).toHaveTextContent("Words");
          expect(list).toBeEmptyDOMElement();
          expect(totalRows).toBeEmptyDOMElement();
          expect(isLoading).toHaveTextContent("false");
          expect(isSuccess).toHaveTextContent("false");
          expect(error).toHaveTextContent(JSON.stringify({ message }));
          expect(previous).toHaveTextContent("");
          expect(next).toHaveTextContent("");
        });
      });

      it("loading response", async () => {
        const status = 200;
        const delay = 500;
        vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                json: {
                  userWords: json,
                  totalRows: 1,
                  previous: {
                    page: 1,
                    limit: PAGINATION_LIMIT,
                  },
                  next: { page: 3, limit: PAGINATION_LIMIT },
                },
                status,
              });
            }, delay);
          });
        });

        setup();

        await waitFor(() => {
          const name = screen.getByTestId("name");
          const list = screen.getByTestId("list");
          const totalRows = screen.getByTestId("totalRows");
          const isLoading = screen.getByTestId("isLoading");
          const isSuccess = screen.getByTestId("isSuccess");
          const error = screen.getByTestId("error");
          const previous = screen.getByTestId("previous");
          const next = screen.getByTestId("next");
          expect(name).toHaveTextContent("Words");
          expect(list).toBeEmptyDOMElement();
          expect(totalRows).toBeEmptyDOMElement();
          expect(isLoading).toHaveTextContent("true");
          expect(isSuccess).toHaveTextContent("false");
          expect(error).toHaveTextContent(JSON.stringify(null));
          expect(previous).toHaveTextContent("");
          expect(next).toHaveTextContent("");
        });
      });

      it("success response", async () => {
        const status = 200;
        vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
          return {
            json: {
              userWords: json,
              totalRows: 1,
              previous: {
                page: 1,
                limit: PAGINATION_LIMIT,
              },
              next: { page: 3, limit: PAGINATION_LIMIT },
            },
            status,
          };
        });

        setup();

        await waitFor(() => {
          const name = screen.getByTestId("name");
          const list = screen.getByTestId("list");
          const totalRows = screen.getByTestId("totalRows");
          const isLoading = screen.getByTestId("isLoading");
          const isSuccess = screen.getByTestId("isSuccess");
          const error = screen.getByTestId("error");
          const previous = screen.getByTestId("previous");
          const next = screen.getByTestId("next");
          expect(name).toHaveTextContent("Words");
          expect(list).not.toBeEmptyDOMElement();
          expect(totalRows).toHaveTextContent("1");
          expect(isLoading).toHaveTextContent("false");
          expect(isSuccess).toHaveTextContent("true");
          expect(error).toHaveTextContent(JSON.stringify(null));
          expect(previous).toHaveTextContent(
            JSON.stringify({ page: 1, limit: PAGINATION_LIMIT })
          );
          expect(next).toHaveTextContent(
            JSON.stringify({ page: 3, limit: PAGINATION_LIMIT })
          );
        });
      });
    });

    describe("searching", () => {
      it("calls the functions to make a search query", async () => {
        const { user } = setup();
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(wordService, "getWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });

        const searchInput = screen.getByLabelText("Search", {
          selector: "input",
        });
        const search = "word";
        await user.type(searchInput, search);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith(testUser.id, {
          page: "1",
          limit: PAGINATION_LIMIT,
          search,
          learned: "",
          column: "",
          direction: "",
        });
      });
    });

    describe("sorting", () => {
      it("does not call the functions to filter by featured because it is the default option", async () => {
        const { user } = setup();
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(wordService, "getWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });

        const sortSelect = screen.getByRole("combobox", { name: "Sort by:" });
        await user.selectOptions(sortSelect, ["Featured"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).not.toHaveBeenCalled();
      });

      it("calls the functions to sort by newest based on 'created_at' field", async () => {
        const { user } = setup();
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(wordService, "getWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });

        const sortSelect = screen.getByRole("combobox", { name: "Sort by:" });
        await user.selectOptions(sortSelect, ["Newest"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith(testUser.id, {
          page: "1",
          limit: PAGINATION_LIMIT,
          search: "",
          learned: "",
          column: "created_at",
          direction: "1",
        });
      });

      it("calls the functions to sort by oldest based on 'created_at' field", async () => {
        const { user } = setup();
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(wordService, "getWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });

        const sortSelect = screen.getByRole("combobox", { name: "Sort by:" });
        await user.selectOptions(sortSelect, ["Oldest"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith(testUser.id, {
          page: "1",
          limit: PAGINATION_LIMIT,
          search: "",
          learned: "",
          column: "created_at",
          direction: "-1",
        });
      });
    });

    describe("filtering", () => {
      it("does calls the functions to sort based on any words because it is the default", async () => {
        const { user } = setup();
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(wordService, "getWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });

        const filterSelect = screen.getByRole("combobox", {
          name: "Filter by:",
        });
        await user.selectOptions(filterSelect, ["Any"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).not.toHaveBeenCalled();
      });

      it("calls the functions to sort based on learned words", async () => {
        const { user } = setup();
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(wordService, "getWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });

        const filterSelect = screen.getByRole("combobox", {
          name: "Filter by:",
        });
        await user.selectOptions(filterSelect, ["Learned"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith(testUser.id, {
          page: "1",
          limit: PAGINATION_LIMIT,
          search: "",
          learned: "true",
          column: "",
          direction: "",
        });
      });

      it("calls the functions to sort based on unlearned words", async () => {
        const { user } = setup();
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(wordService, "getWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });

        const filterSelect = screen.getByRole("combobox", {
          name: "Filter by:",
        });
        await user.selectOptions(filterSelect, ["Unlearned"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith(testUser.id, {
          page: "1",
          limit: PAGINATION_LIMIT,
          search: "",
          learned: "false",
          column: "",
          direction: "",
        });
      });
    });
  });

  describe("word creation", () => {
    describe("text word creation", () => {
      it("calls the functions to create a word", async () => {
        const formData = new FormData();
        const word = json[0].word;
        formData.append("word", word);
        formData.append("csv", new File([""], ""));
        formData.append("userId", testUser.id);
        const status = 200;
        const mockWordServiceCreateWord = vi
          .spyOn(wordService, "createWord")
          .mockImplementation(async () => {
            return { json: { word: json[0] }, status };
          });
        const mockInvalidateQueries = vi.spyOn(
          queryClient,
          "invalidateQueries"
        );
        const { user } = setup();

        const wordInput = screen.getByLabelText("Word", {
          selector: "input",
        });
        await user.type(wordInput, word);
        const addButton = screen.getByRole("button", {
          name: "Add",
        });
        await user.click(addButton);

        const notification = screen.getByRole("dialog", {
          name: "You have successfully added a word to your dictionary.",
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: [
            "words",
            Object.fromEntries(
              new URLSearchParams({
                page: "1",
                limit: PAGINATION_LIMIT,
                search: "",
                learned: "",
                column: "",
                direction: "",
              })
            ),
          ],
          exact: true,
        });
        expect(mockWordServiceCreateWord).toHaveBeenCalledTimes(1);
        expect(mockWordServiceCreateWord).toHaveBeenCalledWith({
          userId: testUser.id,
          formData,
        });
        expect(notification).toBeInTheDocument();
      });

      it("shows generic notification that there was an error", async () => {
        const formData = new FormData();
        const word = json[0].word;
        formData.append("word", word);
        formData.append("csv", new File([""], ""));
        formData.append("userId", testUser.id);
        const message = "Bad Request.";
        const status = 400;
        const mockWordServiceCreateWord = vi
          .spyOn(wordService, "createWord")
          .mockImplementation(async () => {
            return Promise.reject({ json: { message }, status });
          });
        const { user } = setup();

        const wordInput = screen.getByLabelText("Word", {
          selector: "input",
        });
        await user.type(wordInput, word);
        const addButton = screen.getByRole("button", {
          name: "Add",
        });
        await user.click(addButton);

        const notification = screen.getByRole("dialog", {
          name: message,
        });
        expect(mockWordServiceCreateWord).toHaveBeenCalledTimes(1);
        expect(mockWordServiceCreateWord).toHaveBeenCalledWith({
          userId: testUser.id,
          formData,
        });
        expect(notification).toBeInTheDocument();
      });

      it("shows notification notification that the user is unauthenticated", async () => {
        const formData = new FormData();
        const word = json[0].word;
        formData.append("word", word);
        formData.append("csv", new File([""], ""));
        formData.append("userId", testUser.id);
        const message = "Unauthenticated.";
        const status = 401;
        const mockWordServiceCreateWord = vi
          .spyOn(wordService, "createWord")
          .mockImplementation(async () => {
            return Promise.reject({ json: { message }, status });
          });
        const { user } = setup();

        const wordInput = screen.getByLabelText("Word", {
          selector: "input",
        });
        await user.type(wordInput, word);
        const addButton = screen.getByRole("button", {
          name: "Add",
        });
        await user.click(addButton);

        const notification = screen.getByRole("dialog", {
          name: AUTH_NOTIFICATION_MSGS.credentialsExpired(),
        });
        expect(mockWordServiceCreateWord).toHaveBeenCalledTimes(1);
        expect(mockWordServiceCreateWord).toHaveBeenCalledWith({
          userId: testUser.id,
          formData,
        });
        expect(notification).toBeInTheDocument();
      });

      it("calls the functions at the word limit to create a word when the word is too long", async () => {
        const word = new Array(WORD_MAX + 1).fill("a").join("");
        const formData = new FormData();
        formData.append("word", word.slice(0, -1));
        formData.append("csv", new File([""], ""));
        formData.append("userId", testUser.id);
        const status = 200;
        const mockWordServiceCreate = vi
          .spyOn(wordService, "createWord")
          .mockImplementation(async () => {
            return { json: { word: json[0] }, status };
          });
        const { user } = setup();

        const wordInput = screen.getByLabelText("Word", {
          selector: "input",
        });
        await user.type(wordInput, word);
        const addButton = screen.getByRole("button", {
          name: "Add",
        });
        await user.click(addButton);

        const notification = screen.getByRole("dialog", {
          name: "You have successfully added a word to your dictionary.",
        });
        expect(mockWordServiceCreate).toHaveBeenCalledTimes(1);
        expect(mockWordServiceCreate).toHaveBeenCalledWith({
          userId: testUser.id,
          formData,
        });
        expect(notification).toBeInTheDocument();
      });
    });

    describe("csv", () => {
      describe("export words", () => {
        it("calls the functions to download csv file", async () => {
          const { user } = setup();
          const totalRows = "1";
          const status = 200;
          const mockWordServiceGetUserWords = vi
            .spyOn(wordService, "getWordList")
            .mockImplementation(async () => {
              return {
                json: {
                  userWords: [{ word: "export" }, { word: "word" }],
                  totalRows,
                },
                status,
              };
            });
          const mockDownload = vi
            .spyOn(utils, "download")
            .mockImplementation(vi.fn());

          const exportWordsButton = screen.getByRole("button", {
            name: "Export Words",
          });
          await user.click(exportWordsButton);

          expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
          expect(mockWordServiceGetUserWords).toHaveBeenCalledWith(
            testUser.id,
            {
              page: "1",
              limit: totalRows,
              search: "",
              learned: "",
              column: "",
              direction: "",
            }
          );
          expect(mockDownload).toHaveBeenCalledTimes(1);
          expect(mockDownload).toHaveBeenCalledWith({
            data: "export,word",
            fileName: "words.csv",
            fileType: "text/csv",
          });
        });
      });

      describe("import words", async () => {
        it("calls the functions to import words from a csv file", async () => {
          const formData = new FormData();
          const csvFile = new File(["many,words,in,this,file"], "words.csv", {
            type: "text/csv",
          });
          formData.append("word", "");
          formData.append("csv", csvFile);
          formData.append("userId", testUser.id);
          const { user } = setup();
          const status = 200;
          const mockWordServiceCreate = vi
            .spyOn(wordService, "createWord")
            .mockImplementation(async () => {
              return { json: { message: "1 word has been created." }, status };
            });

          const importWordsInput: HTMLInputElement = screen.getByLabelText(
            "Import Words",
            { selector: "input" }
          );
          await user.upload(importWordsInput, csvFile);
          const addButton = screen.getByRole("button", { name: "Add" });
          await user.click(addButton);

          const notification = screen.getByRole("dialog", {
            name: "You have successfully multiple words to your dictionary.",
          });
          expect(notification).toBeInTheDocument();
          expect(mockWordServiceCreate).toHaveBeenCalledTimes(1);
          expect(mockWordServiceCreate).toHaveBeenCalledWith({
            userId: testUser.id,
            formData,
          });
          expect(importWordsInput.files?.[0]).toBe(csvFile);
          expect(importWordsInput.files?.item(0)).toBe(csvFile);
          expect(importWordsInput.files).toHaveLength(1);
        });

        it("does not call the functions to import words when it is not a csv file", async () => {
          const formData = new FormData();
          const notACsvFile = new File(["(⌐□_□)"], "words.png", {
            type: "image/png",
          });
          formData.append("word", "");
          formData.append("csv", notACsvFile);
          formData.append("userId", testUser.id);
          const status = 200;
          const mockWordServiceCreate = vi
            .spyOn(wordService, "createWord")
            .mockImplementation(async () => {
              return { json, status };
            });
          const { user } = setup();

          const importWordsInput: HTMLInputElement = screen.getByLabelText(
            "Import Words",
            {
              selector: "input",
            }
          );
          await user.upload(importWordsInput, notACsvFile);
          const addButton = screen.getByRole("button", {
            name: "Add",
          });
          await user.click(addButton);

          const notification = screen.getByRole("dialog", {
            name: "Please type a word or upload a CSV file of words.",
          });
          expect(mockWordServiceCreate).not.toHaveBeenCalled();
          expect(notification).toBeInTheDocument();
          expect(importWordsInput.files).toHaveLength(0);
        });

        it("shows generic notification that there was an error", async () => {
          const formData = new FormData();
          const csvFile = new File(["many,words,in,this,file"], "words.csv", {
            type: "text/csv",
          });
          formData.append("word", "");
          formData.append("csv", csvFile);
          formData.append("userId", testUser.id);
          const message = "Bad Request.";
          const status = 400;
          const mockWordServiceCreateWord = vi
            .spyOn(wordService, "createWord")
            .mockImplementation(async () => {
              return Promise.reject({ json: { message }, status });
            });
          const { user } = setup();

          const importWordsInput: HTMLInputElement = screen.getByLabelText(
            "Import Words",
            {
              selector: "input",
            }
          );
          await user.upload(importWordsInput, csvFile);
          const addButton = screen.getByRole("button", {
            name: "Add",
          });
          await user.click(addButton);

          const notification = screen.getByRole("dialog", {
            name: message,
          });
          expect(mockWordServiceCreateWord).toHaveBeenCalledTimes(1);
          expect(mockWordServiceCreateWord).toHaveBeenCalledWith({
            userId: testUser.id,
            formData,
          });
          expect(notification).toBeInTheDocument();
          expect(importWordsInput.files?.[0]).toBe(csvFile);
          expect(importWordsInput.files?.item(0)).toBe(csvFile);
          expect(importWordsInput.files).toHaveLength(1);
        });

        it("shows notification notification that the user is unauthenticated", async () => {
          const formData = new FormData();
          const csvFile = new File(["many,words,in,this,file"], "words.csv", {
            type: "text/csv",
          });
          formData.append("word", "");
          formData.append("csv", csvFile);
          formData.append("userId", testUser.id);
          const message = "Unauthenticated.";
          const status = 401;
          const mockWordServiceCreateWord = vi
            .spyOn(wordService, "createWord")
            .mockImplementation(async () => {
              return Promise.reject({ json: { message }, status });
            });
          const { user } = setup();

          const importWordsInput: HTMLInputElement = screen.getByLabelText(
            "Import Words",
            {
              selector: "input",
            }
          );
          await user.upload(importWordsInput, csvFile);
          const addButton = screen.getByRole("button", {
            name: "Add",
          });
          await user.click(addButton);

          const notification = screen.getByRole("dialog", {
            name: AUTH_NOTIFICATION_MSGS.credentialsExpired(),
          });
          expect(mockWordServiceCreateWord).toHaveBeenCalledTimes(1);
          expect(mockWordServiceCreateWord).toHaveBeenCalledWith({
            userId: testUser.id,
            formData,
          });
          expect(notification).toBeInTheDocument();
          expect(importWordsInput.files?.[0]).toBe(csvFile);
          expect(importWordsInput.files?.item(0)).toBe(csvFile);
          expect(importWordsInput.files).toHaveLength(1);
        });
      });
    });

    it("shows a notification when neither a word or file is provided", async () => {
      const formData = new FormData();
      const word = "";
      formData.append("word", word);
      formData.append("csv", new File([""], ""));
      formData.append("userId", testUser.id);
      const status = 200;
      const mockWordServiceCreateWord = vi
        .spyOn(wordService, "createWord")
        .mockImplementation(async () => {
          return { json: { word: json[0] }, status };
        });
      const { user } = setup();

      const addButton = screen.getByRole("button", {
        name: "Add",
      });
      await user.click(addButton);

      const notification = screen.getByRole("dialog", {
        name: "Please type a word or upload a CSV file of words.",
      });
      expect(mockWordServiceCreateWord).not.toHaveBeenCalled();
      expect(notification).toBeInTheDocument();
    });

    it("disables add button and all inputs when the mutation is pending", async () => {
      const formData = new FormData();
      const word = json[0].word;
      formData.append("word", word);
      formData.append("csv", new File([""], ""));
      formData.append("userId", testUser.id);
      const delay = 500;
      const status = 200;
      const mockWordServiceCreateWord = vi
        .spyOn(wordService, "createWord")
        .mockImplementation(async () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ json: { word: json[0] }, status });
            }, delay);
          });
        });
      const { user } = setup();

      const wordInput = screen.getByLabelText("Word", {
        selector: "input",
      });
      await user.type(wordInput, word);
      const addButton = screen.getByRole("button", {
        name: "Add",
      });
      await user.click(addButton);

      expect(mockWordServiceCreateWord).toHaveBeenCalledTimes(1);
      expect(mockWordServiceCreateWord).toHaveBeenCalledWith({
        userId: testUser.id,
        formData,
      });
      await waitFor(() => {
        const addButton = screen.getByRole("button", { name: "Add" });
        const inputs = screen.getAllByLabelText(/[\s\S]*/, {
          selector: "input",
        });
        expect(addButton).toBeDisabled();
        for (const input of inputs) {
          expect(input).toBeDisabled();
        }
      });
    });
  });

  it("renders two forms that have fields for creating a text word, importing a csv file of words, searching words, sorting words, and filtering words", async () => {
    const { asFragment } = setup();

    expect(asFragment()).toMatchSnapshot();
  });
});
