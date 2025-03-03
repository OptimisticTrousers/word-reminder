import { render, screen } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AutoCreateWordReminderModal } from "./CreateAutoWordReminderModal";
import userEvent from "@testing-library/user-event";
import { Order } from "common";
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
                <NotificationProvider>
                  <QueryClientProvider client={queryClient}>
                    <AutoCreateWordReminderModal
                      searchParams={searchParams}
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

  const autoWordReminder = {
    id: "1",
    reminder: {
      minutes: 30,
      hours: 1,
      days: 7,
      weeks: 1,
      months: 1,
    },
    create_now: false,
    duration: {
      minutes: 2,
      hours: 2,
      days: 1,
      weeks: 3,
      months: 2,
    },
    word_count: 7,
    is_active: false,
    has_reminder_onload: false,
    has_learned_words: true,
    order: Order.Oldest,
  };

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
    const order = screen.getByLabelText("Order", { selector: "select" });
    const notification = screen.queryByRole("dialog");
    const modalHeading = screen.getByTestId("modal-heading");
    expect(modalHeading).toBeInTheDocument();
    expect(modalHeading).toHaveTextContent(
      "Automatically Create Word Reminder"
    );
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
    expect(order).toBeInTheDocument();
    expect(order).toHaveValue(Order.Random);
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the functions to automatically create an auto word reminder", async () => {
    const mockAutoCreateWordReminder = vi
      .spyOn(autoWordReminderService, "createAutoWordReminder")
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
    const [reminderMinutes, durationMinutes] =
      screen.getAllByLabelText("Minutes");
    const [reminderHours, durationHours] = screen.getAllByLabelText("Hours");
    const [reminderDays, durationDays] = screen.getAllByLabelText("Days");
    const [reminderWeeks, durationWeeks] = screen.getAllByLabelText("Weeks");
    const [reminderMonths, durationMonths] = screen.getAllByLabelText("Months");
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
    const order = screen.getByLabelText("Order", { selector: "select" });

    await user.type(reminderMinutes, "30");
    await user.type(reminderHours, "1");
    await user.type(reminderDays, "7");
    await user.type(reminderWeeks, "1");
    await user.type(reminderMonths, "1");
    await user.type(durationMinutes, "2");
    await user.type(durationHours, "2");
    await user.type(durationDays, "1");
    await user.type(durationWeeks, "3");
    await user.type(durationMonths, "2");
    await user.type(wordCount, "7");
    await user.click(createNow);
    await user.click(isActive);
    await user.click(hasReminderOnload);
    await user.click(hasLearnedWords);
    await user.selectOptions(order, Order.Oldest);
    await user.click(createButton);

    const notification = screen.getByRole("dialog", {
      name: "Word reminders will now be created automatically!",
    });
    expect(notification).toBeInTheDocument();
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["wordReminders", Object.fromEntries(new URLSearchParams())],
      exact: true,
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockAutoCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockAutoCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        reminder: {
          minutes: 30,
          hours: 1,
          days: 7,
          weeks: 1,
          months: 1,
        },
        create_now: false,
        duration: {
          minutes: 2,
          hours: 2,
          days: 1,
          weeks: 3,
          months: 2,
        },
        word_count: 7,
        is_active: false,
        has_reminder_onload: false,
        has_learned_words: true,
        order: Order.Oldest,
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
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const [reminderHours] = screen.getAllByLabelText("Hours");
    const [, durationWeeks] = screen.getAllByLabelText("Weeks");
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminderHours, "1");
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
        reminder: {
          minutes: 0,
          hours: 1,
          days: 0,
          weeks: 0,
          months: 0,
        },
        duration: {
          minutes: 0,
          hours: 0,
          days: 0,
          weeks: 2,
          months: 0,
        },
        create_now: true,
        word_count: 7,
        is_active: true,
        has_reminder_onload: true,
        has_learned_words: false,
        order: Order.Random,
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
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const [reminderHours] = screen.getAllByLabelText("Hours");
    const [, durationWeeks] = screen.getAllByLabelText("Weeks");
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminderHours, "1");
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
        reminder: {
          minutes: 0,
          hours: 1,
          days: 0,
          weeks: 0,
          months: 0,
        },
        duration: {
          minutes: 0,
          hours: 0,
          days: 0,
          weeks: 2,
          months: 0,
        },
        word_count: 7,
        is_active: true,
        create_now: true,
        has_reminder_onload: true,
        has_learned_words: false,
        order: Order.Random,
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
    const queryClient = new QueryClient();
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
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const [reminderHours] = screen.getAllByLabelText("Hours");
      const [, durationWeeks] = screen.getAllByLabelText("Weeks");
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminderHours, "1 hours");
      await user.type(durationWeeks, "2 weeks");
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
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const [reminderHours] = screen.getAllByLabelText("Hours");
      const [, durationWeeks] = screen.getAllByLabelText("Weeks");
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminderHours, "1 hour");
      await user.type(durationWeeks, "2 weeks");
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
