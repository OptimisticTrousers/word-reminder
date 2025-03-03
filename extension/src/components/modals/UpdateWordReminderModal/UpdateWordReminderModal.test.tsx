import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, Outlet } from "react-router-dom";
import { wordReminderService } from "../../../services/word_reminder_service";
import { NotificationProvider } from "../../../context/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UpdateWordReminderModal } from "./UpdateWordReminderModal";
import { wordService } from "../../../services/word_service";
import { ErrorBoundary } from "../../ErrorBoundary/ErrorBoundary";
import { Mock } from "vitest";
import { UserWord, Word } from "common";

vi.mock("../../ErrorBoundary/ErrorBoundary");
vi.mock("../ModalContainer/ModalContainer");

describe("UpdateWordReminderModal component", () => {
  const testUser = {
    id: "1",
  };
  const word1 = {
    id: "1",
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
    id: "2",
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
    id: "1",
    user_id: testUser.id,
    word_id: word1.id,
    details: word1.details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: "2",
    user_id: testUser.id,
    word_id: word2.id,
    details: word2.details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const wordReminder = {
    id: "1",
    has_reminder_onload: false,
    is_active: false,
    user_id: testUser.id,
    reminder: {
      minutes: 0,
      hours: 2,
      days: 0,
      weeks: 0,
      months: 0,
    },
    finish: new Date("2025-02-08"),
    user_words: [userWord1, userWord2],
    created_at: new Date(),
    updated_at: new Date(),
  };

  function setup({
    toggleModal,
    queryClient,
  }: {
    toggleModal: Mock;
    queryClient: QueryClient;
  }) {
    const searchParams = new URLSearchParams();
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
                <ErrorBoundary>
                  <NotificationProvider>
                    <QueryClientProvider client={queryClient}>
                      <UpdateWordReminderModal
                        wordReminder={{
                          ...wordReminder,
                          reminder: { ...wordReminder.reminder, id: "1" },
                        }}
                        searchParams={searchParams}
                        toggleModal={toggleModal}
                      />
                    </QueryClientProvider>
                  </NotificationProvider>
                </ErrorBoundary>
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

  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with all inputs", async () => {
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return { json: { userWords: [userWord1, userWord2] }, status };
    });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();

    const { asFragment } = setup({ toggleModal: mockToggleModal, queryClient });

    const reminder = screen.getByText("Reminder");
    const finish = screen.getByDisplayValue(
      wordReminder.finish.toISOString().split("T")[0]
    );
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const userWords = screen.getByDisplayValue(
      String(
        wordReminder.user_words.map((userWord: UserWord & Word) => {
          return userWord.details[0].word;
        })
      )
    );
    const userWordOption1 = await screen.findByText(userWord1.details[0].word);
    const userWordOption2 = screen.getByText(userWord2.details[0].word);
    const modalHeading = screen.getByTestId("modal-heading");
    expect(modalHeading).toBeInTheDocument();
    expect(modalHeading).toHaveTextContent("Update Word Reminder");
    expect(reminder).toBeInTheDocument();
    expect(finish).toBeInTheDocument();
    expect(isActive).toBeInTheDocument();
    expect(isActive).not.toBeChecked();
    expect(hasReminderOnload).toBeInTheDocument();
    expect(hasReminderOnload).not.toBeChecked();
    expect(userWords).toBeInTheDocument();
    expect(userWordOption1).toBeInTheDocument();
    expect(userWordOption1).toHaveValue(userWord1.details[0].word);
    expect(userWordOption2).toBeInTheDocument();
    expect(userWordOption2).toHaveValue(userWord2.details[0].word);
    expect(asFragment).toMatchSnapshot();
  });

  it("calls the functions to update a word reminder", async () => {
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return { json: { userWords: [userWord1, userWord2] }, status };
    });
    const mockUpdateWordReminder = vi
      .spyOn(wordReminderService, "updateWordReminder")
      .mockImplementation(async () => {
        return { json: { wordReminder }, status };
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const minutes = screen.getByLabelText("Minutes");
    const hours = screen.getByLabelText("Hours");
    const days = screen.getByLabelText("Days");
    const weeks = screen.getByLabelText("Weeks");
    const months = screen.getByLabelText("Months");
    const finish = screen.getByDisplayValue(
      wordReminder.finish.toISOString().split("T")[0]
    );
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const userWords = await screen.findByDisplayValue(
      String(
        wordReminder.user_words.map((userWord: UserWord & Word) => {
          return userWord.details[0].word;
        })
      )
    );
    const updateButton = screen.getByRole("button", { name: "Update" });

    await user.clear(minutes);
    await user.clear(hours);
    await user.clear(days);
    await user.clear(weeks);
    await user.clear(months);
    await user.type(minutes, "30");
    await user.type(hours, "1");
    await user.type(days, "7");
    await user.type(weeks, "1");
    await user.type(months, "1");
    await user.clear(finish);
    await user.type(finish, "2025-02-10");
    await user.clear(userWords);
    await user.type(userWords, `${userWord1.details[0].word.toUpperCase()}`);
    await user.click(isActive);
    await user.click(hasReminderOnload);
    await user.click(updateButton);

    const notification = screen.getByRole("dialog", {
      name: "Your word reminder has been updated!",
    });
    expect(notification).toBeInTheDocument();
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockUpdateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockUpdateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: wordReminder.id,
      body: {
        reminder: {
          minutes: 30,
          hours: 1,
          days: 7,
          weeks: 1,
          months: 1,
        },
        finish: new Date("2025-02-10"),
        user_words: [userWord1.id],
        is_active: !wordReminder.is_active,
        has_reminder_onload: !wordReminder.has_reminder_onload,
      },
    });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["wordReminders", Object.fromEntries(new URLSearchParams())],
      exact: true,
    });
  });

  it("throws an error when the getWordList query fails", async () => {
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return { json: { message: new Error("Error Message.") }, status };
    });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();

    setup({ toggleModal: mockToggleModal, queryClient });

    const errorBoundary = await screen.findByTestId("error-boundary");
    expect(errorBoundary).toBeInTheDocument();
  });

  it("calls the functions to show a notification error", async () => {
    const message = "Bad Request.";
    const status = 400;
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return { json: { userWords: [userWord1, userWord2] }, status };
    });
    const mockUpdateWordReminder = vi
      .spyOn(wordReminderService, "updateWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const updateButton = screen.getByRole("button", { name: "Update" });

    await user.click(updateButton);

    const notification = screen.getByRole("dialog", {
      name: message,
    });
    expect(notification).toBeInTheDocument();
    expect(mockUpdateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockUpdateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: wordReminder.id,
      body: {
        reminder: wordReminder.reminder,
        finish: wordReminder.finish,
        user_words: [userWord1.id, userWord2.id],
        is_active: wordReminder.is_active,
        has_reminder_onload: wordReminder.has_reminder_onload,
      },
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("disables the update button when the mutation is loading", async () => {
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return { json: { userWords: [userWord1, userWord2] }, status };
    });
    const mockUpdateWordReminder = vi
      .spyOn(wordReminderService, "updateWordReminder")
      .mockImplementation(async () => {
        const delay = 50;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { wordReminder }, status });
          }, delay);
        });
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const updateButton = screen.getByRole("button", { name: "Update" });

    await user.click(updateButton);

    expect(updateButton).toBeDisabled();
    expect(mockUpdateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockUpdateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: wordReminder.id,
      body: {
        reminder: wordReminder.reminder,
        finish: wordReminder.finish,
        user_words: [userWord1.id, userWord2.id],
        is_active: wordReminder.is_active,
        has_reminder_onload: wordReminder.has_reminder_onload,
      },
    });
    expect(mockToggleModal).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("calls the functions to close a modal", async () => {
    const wordReminder = {
      id: "1",
    };
    const mockUpdateWordReminder = vi
      .spyOn(wordReminderService, "updateWordReminder")
      .mockImplementation(async () => {
        return { json: { wordReminder }, status };
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });

    const closeButton = screen.getByRole("button", { name: "Close modal" });
    await user.click(closeButton);

    const notification = screen.queryByRole("dialog");
    expect(notification).not.toBeInTheDocument();
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockUpdateWordReminder).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  describe("form validation", () => {
    it("does not allow user to submit without the reminder field", async () => {
      vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
        return {
          json: { userWords: [userWord1, userWord2] },
          status,
        };
      });
      const mockUpdateWordReminder = vi
        .spyOn(wordReminderService, "updateWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const minutes = screen.getByLabelText("Minutes");
      const hours = screen.getByLabelText("Hours");
      const days = screen.getByLabelText("Days");
      const weeks = screen.getByLabelText("Weeks");
      const months = screen.getByLabelText("Months");
      const finish = screen.getByDisplayValue(
        wordReminder.finish.toISOString().split("T")[0]
      );
      const userWords = screen.getByDisplayValue(
        String(
          wordReminder.user_words.map((userWord: UserWord & Word) => {
            return userWord.details[0].word;
          })
        )
      );
      const updateButton = screen.getByRole("button", { name: "Update" });

      await user.clear(minutes);
      await user.clear(hours);
      await user.clear(days);
      await user.clear(weeks);
      await user.clear(months);
      await user.type(finish, "2025-02-04");
      await user.type(userWords, `${userWord1.details[0].word}`);
      await user.click(updateButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockUpdateWordReminder).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow user to submit without the userWords field", async () => {
      vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
        return {
          json: { userWords: [userWord1, userWord2] },
          status,
        };
      });
      const mockUpdateWordReminder = vi
        .spyOn(wordReminderService, "updateWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const hours = screen.getByLabelText("Hours");
      const finish = screen.getByDisplayValue(
        wordReminder.finish.toISOString().split("T")[0]
      );
      const userWords = screen.getByDisplayValue(
        String(
          wordReminder.user_words.map((userWord: UserWord & Word) => {
            return userWord.details[0].word;
          })
        )
      );
      const updateButton = screen.getByRole("button", { name: "Update" });

      await user.type(hours, "1");
      await user.type(finish, "2025-02-04");
      await user.clear(userWords);
      await user.click(updateButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockUpdateWordReminder).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow user to submit without the finish field", async () => {
      vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
        return {
          json: { userWords: [userWord1, userWord2] },
          status,
        };
      });
      const mockUpdateWordReminder = vi
        .spyOn(wordReminderService, "updateWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const hours = screen.getByLabelText("Hours");
      const finish = screen.getByDisplayValue(
        wordReminder.finish.toISOString().split("T")[0]
      );
      const userWords = screen.getByDisplayValue(
        String(
          wordReminder.user_words.map((userWord: UserWord & Word) => {
            return userWord.details[0].word;
          })
        )
      );
      const updateButton = screen.getByRole("button", { name: "Update" });

      await user.type(hours, "1");
      await user.clear(finish);
      await user.type(userWords, `${userWord1.details[0].word}`);
      await user.click(updateButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockUpdateWordReminder).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});
