import { render, screen } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CreateAutoWordReminderModal } from "./CreateAutoWordReminderModal";
import userEvent from "@testing-library/user-event";
import { SortMode } from "common";
import { NotificationProvider } from "../../../context/Notification";
import { Mock } from "vitest";
import { autoWordReminderService } from "../../../services/auto_word_reminder_service/auto_word_reminder_service";

vi.mock("../ModalContainer/ModalContainer");

describe("CreateAutoWordReminderModal component", () => {
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
                    <CreateAutoWordReminderModal toggleModal={toggleModal} />
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

  const autoWordReminder = {
    id: "1",
    reminder: "* * * * *",
    create_now: false,
    duration: 36000000,
    word_count: 7,
    is_active: false,
    has_reminder_onload: false,
    has_learned_words: true,
    sort_mode: SortMode.Oldest,
  };

  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with all inputs", async () => {
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
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
    expect(modalHeading).toHaveTextContent("Create Auto Word Reminder");
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
    expect(sortMode).toHaveValue(SortMode.Random);
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the functions to create an auto word reminder", async () => {
    const mockAutoCreateWordReminder = vi
      .spyOn(autoWordReminderService, "createAutoWordReminder")
      .mockImplementation(async () => {
        return {
          json: { autoWordReminder },
          status,
        };
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const durationMinutes = screen.getByLabelText("Minutes");
    const durationHours = screen.getByLabelText("Hours");
    const durationDays = screen.getByLabelText("Days");
    const durationWeeks = screen.getByLabelText("Weeks");
    const reminder = screen.getByLabelText("Reminder");
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createButton = screen.getByRole("button", { name: "Create" });
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

    await user.type(reminder, "* * * * *");
    await user.type(durationMinutes, "2");
    await user.type(durationHours, "2");
    await user.type(durationDays, "1");
    await user.type(durationWeeks, "3");
    await user.type(wordCount, "7");
    await user.click(createNow);
    await user.click(isActive);
    await user.click(hasReminderOnload);
    await user.click(hasLearnedWords);
    await user.selectOptions(sortMode, SortMode.Oldest);
    await user.click(createButton);

    const notification = screen.getByRole("dialog", {
      name: "Word reminders will now be created automatically!",
    });
    expect(notification).toBeInTheDocument();
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["autoWordReminders"],
      exact: true,
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockAutoCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockAutoCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        reminder: "* * * * *",
        create_now: false,
        duration: 1908120000, // 3 weeks, 1 day, 2 hours, 2 minutes in ms
        word_count: 7,
        is_active: false,
        has_reminder_onload: false,
        has_learned_words: true,
        sort_mode: SortMode.Oldest,
      },
    });
  });

  it("calls the functions to show a notification error", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockAutoCreateWordReminder = vi
      .spyOn(autoWordReminderService, "createAutoWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const reminder = screen.getByLabelText("Reminder");
    const durationWeeks = screen.getByLabelText("Weeks");
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminder, "* * * * *");
    await user.type(durationWeeks, "2");
    await user.type(wordCount, "7");
    await user.click(createButton);

    const notification = screen.getByRole("dialog", { name: message });
    expect(notification).toBeInTheDocument();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockAutoCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockAutoCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        reminder: "* * * * *",
        duration: 1209600000, // 2 weeks in ms
        create_now: true,
        word_count: 7,
        is_active: true,
        has_reminder_onload: true,
        has_learned_words: false,
        sort_mode: SortMode.Random,
      },
    });
  });

  it("disables the create button when the mutation is loading", async () => {
    const delay = 50;
    const mockCreateAutoWordReminder = vi
      .spyOn(autoWordReminderService, "createAutoWordReminder")
      .mockImplementation(async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { autoWordReminder }, status });
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
    const durationWeeks = screen.getByLabelText("Weeks");
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminder, "* * * * *");
    await user.type(durationWeeks, "2");
    await user.type(wordCount, "7");
    await user.click(createButton);

    const notification = screen.queryByRole("dialog");
    expect(notification).not.toBeInTheDocument();
    expect(createButton).toBeDisabled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    expect(mockToggleModal).not.toHaveBeenCalled();
    expect(mockCreateAutoWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateAutoWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        reminder: "* * * * *",
        duration: 1209600000, // 2 weeks in ms
        word_count: 7,
        is_active: true,
        create_now: true,
        has_reminder_onload: true,
        has_learned_words: false,
        sort_mode: SortMode.Random,
      },
    });
  });

  it("calls the functions to close a modal", async () => {
    const mockCreateAutoWordReminder = vi
      .spyOn(autoWordReminderService, "createAutoWordReminder")
      .mockImplementation(async () => {
        return { json: { autoWordReminder }, status };
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
    expect(mockCreateAutoWordReminder).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  describe("form validation", () => {
    it("only allows the user to enter up to 99 for wordCount", async () => {
      const mockCreateAutoWordReminder = vi
        .spyOn(autoWordReminderService, "createAutoWordReminder")
        .mockImplementation(async () => {
          return { json: { autoWordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder");
      const durationWeeks = screen.getByLabelText("Weeks");
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "* * * * *");
      await user.type(durationWeeks, "2");
      await user.type(wordCount, "100");
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockCreateAutoWordReminder).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow the user to submit when wordCount is empty", async () => {
      const mockCreateAutoWordReminder = vi
        .spyOn(autoWordReminderService, "createAutoWordReminder")
        .mockImplementation(async () => {
          return { json: { autoWordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder");
      const durationWeeks = screen.getByLabelText("Weeks");
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "* * * * *");
      await user.type(durationWeeks, "2");
      await user.clear(wordCount);
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockCreateAutoWordReminder).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});
