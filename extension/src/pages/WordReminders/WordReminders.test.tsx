import { render, screen } from "@testing-library/react";

import { WordReminder } from "../../components/word_reminders/WordReminder/__mocks__/WordReminder";
import { wordReminderService } from "../../services/word_reminder_service";
import { WordReminders } from "./WordReminders";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoutesStub, Outlet } from "react-router-dom";

vi.mock("../../components/word_reminders/AutoCreateWordReminder", () => {
  return {
    AutoCreateWordReminder: function () {
      return <div data-testid="auto-create-word-reminder"></div>;
    },
  };
});

vi.mock("../../components/word_reminders/CreateWordReminder", () => {
  return {
    CreateWordReminder: function () {
      return <div data-testid="create-word-reminder"></div>;
    },
  };
});

vi.mock("../../components/ui/PaginatedList/PaginatedList");

vi.mock("../../components/word_reminders/WordReminder/WordReminder");

describe("WordReminders component", () => {
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
    user_id: testUser.id,
    word_id: word1.id,
    details: word1.details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: 2,
    user_id: testUser.id,
    word_id: word2.id,
    details: word2.details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const wordReminder1 = {
    id: 1,
    has_reminder_onload: true,
    is_active: true,
    user_id: testUser.id,
    reminder: "* * * * *",
    finish: new Date(Date.now() + 1000),
    user_words: [userWord1, userWord2],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const wordReminder2 = {
    id: 2,
    has_reminder_onload: true,
    is_active: true,
    user_id: testUser.id,
    reminder: "* * * * *",
    finish: new Date(Date.now() + 1000),
    user_words: [userWord1, userWord2],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const wordReminders = [wordReminder1, wordReminder2];

  const status = 200;

  const PAGINATION_LIMIT = "10";

  const searchParams = new URLSearchParams();

  function setup() {
    const queryClient = new QueryClient();
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <Outlet context={{ user: testUser }} />;
        },
        children: [
          {
            path: "/",
            Component: function () {
              return (
                <QueryClientProvider client={queryClient}>
                  <WordReminders />
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);

    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={["/"]} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form that allows user to filter the word reminders and paginated list", async () => {
    const mockGetWordReminderList = vi
      .spyOn(wordReminderService, "getWordReminderList")
      .mockImplementation(async () => {
        return {
          json: {
            wordReminders,
            next: {
              page: 3,
              limit: PAGINATION_LIMIT,
            },
            previous: { page: 1, limit: PAGINATION_LIMIT },
            totalRows: 2,
          },
          status,
        };
      });
    const { asFragment } = setup();

    const paginatedListProps = {
      name: "Word Reminders",
      totalRows: wordReminders.length,
      list: [
        <WordReminder
          searchParams={searchParams}
          wordReminder={wordReminder1}
        />,
        <WordReminder
          searchParams={searchParams}
          wordReminder={wordReminder2}
        />,
      ],
      isLoading: false,
      isSuccess: true,
      error: null,
      previous: { page: 1, limit: PAGINATION_LIMIT },
      next: { page: 3, limit: PAGINATION_LIMIT },
    };
    const autoCreateWordReminder = screen.getByTestId(
      "auto-create-word-reminder"
    );
    const createWordReminder = screen.getByTestId("create-word-reminder");
    const paginatedList = await screen.findByTestId("paginated-list");
    expect(paginatedList).toBeInTheDocument();
    expect(paginatedList).toHaveTextContent(String(paginatedListProps));
    expect(autoCreateWordReminder).toBeInTheDocument();
    expect(createWordReminder).toBeInTheDocument();
    expect(mockGetWordReminderList).toHaveBeenCalledTimes(1);
    expect(mockGetWordReminderList).toHaveBeenCalledWith({
      userId: String(testUser.id),
      params: {
        page: "1",
        limit: "10",
        column: "",
        direction: "",
      },
    });
    expect(asFragment()).toMatchSnapshot();
  });

  describe("sort by options", () => {
    it("allows the user to sort by featured", async () => {
      const mockGetWordReminderList = vi
        .spyOn(wordReminderService, "getWordReminderList")
        .mockImplementation(async () => {
          return {
            json: {
              wordReminders,
              next: {
                page: 3,
                limit: PAGINATION_LIMIT,
              },
              previous: { page: 1, limit: PAGINATION_LIMIT },
            },
            status,
          };
        });
      const { user } = setup();

      const select = screen.getByRole("combobox");
      const button = screen.getByRole("button", { name: "Filter" });
      await user.selectOptions(select, ["Featured"]);
      await user.click(button);

      expect(mockGetWordReminderList).toHaveBeenCalledTimes(1);
      expect(mockGetWordReminderList).toHaveBeenCalledWith({
        userId: String(testUser.id),
        params: Object.fromEntries(
          new URLSearchParams({
            page: "1",
            limit: PAGINATION_LIMIT,
            column: "",
            direction: "",
          })
        ),
      });
    });

    it("allows the user to sort by newest", async () => {
      const mockGetWordReminderList = vi
        .spyOn(wordReminderService, "getWordReminderList")
        .mockImplementation(async () => {
          return {
            json: {
              wordReminders,
              next: {
                page: 3,
                limit: PAGINATION_LIMIT,
              },
              previous: { page: 1, limit: PAGINATION_LIMIT },
            },
            status,
          };
        });
      const { user } = setup();

      const select = screen.getByRole("combobox");
      const button = screen.getByRole("button", { name: "Filter" });
      await user.selectOptions(select, ["Newest"]);
      await user.click(button);

      expect(mockGetWordReminderList).toHaveBeenCalledTimes(2);
      expect(mockGetWordReminderList).toHaveBeenCalledWith({
        userId: String(testUser.id),
        params: Object.fromEntries(
          new URLSearchParams({
            page: "1",
            limit: PAGINATION_LIMIT,
            column: "",
            direction: "",
          })
        ),
      });
      expect(mockGetWordReminderList).toHaveBeenCalledWith({
        userId: String(testUser.id),
        params: Object.fromEntries(
          new URLSearchParams({
            page: "1",
            limit: PAGINATION_LIMIT,
            column: "created_at",
            direction: "1",
          })
        ),
      });
    });

    it("allows the user to sort by oldest", async () => {
      const mockGetWordReminderList = vi
        .spyOn(wordReminderService, "getWordReminderList")
        .mockImplementation(async () => {
          return {
            json: {
              wordReminders,
              next: {
                page: 3,
                limit: PAGINATION_LIMIT,
              },
              previous: { page: 1, limit: PAGINATION_LIMIT },
            },
            status,
          };
        });
      const { user } = setup();

      const select = screen.getByRole("combobox");
      const button = screen.getByRole("button", { name: "Filter" });
      await user.selectOptions(select, ["Oldest"]);
      await user.click(button);

      expect(mockGetWordReminderList).toHaveBeenCalledTimes(2);
      expect(mockGetWordReminderList).toHaveBeenCalledWith({
        userId: String(testUser.id),
        params: Object.fromEntries(
          new URLSearchParams({
            page: "1",
            limit: PAGINATION_LIMIT,
            column: "",
            direction: "",
          })
        ),
      });
      expect(mockGetWordReminderList).toHaveBeenCalledWith({
        userId: String(testUser.id),
        params: Object.fromEntries(
          new URLSearchParams({
            page: "1",
            limit: PAGINATION_LIMIT,
            column: "created_at",
            direction: "-1",
          })
        ),
      });
    });
  });
});
