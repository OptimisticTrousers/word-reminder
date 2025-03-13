import { WORD_MAX } from "common";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AUTH_NOTIFICATION_MSGS } from "../Auth/constants";
import { Props } from "../../components/ui/PaginatedList";
import { NotificationProvider } from "../../context/Notification";
import { userWordService } from "../../services/user_word_service";
import { UserWords } from "./UserWords";
import * as utils from "../../utils/download";
import * as hooks from "../../hooks/useContextMenu";
import { UserWord } from "../../components/words/UserWord";
import { RefObject, useEffect } from "react";

vi.mock("../../components/ui/PaginatedList/PaginatedList");

vi.mock("../../components/words/UserWord", function () {
  return {
    UserWord: function (props: Props) {
      return (
        <>
          <div data-testid="props">{JSON.stringify(props)}</div>
        </>
      );
    },
  };
});

describe("UserWords component", () => {
  const json = [
    {
      id: 1,
      details: [
        {
          word: "word",
        },
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
    const path = "/userWords";
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <Outlet context={{ user: testUser }} />;
        },
        children: [
          {
            path,
            Component: UserWords,
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

  const PAGINATION_LIMIT = "10";

  const testUser = {
    id: 1,
  };

  const word1 = {
    id: 1,
    details: [
      {
        word: "hello",
        phonetics: [
          {
            text: "hɛˈləʊ",
          },
        ],
        meanings: [
          {
            partOfSpeech: "exclamation",
            definitions: [
              {
                definition:
                  "used as a greeting or to begin a phone conversation.",
                example: "hello there, Katie!",
                synonyms: [],
                antonyms: [],
              },
            ],
          },
        ],
      },
    ],
    created_at: new Date(),
  };

  const word2 = {
    id: 2,
    details: [
      {
        word: "clemency",
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [{ definition: "Mercy; lenience." }],
          },
        ],
        phonetics: [],
      },
    ],
    created_at: new Date(),
  };

  const userWord1 = {
    id: 1,
    user_id: String(testUser.id),
    word_id: word1.id,
    details: word1.details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: 2,
    user_id: String(testUser.id),
    word_id: word2.id,
    details: word2.details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("word creation", () => {
    beforeEach(() => {
      vi.spyOn(userWordService, "getUserWordList").mockImplementation(
        async () => {
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
        }
      );
    });

    describe("text word creation", () => {
      it("calls the functions to create a word", async () => {
        const formData = new FormData();
        const word = json[0].details[0].word;
        formData.append("word", word);
        formData.append("csv", new File([""], ""));
        formData.append("userId", String(testUser.id));
        const status = 200;
        const mockWordServiceCreateWord = vi
          .spyOn(userWordService, "createUserWord")
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
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: ["userWords"],
        });
        expect(mockWordServiceCreateWord).toHaveBeenCalledTimes(1);
        expect(mockWordServiceCreateWord).toHaveBeenCalledWith({
          userId: String(testUser.id),
          formData,
        });
        expect(notification).toBeInTheDocument();
      });

      it("shows generic notification that there was an error", async () => {
        const formData = new FormData();
        const word = json[0].details[0].word;
        formData.append("word", word);
        formData.append("csv", new File([""], ""));
        formData.append("userId", String(testUser.id));
        const message = "Bad Request.";
        const status = 400;
        const mockWordServiceCreateWord = vi
          .spyOn(userWordService, "createUserWord")
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
          userId: String(testUser.id),
          formData,
        });
        expect(notification).toBeInTheDocument();
      });

      it("shows notification that the file size is too big", async () => {
        const status = 200;
        const mockWordServiceCreateWord = vi
          .spyOn(userWordService, "createUserWord")
          .mockImplementation(async () => {
            return { json: { word: json[0] }, status };
          });
        const mockInvalidateQueries = vi.spyOn(
          queryClient,
          "invalidateQueries"
        );
        const file = new File([new ArrayBuffer(1024000 + 1)], "words.csv", {
          type: "text/csv",
        });
        const { user } = setup();

        const importWordsInput = screen.getByLabelText("Import Words", {
          selector: "input",
        });
        await user.upload(importWordsInput, file);
        const addButton = screen.getByRole("button", {
          name: "Add",
        });
        await user.click(addButton);

        const notification = screen.getByRole("dialog", {
          name: "File is too big. Max size is 1 MB.",
        });
        expect(mockInvalidateQueries).not.toHaveBeenCalled();
        expect(mockWordServiceCreateWord).not.toHaveBeenCalled();
        expect(notification).toBeInTheDocument();
      });

      it("shows notification notification that the user is unauthenticated", async () => {
        const formData = new FormData();
        const word = json[0].details[0].word;
        formData.append("word", word);
        formData.append("csv", new File([""], ""));
        formData.append("userId", String(testUser.id));
        const message = "User is unauthenticated.";
        const status = 401;
        const mockWordServiceCreateWord = vi
          .spyOn(userWordService, "createUserWord")
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
          userId: String(testUser.id),
          formData,
        });
        expect(notification).toBeInTheDocument();
      });

      it("calls the functions at the word limit to create a word when the word is too long", async () => {
        const word = new Array(WORD_MAX + 1).fill("a").join("");
        const formData = new FormData();
        formData.append("word", word.slice(0, -1));
        formData.append("csv", new File([""], ""));
        formData.append("userId", String(testUser.id));
        const status = 200;
        const mockWordServiceCreate = vi
          .spyOn(userWordService, "createUserWord")
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
          userId: String(testUser.id),
          formData,
        });
        expect(notification).toBeInTheDocument();
      });
    });

    describe("csv word creation", () => {
      describe("export words", () => {
        it("calls the functions to download csv file", async () => {
          const { user } = setup();
          const totalRows = "1";
          const status = 200;
          const mockWordServiceGetUserWords = vi
            .spyOn(userWordService, "getUserWordList")
            .mockImplementation(async () => {
              return {
                json: {
                  userWords: [
                    { details: [{ word: "export" }] },
                    { details: [{ word: "word" }] },
                  ],
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
          expect(mockWordServiceGetUserWords).toHaveBeenCalledWith({
            userId: String(testUser.id),
            params: {
              page: "1",
              limit: totalRows,
              search: "",
              learned: "",
              column: "",
              direction: "",
            },
          });
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
          formData.append("userId", String(testUser.id));
          const { user } = setup();
          const status = 200;
          const mockWordServiceCreate = vi
            .spyOn(userWordService, "createUserWord")
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
            userId: String(testUser.id),
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
          formData.append("userId", String(testUser.id));
          const status = 200;
          const mockWordServiceCreate = vi
            .spyOn(userWordService, "createUserWord")
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
          formData.append("userId", String(testUser.id));
          const message = "Bad Request.";
          const status = 400;
          const mockWordServiceCreateWord = vi
            .spyOn(userWordService, "createUserWord")
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
            userId: String(testUser.id),
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
          formData.append("userId", String(testUser.id));
          const message = "User is unauthenticated.";
          const status = 401;
          const mockWordServiceCreateWord = vi
            .spyOn(userWordService, "createUserWord")
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
            userId: String(testUser.id),
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
      formData.append("userId", String(testUser.id));
      const status = 200;
      const mockWordServiceCreateWord = vi
        .spyOn(userWordService, "createUserWord")
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
      const word = json[0].details[0].word;
      formData.append("word", word);
      formData.append("csv", new File([""], ""));
      formData.append("userId", String(testUser.id));
      const delay = 50;
      const status = 200;
      const mockWordServiceCreateWord = vi
        .spyOn(userWordService, "createUserWord")
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

      const inputs = screen.getAllByLabelText(/[\s\S]*/, {
        selector: "input",
      });
      for (const input of inputs) {
        expect(input).toBeDisabled();
      }
      expect(addButton).toBeDisabled();
      expect(mockWordServiceCreateWord).toHaveBeenCalledTimes(1);
      expect(mockWordServiceCreateWord).toHaveBeenCalledWith({
        userId: String(testUser.id),
        formData,
      });
    });
  });

  describe("query words", () => {
    describe("paginated list", () => {
      it("error response", async () => {
        const message = "Bad Request.";
        const status = 400;
        vi.spyOn(userWordService, "getUserWordList").mockImplementation(
          async () => {
            return Promise.reject({ json: { message }, status });
          }
        );

        setup();

        const paginatedListProps = {
          name: "User Words",
          totalRows: undefined,
          list: [],
          isLoading: false,
          isSuccess: false,
          error: new Error(message),
          previous: { page: 1, limit: PAGINATION_LIMIT },
          next: { page: 3, limit: PAGINATION_LIMIT },
        };
        const paginatedList = await screen.findByTestId("paginated-list");
        expect(paginatedList).toBeInTheDocument();
        expect(paginatedList).toHaveTextContent(String(paginatedListProps));
      });

      it("loading response", async () => {
        const status = 200;
        const delay = 50;
        vi.spyOn(userWordService, "getUserWordList").mockImplementation(
          async () => {
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
          }
        );

        setup();

        const paginatedListProps = {
          name: "User Words",
          totalRows: 0,
          list: [],
          isLoading: true,
          isSuccess: false,
          error: null,
          previous: { page: 1, limit: PAGINATION_LIMIT },
          next: { page: 3, limit: PAGINATION_LIMIT },
        };
        const paginatedList = await screen.findByTestId("paginated-list");
        expect(paginatedList).toBeInTheDocument();
        expect(paginatedList).toHaveTextContent(String(paginatedListProps));
      });

      it("success response", async () => {
        const status = 200;
        vi.spyOn(userWordService, "getUserWordList").mockImplementation(
          async () => {
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
          }
        );

        setup();

        const paginatedListProps = {
          name: "User Words",
          totalRows: 2,
          list: [<UserWord {...userWord1} />, <UserWord {...userWord2} />],
          isLoading: false,
          isSuccess: true,
          error: null,
          previous: { page: 1, limit: PAGINATION_LIMIT },
          next: { page: 3, limit: PAGINATION_LIMIT },
        };
        const paginatedList = await screen.findByTestId("paginated-list");
        expect(paginatedList).toBeInTheDocument();
        expect(paginatedList).toHaveTextContent(String(paginatedListProps));
      });
    });

    describe("searching", () => {
      it("calls the functions to make a search query", async () => {
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(userWordService, "getUserWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });
        const { user } = setup();

        const searchInput = await screen.findByLabelText("Search", {
          selector: "input",
        });
        const search = "word";
        await user.type(searchInput, search);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith({
          userId: String(testUser.id),
          params: {
            page: "1",
            limit: PAGINATION_LIMIT,
            search,
            learned: "",
            column: "",
            table: "user_words",
            direction: "",
          },
        });
      });
    });

    describe("sorting", () => {
      it("does not call the functions to filter by featured because it is the default option", async () => {
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(userWordService, "getUserWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });
        const { user } = setup();

        const sortSelect = await screen.findByRole("combobox", {
          name: "Sort by:",
        });
        await user.selectOptions(sortSelect, ["Featured"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).not.toHaveBeenCalled();
      });

      it("calls the functions to sort by newest based on 'created_at' field", async () => {
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(userWordService, "getUserWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });
        const { user } = setup();

        const sortSelect = await screen.findByRole("combobox", {
          name: "Sort by:",
        });
        await user.selectOptions(sortSelect, ["Newest"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith({
          userId: String(testUser.id),
          params: {
            page: "1",
            limit: PAGINATION_LIMIT,
            search: "",
            learned: "",
            column: "created_at",
            table: "user_words",
            direction: "-1",
          },
        });
      });

      it("calls the functions to sort by oldest based on 'created_at' field", async () => {
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(userWordService, "getUserWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });
        const { user } = setup();

        const sortSelect = await screen.findByRole("combobox", {
          name: "Sort by:",
        });
        await user.selectOptions(sortSelect, ["Oldest"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith({
          userId: String(testUser.id),
          params: {
            page: "1",
            limit: PAGINATION_LIMIT,
            search: "",
            learned: "",
            column: "created_at",
            table: "user_words",
            direction: "1",
          },
        });
      });
    });

    describe("filtering", () => {
      it("does calls the functions to sort based on any words because it is the default", async () => {
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(userWordService, "getUserWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });
        const { user } = setup();

        const filterSelect = await screen.findByRole("combobox", {
          name: "Filter by:",
        });
        await user.selectOptions(filterSelect, ["Any"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).not.toHaveBeenCalled();
      });

      it("calls the functions to sort based on learned words", async () => {
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(userWordService, "getUserWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });
        const { user } = setup();

        const filterSelect = await screen.findByRole("combobox", {
          name: "Filter by:",
        });
        await user.selectOptions(filterSelect, ["Learned"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith({
          userId: String(testUser.id),
          params: {
            page: "1",
            limit: PAGINATION_LIMIT,
            search: "",
            learned: "true",
            table: "user_words",
            column: "",
            direction: "",
          },
        });
      });

      it("calls the functions to sort based on unlearned words", async () => {
        const status = 200;
        const mockWordServiceGetUserWords = vi
          .spyOn(userWordService, "getUserWordList")
          .mockImplementation(async () => {
            return { json: { userWords: json, totalRows: 1 }, status };
          });
        const { user } = setup();

        const filterSelect = await screen.findByRole("combobox", {
          name: "Filter by:",
        });
        await user.selectOptions(filterSelect, ["Unlearned"]);
        const filterButton = screen.getByRole("button", { name: "Filter" });
        await user.click(filterButton);

        expect(mockWordServiceGetUserWords).toHaveBeenCalledTimes(1);
        expect(mockWordServiceGetUserWords).toHaveBeenCalledWith({
          userId: String(testUser.id),
          params: {
            page: "1",
            limit: PAGINATION_LIMIT,
            search: "",
            learned: "false",
            column: "",
            table: "user_words",
            direction: "",
          },
        });
      });
    });
  });

  it("renders two forms that have fields for creating a text word, importing a csv file of words, searching words, sorting words, filtering words, and add word input is focused", async () => {
    const status = 200;
    vi.spyOn(userWordService, "getUserWordList").mockImplementation(
      async () => {
        return { json: { userWords: json, totalRows: 1 }, status };
      }
    );
    const { asFragment } = setup();

    const wordInput = await screen.findByLabelText("Word", {
      selector: "input",
    });
    expect(wordInput).toHaveFocus();
    expect(asFragment()).toMatchSnapshot();
  });

  it("uses context menu hook", async () => {
    vi.spyOn(hooks, "useContextMenu").mockImplementation(
      ({
        inputRef,
        submitButtonRef,
      }: {
        inputRef: RefObject<HTMLInputElement | null>;
        submitButtonRef: RefObject<HTMLButtonElement | null>;
      }) => {
        useEffect(() => {
          if (inputRef.current) {
            inputRef.current.value = "input has changed";
          }
          if (submitButtonRef.current) {
            submitButtonRef.current.textContent = "button has changed";
          }
        }, [inputRef, submitButtonRef]);
      }
    );
    const status = 200;
    vi.spyOn(userWordService, "getUserWordList").mockImplementation(
      async () => {
        return { json: { userWords: json, totalRows: 1 }, status };
      }
    );

    setup();

    const input = await screen.findByDisplayValue("input has changed");
    const submitButton = screen.getByRole("button", {
      name: "button has changed",
    });
    expect(input).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });
});
