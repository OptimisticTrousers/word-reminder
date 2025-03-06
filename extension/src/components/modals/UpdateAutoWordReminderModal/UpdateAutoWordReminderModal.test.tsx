import { render, screen } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UpdateAutoWordReminderModal } from "./UpdateAutoWordReminderModal";
import userEvent from "@testing-library/user-event";
import { SortMode } from "common";
import { NotificationProvider } from "../../../context/Notification";
import { Mock } from "vitest";
import { autoWordReminderService } from "../../../services/auto_word_reminder_service/auto_word_reminder_service";

vi.mock("../ModalContainer/ModalContainer");

describe("UpdateAutoWordReminderModal component", () => {
  const testUser = {
    id: 1,
  };

  const autoWordReminder = {
    user_id: testUser.id,
    id: 1,
    reminder: "* * * * *",
    create_now: false,
    duration: 36000000,
    word_count: 7,
    is_active: true,
    has_reminder_onload: true,
    has_learned_words: false,
    sort_mode: SortMode.Oldest,
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
                <NotificationProvider>
                  <QueryClientProvider client={queryClient}>
                    <UpdateAutoWordReminderModal
                      autoWordReminder={autoWordReminder}
                      toggleModal={toggleModal}
                    />
                  </QueryClientProvider>
                </NotificationProvider>
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

  it("renders form with all inputs", async () => {
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const { asFragment } = setup({ toggleModal: mockToggleModal, queryClient });

    const reminder = screen.getByText("Reminder");
    const duration = screen.getByText("Duration");
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createNow = screen.getByLabelText("Create Now", {
      selector: "input",
    });
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const hasLearnedWords = screen.getByLabelText("Has Learned Words", {
      selector: "input",
    });
    const sortMode = screen.getByLabelText("Sort Mode", { selector: "select" });
    const notification = screen.queryByRole("dialog");
    const modalHeading = screen.getByTestId("modal-heading");
    expect(modalHeading).toBeInTheDocument();
    expect(modalHeading).toHaveTextContent("Update Auto Word Reminder");
    expect(notification).not.toBeInTheDocument();
    expect(reminder).toBeInTheDocument();
    expect(duration).toBeInTheDocument();
    expect(wordCount).toBeInTheDocument();
    expect(createNow).toBeInTheDocument();
    expect(createNow).toBeChecked();
    expect(isActive).toBeInTheDocument();
    expect(isActive).toBeChecked();
    expect(hasReminderOnload).toBeInTheDocument();
    expect(hasReminderOnload).toBeChecked();
    expect(hasLearnedWords).toBeInTheDocument();
    expect(hasLearnedWords).not.toBeChecked();
    expect(sortMode).toBeInTheDocument();
    expect(sortMode).toHaveValue(SortMode.Oldest);
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the functions to update an auto word reminder", async () => {
    const mockUpdateAutoWordReminder = vi
      .spyOn(autoWordReminderService, "updateAutoWordReminder")
      .mockImplementation(async () => {
        return {
          json: { autoWordReminder },
          status,
        };
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const reminder = screen.getByLabelText("Reminder");
    const minutes = screen.getByLabelText("Minutes");
    const hours = screen.getByLabelText("Hours");
    const days = screen.getByLabelText("Days");
    const weeks = screen.getByLabelText("Weeks");
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const updateButton = screen.getByRole("button", { name: "Update" });
    const createNow = screen.getByLabelText("Create Now", {
      selector: "input",
    });
    const isActive = screen.getByLabelText("Is Active", { selector: "input" });
    const hasReminderOnload = screen.getByLabelText("Has Reminder Onload", {
      selector: "input",
    });
    const hasLearnedWords = screen.getByLabelText("Has Learned Words", {
      selector: "input",
    });
    const sortMode = screen.getByLabelText("Sort Mode", { selector: "select" });
    await user.clear(reminder);
    await user.clear(minutes);
    await user.clear(hours);
    await user.clear(days);
    await user.clear(weeks);
    await user.clear(wordCount);

    await user.type(reminder, "* * * * *");
    await user.type(minutes, "1");
    await user.type(hours, "7");
    await user.type(days, "1");
    await user.type(weeks, "1");
    await user.type(wordCount, "7");
    await user.click(createNow);
    await user.click(isActive);
    await user.click(hasReminderOnload);
    await user.click(hasLearnedWords);
    await user.selectOptions(sortMode, SortMode.Oldest);
    await user.click(updateButton);

    const notification = screen.getByRole("dialog", {
      name: "Your auto word reminder preferences have been updated!",
    });
    expect(notification).toBeInTheDocument();
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["autoWordReminders"],
      exact: true,
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockUpdateAutoWordReminder).toHaveBeenCalledTimes(1);
    expect(mockUpdateAutoWordReminder).toHaveBeenCalledWith({
      userId: String(testUser.id),
      autoWordReminderId: String(autoWordReminder.id),
      body: {
        reminder: "* * * * *",
        create_now: false,
        duration: 716460000, // 1 week, 1 day, 7 hours, 1 minute in milliseconds
        word_count: 7,
        is_active: !autoWordReminder.is_active,
        has_reminder_onload: !autoWordReminder.has_reminder_onload,
        has_learned_words: !autoWordReminder.has_learned_words,
        sort_mode: SortMode.Oldest,
      },
    });
  });

  it("calls the functions to show a notification error", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockUpdateAutoWordReminder = vi
      .spyOn(autoWordReminderService, "updateAutoWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const updateButton = screen.getByRole("button", { name: "Update" });

    await user.click(updateButton);

    const notification = screen.getByRole("dialog", { name: message });
    expect(notification).toBeInTheDocument();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockUpdateAutoWordReminder).toHaveBeenCalledTimes(1);
    expect(mockUpdateAutoWordReminder).toHaveBeenCalledWith({
      userId: String(testUser.id),
      autoWordReminderId: String(autoWordReminder.id),
      body: {
        reminder: "* * * * *",
        duration: 36000000, // 6 hours in milliseconds
        word_count: autoWordReminder.word_count,
        is_active: autoWordReminder.is_active,
        create_now: true,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        has_learned_words: autoWordReminder.has_learned_words,
        sort_mode: autoWordReminder.sort_mode,
      },
    });
  });

  it("disables the create button when the mutation is loading", async () => {
    const delay = 50;
    const mockUpdateAutoWordReminder = vi
      .spyOn(autoWordReminderService, "updateAutoWordReminder")
      .mockImplementation(async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { autoWordReminder }, status });
          }, delay);
        });
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const updateButton = screen.getByRole("button", { name: "Update" });

    await user.click(updateButton);

    const notification = screen.queryByRole("dialog");
    expect(notification).not.toBeInTheDocument();
    expect(updateButton).toBeDisabled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    expect(mockToggleModal).not.toHaveBeenCalled();
    expect(mockUpdateAutoWordReminder).toHaveBeenCalledTimes(1);
    expect(mockUpdateAutoWordReminder).toHaveBeenCalledWith({
      userId: String(testUser.id),
      autoWordReminderId: String(autoWordReminder.id),
      body: {
        reminder: "* * * * *",
        duration: 36000000, // 6 hours in milliseconds
        word_count: autoWordReminder.word_count,
        is_active: autoWordReminder.is_active,
        create_now: true,
        has_reminder_onload: autoWordReminder.has_reminder_onload,
        has_learned_words: autoWordReminder.has_learned_words,
        sort_mode: autoWordReminder.sort_mode,
      },
    });
  });

  it("calls the functions to close a modal", async () => {
    const mockUpdateAutoWordReminder = vi
      .spyOn(autoWordReminderService, "updateAutoWordReminder")
      .mockImplementation(async () => {
        return { json: { autoWordReminder }, status };
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
    expect(mockUpdateAutoWordReminder).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  describe("form validation", () => {
    it("only allows the user to enter up to 99 for wordCount", async () => {
      const mockUpdateAutoWordReminder = vi
        .spyOn(autoWordReminderService, "updateAutoWordReminder")
        .mockImplementation(async () => {
          return { json: { autoWordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const updateButton = screen.getByRole("button", { name: "Update" });

      await user.clear(wordCount);
      await user.type(wordCount, "100");
      await user.click(updateButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockUpdateAutoWordReminder).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow the user to submit when wordCount is empty", async () => {
      const mockUpdateAutoWordReminder = vi
        .spyOn(autoWordReminderService, "updateAutoWordReminder")
        .mockImplementation(async () => {
          return { json: { autoWordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const updateButton = screen.getByRole("button", { name: "Update" });

      await user.clear(wordCount);
      await user.clear(wordCount);
      await user.click(updateButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockUpdateAutoWordReminder).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});
