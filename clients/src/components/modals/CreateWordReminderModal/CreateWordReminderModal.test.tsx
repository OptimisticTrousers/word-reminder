import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, Outlet } from "react-router-dom";
import { wordReminderService } from "../../../services/word_reminder_service";
import { NotificationProvider } from "../../../context/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateWordReminderModal } from "./CreateWordReminderModal";
import { userWordService } from "../../../services/user_word_service";
import { ErrorBoundary } from "../../ErrorBoundary/ErrorBoundary";
import { Mock } from "vitest";
import * as useMobilePushNotificationHooks from "../../../hooks/useMobilePushNotifications";

vi.mock("../../ErrorBoundary/ErrorBoundary");
vi.mock("../ModalContainer/ModalContainer");

describe("CreateWordReminderModal component", () => {
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

  const wordReminder = {
    id: 1,
    has_reminder_onload: false,
    is_active: false,
    user_id: testUser.id,
    reminder: "* * * * *",
    finish: new Date("2025-02-08"),
    user_words: [
      {
        learned: userWord1.learned,
        created_at: userWord1.created_at,
        updated_at: userWord1.updated_at,
        details: word1.details,
        id: userWord1.id,
      },
      {
        learned: userWord2.learned,
        created_at: userWord2.created_at,
        updated_at: userWord2.updated_at,
        details: word2.details,
        id: userWord2.id,
      },
    ],
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
                      <CreateWordReminderModal toggleModal={toggleModal} />
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
    vi.spyOn(userWordService, "getUserWordList").mockImplementation(
      async () => {
        return { json: { userWords: [userWord1, userWord2] }, status };
      }
    );
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { asFragment } = setup({ toggleModal: mockToggleModal, queryClient });

    const reminder = screen.getByText("Reminder");
    const finish = screen.getByLabelText("Finish", { selector: "input" });
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const userWords = screen.getByRole("combobox");
    const userWordOption1 = await screen.findByText(userWord1.details[0].word);
    const userWordOption2 = screen.getByText(userWord2.details[0].word);
    const modalHeading = screen.getByTestId("modal-heading");
    expect(modalHeading).toBeInTheDocument();
    expect(modalHeading).toHaveTextContent("Create Word Reminder");
    expect(reminder).toBeInTheDocument();
    expect(finish).toBeInTheDocument();
    expect(isActive).toBeInTheDocument();
    expect(isActive).toBeChecked();
    expect(hasReminderOnload).toBeInTheDocument();
    expect(hasReminderOnload).toBeChecked();
    expect(userWords).toBeInTheDocument();
    expect(userWordOption1).toBeInTheDocument();
    expect(userWordOption1).toHaveValue(userWord1.details[0].word);
    expect(userWordOption2).toBeInTheDocument();
    expect(userWordOption2).toHaveValue(userWord2.details[0].word);
    expect(asFragment).toMatchSnapshot();
  });

  it("calls the functions to create a word reminder", async () => {
    vi.spyOn(userWordService, "getUserWordList").mockImplementation(
      async () => {
        return { json: { userWords: [userWord1, userWord2] }, status };
      }
    );
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
      .mockImplementation(async () => {
        return { json: { wordReminder }, status };
      });
    const mockRegister = vi.fn();
    vi.spyOn(
      useMobilePushNotificationHooks,
      "useMobilePushNotificationRegistration"
    ).mockReturnValue({ register: mockRegister });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const reminder = screen.getByLabelText("Reminder");
    const finish = screen.getByLabelText("Finish", { selector: "input" });
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const userWords = await screen.findByRole("combobox");
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminder, "* * * * *");
    await user.type(finish, "2025-02-04");
    await user.type(
      userWords,
      `${userWord1.details[0].word.toUpperCase()},${userWord2.details[0].word.toUpperCase()}`
    );
    await user.click(isActive);
    await user.click(hasReminderOnload);
    await user.click(createButton);

    const notification = screen.getByRole("dialog", {
      name: "A word reminder has been created!",
    });
    expect(notification).toBeInTheDocument();
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith();
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: String(testUser.id),
      body: {
        reminder: "* * * * *",
        finish: new Date("2025-02-04"),
        user_words: [userWord1, userWord2],
        is_active: false,
        has_reminder_onload: false,
      },
    });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["wordReminders"],
    });
  });

  it("throws an error when the getWordList query fails", async () => {
    vi.spyOn(userWordService, "getUserWordList").mockImplementation(
      async () => {
        return { json: { message: new Error("Error Message.") }, status };
      }
    );
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    setup({ toggleModal: mockToggleModal, queryClient });

    const errorBoundary = await screen.findByTestId("error-boundary");
    expect(errorBoundary).toBeInTheDocument();
  });

  it("calls the functions to show a notification error", async () => {
    const message = "Bad Request.";
    const status = 400;
    vi.spyOn(userWordService, "getUserWordList").mockImplementation(
      async () => {
        return { json: { userWords: [userWord1, userWord2] }, status };
      }
    );
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const mockRegister = vi.fn();
    vi.spyOn(
      useMobilePushNotificationHooks,
      "useMobilePushNotificationRegistration"
    ).mockReturnValue({ register: mockRegister });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const reminder = screen.getByLabelText("Reminder");
    const finish = screen.getByLabelText("Finish", { selector: "input" });
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const userWords = await screen.findByRole("combobox");
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminder, "* * * * *");
    await user.type(finish, "2025-02-04");
    await user.type(
      userWords,
      `${userWord1.details[0].word},${userWord2.details[0].word}`
    );
    await user.click(isActive);
    await user.click(hasReminderOnload);
    await user.click(createButton);

    const notification = screen.getByRole("dialog", {
      name: message,
    });
    expect(notification).toBeInTheDocument();
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: String(testUser.id),
      body: {
        reminder: "* * * * *",
        finish: new Date("2025-02-04"),
        user_words: [userWord1, userWord2],
        is_active: false,
        has_reminder_onload: false,
      },
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("disables the create button when the mutation is loading", async () => {
    vi.spyOn(userWordService, "getUserWordList").mockImplementation(
      async () => {
        return { json: { userWords: [userWord1, userWord2] }, status };
      }
    );
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
      .mockImplementation(async () => {
        const delay = 50;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { wordReminder }, status });
          }, delay);
        });
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const reminder = screen.getByLabelText("Reminder");
    const finish = screen.getByLabelText("Finish", { selector: "input" });
    const userWords = await screen.findByRole("combobox");
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminder, "* * * * *");
    await user.type(finish, "2025-02-04");
    await user.type(userWords, `${userWord1.details[0].word}`);
    await user.click(createButton);

    expect(createButton).toBeDisabled();
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: String(testUser.id),
      body: {
        reminder: "* * * * *",
        finish: new Date("2025-02-04"),
        user_words: [userWord1],
        is_active: true,
        has_reminder_onload: true,
      },
    });
    expect(mockToggleModal).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("calls the functions to close a modal", async () => {
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
      .mockImplementation(async () => {
        return { json: { wordReminder }, status };
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });

    const closeButton = screen.getByRole("button", { name: "Close modal" });
    await user.click(closeButton);

    const notification = screen.queryByRole("dialog");
    expect(notification).not.toBeInTheDocument();
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockCreateWordReminder).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  describe("form validation", () => {
    it("does not allow user to submit without the reminder field", async () => {
      vi.spyOn(userWordService, "getUserWordList").mockImplementation(
        async () => {
          return {
            json: { userWords: [userWord1, userWord2] },
            status,
          };
        }
      );
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder");
      const finish = screen.getByLabelText("Finish", { selector: "input" });
      const userWords = await screen.findByRole("combobox");
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.clear(reminder);
      await user.type(finish, "2025-02-04");
      await user.type(userWords, `${userWord1.details[0].word}`);
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockCreateWordReminder).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow user to submit without the user_words field", async () => {
      vi.spyOn(userWordService, "getUserWordList").mockImplementation(
        async () => {
          return {
            json: { userWords: [userWord1, userWord2] },
            status,
          };
        }
      );
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder");
      const finish = screen.getByLabelText("Finish", { selector: "input" });
      const userWords = await screen.findByRole("combobox");
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "* * * * *");
      await user.type(finish, "2025-02-04");
      await user.clear(userWords);
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockCreateWordReminder).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow user to submit without the finish field", async () => {
      vi.spyOn(userWordService, "getUserWordList").mockImplementation(
        async () => {
          return {
            json: { userWords: [userWord1, userWord2] },
            status,
          };
        }
      );
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder");
      const finish = screen.getByLabelText("Finish", { selector: "input" });
      const userWords = await screen.findByRole("combobox");
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "* * * * *");
      await user.clear(finish);
      await user.type(userWords, `${userWord1.details[0].word}`);
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockCreateWordReminder).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});
