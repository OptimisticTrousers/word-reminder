import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, Outlet } from "react-router-dom";
import { wordReminderService } from "../../../services/word_reminder_service";
import { NotificationProvider } from "../../../context/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateWordReminderModal } from "./CreateWordReminderModal";
import { wordService } from "../../../services/word_service";
import { ErrorBoundary } from "../../ErrorBoundary/ErrorBoundary";
import { Mock } from "vitest";

vi.mock("../../ErrorBoundary/ErrorBoundary");
vi.mock("../ModalContainer/ModalContainer");

describe("CreateWordReminderModal component", () => {
  const testUser = {
    id: "1",
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
                      <CreateWordReminderModal
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

  const userWord1 = {
    id: "1",
    details: [
      {
        word: "hello",
      },
    ],
  };
  const userWord2 = {
    id: "2",
    details: [
      {
        word: "welcome",
      },
    ],
  };
  const userWord3 = {
    id: "3",
    details: [
      {
        word: "word",
      },
    ],
  };

  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with all inputs", async () => {
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return { json: { userWords: [userWord1, userWord2, userWord3] }, status };
    });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();

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
    const userWordOption3 = screen.getByText(userWord3.details[0].word);
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
    expect(userWordOption3).toBeInTheDocument();
    expect(userWordOption3).toHaveValue(userWord3.details[0].word);
    expect(asFragment).toMatchSnapshot();
  });

  it("calls the functions to create a word reminder", async () => {
    const wordReminder = {
      id: "1",
    };
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return { json: { userWords: [userWord1, userWord2, userWord3] }, status };
    });
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
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
    const finish = screen.getByLabelText("Finish", { selector: "input" });
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const userWords = await screen.findByRole("combobox");
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(minutes, "30");
    await user.type(hours, "1");
    await user.type(days, "7");
    await user.type(weeks, "1");
    await user.type(months, "1");
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
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        auto: false,
        reminder: {
          minutes: 30,
          hours: 1,
          days: 7,
          weeks: 1,
          months: 1,
        },
        finish: new Date("2025-02-04"),
        user_words: [userWord1.id, userWord2.id],
        is_active: false,
        has_reminder_onload: false,
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
      return { json: { userWords: [userWord1, userWord2, userWord3] }, status };
    });
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const hours = screen.getByLabelText("Hours");
    const finish = screen.getByLabelText("Finish", { selector: "input" });
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const userWords = await screen.findByRole("combobox");
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(hours, "1");
    await user.type(finish, "2025-02-04");
    await user.type(
      userWords,
      `${userWord1.details[0].word},${userWord2.details[0].word},${userWord3.details[0].word}`
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
      userId: testUser.id,
      body: {
        auto: false,
        reminder: {
          minutes: 0,
          hours: 1,
          days: 0,
          weeks: 0,
          months: 0,
        },
        finish: new Date("2025-02-04"),
        user_words: [userWord1.id, userWord2.id, userWord3.id],
        is_active: false,
        has_reminder_onload: false,
      },
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("disables the create button when the mutation is loading", async () => {
    const wordReminder = {
      id: "1",
    };
    vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
      return { json: { userWords: [userWord1, userWord2, userWord3] }, status };
    });
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
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const hours = screen.getByLabelText("Hours");
    const finish = screen.getByLabelText("Finish", { selector: "input" });
    const userWords = await screen.findByRole("combobox");
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(hours, "1");
    await user.type(finish, "2025-02-04");
    await user.type(userWords, `${userWord1.details[0].word}`);
    await user.click(createButton);

    expect(createButton).toBeDisabled();
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        auto: false,
        reminder: {
          minutes: 0,
          hours: 1,
          days: 0,
          weeks: 0,
          months: 0,
        },
        finish: new Date("2025-02-04"),
        user_words: [userWord1.id],
        is_active: true,
        has_reminder_onload: true,
      },
    });
    expect(mockToggleModal).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("calls the functions to close a modal", async () => {
    const wordReminder = {
      id: "1",
    };
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
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
    expect(mockCreateWordReminder).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  describe("form validation", () => {
    it("does not allow user to submit without the reminder field", async () => {
      const wordReminder = {
        id: "1",
      };
      vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
        return {
          json: { userWords: [userWord1, userWord2, userWord3] },
          status,
        };
      });
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
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
      const finish = screen.getByLabelText("Finish", { selector: "input" });
      const userWords = await screen.findByRole("combobox");
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.clear(minutes);
      await user.clear(hours);
      await user.clear(days);
      await user.clear(weeks);
      await user.clear(months);
      await user.type(finish, "2025-02-04");
      await user.type(userWords, `${userWord1.details[0].word}`);
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockCreateWordReminder).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow user to submit without the userWords field", async () => {
      const wordReminder = {
        id: "1",
      };
      vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
        return {
          json: { userWords: [userWord1, userWord2, userWord3] },
          status,
        };
      });
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const hours = screen.getByLabelText("Hours");
      const finish = screen.getByLabelText("Finish", { selector: "input" });
      const userWords = await screen.findByRole("combobox");
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(hours, "1");
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
      const wordReminder = {
        id: "1",
      };
      vi.spyOn(wordService, "getWordList").mockImplementation(async () => {
        return {
          json: { userWords: [userWord1, userWord2, userWord3] },
          status,
        };
      });
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const hours = screen.getByLabelText("Hours");
      const finish = screen.getByLabelText("Finish", { selector: "input" });
      const userWords = await screen.findByRole("combobox");
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(hours, "1");
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
