import { render, screen } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AutoCreateWordReminderModal } from "./AutoCreateWordReminderModal";
import userEvent from "@testing-library/user-event";
import { wordReminderService } from "../../../services/word_reminder_service";
import { Order } from "common";
import { NotificationProvider } from "../../../context/Notification";
import { Mock } from "vitest";

vi.mock("../ModalContainer/ModalContainer");

describe("AutoCreateWordReminderModal component", () => {
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

  const wordReminder = {
    id: "1",
  };

  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with all inputs", async () => {
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const { asFragment } = setup({ toggleModal: mockToggleModal, queryClient });

    const reminder = screen.getByLabelText("Reminder", { selector: "input" });
    const duration = screen.getByLabelText("Duration", { selector: "input" });
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

  it("calls the functions to automatically create a word reminder", async () => {
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
      .mockImplementation(async () => {
        return { json: { wordReminder }, status };
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const reminder = screen.getByLabelText("Reminder", { selector: "input" });
    const duration = screen.getByLabelText("Duration", { selector: "input" });
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

    await user.type(reminder, "1 hour");
    await user.type(duration, "2 weeks");
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
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        auto: true,
        reminder: "1 hour",
        create_now: false,
        duration: "2 weeks",
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
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const mockToggleModal = vi.fn();
    const queryClient = new QueryClient();
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { user } = setup({ toggleModal: mockToggleModal, queryClient });
    const reminder = screen.getByLabelText("Reminder", { selector: "input" });
    const duration = screen.getByLabelText("Duration", { selector: "input" });
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminder, "1 hour");
    await user.type(duration, "2 weeks");
    await user.type(wordCount, "7");
    await user.click(createButton);

    const notification = screen.getByRole("dialog", { name: message });
    expect(notification).toBeInTheDocument();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        auto: true,
        reminder: "1 hour",
        duration: "2 weeks",
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
    const delay = 500;
    const mockCreateWordReminder = vi
      .spyOn(wordReminderService, "createWordReminder")
      .mockImplementation(async () => {
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
    const reminder = screen.getByLabelText("Reminder", { selector: "input" });
    const duration = screen.getByLabelText("Duration", { selector: "input" });
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createButton = screen.getByRole("button", { name: "Create" });

    await user.type(reminder, "1 hour");
    await user.type(duration, "2 weeks");
    await user.type(wordCount, "7");
    await user.click(createButton);

    const notification = screen.queryByRole("dialog");
    expect(notification).not.toBeInTheDocument();
    expect(createButton).toBeDisabled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    expect(mockToggleModal).not.toHaveBeenCalled();
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        auto: true,
        reminder: "1 hour",
        duration: "2 weeks",
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
    it("only allows the user to enter up to 10 characters for reminder", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder", { selector: "input" });
      const duration = screen.getByLabelText("Duration", { selector: "input" });
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "10000 hours");
      await user.type(duration, "2 weeks");
      await user.type(wordCount, "7");
      await user.click(createButton);

      const notification = screen.getByRole("dialog");
      expect(notification).toBeInTheDocument();
      expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
      expect(mockCreateWordReminder).toHaveBeenCalledWith({
        userId: testUser.id,
        body: {
          auto: true,
          reminder: "10000 hour",
          create_now: true,
          duration: "2 weeks",
          word_count: 7,
          is_active: true,
          has_reminder_onload: true,
          has_learned_words: false,
          order: Order.Random,
        },
      });
      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["wordReminders", Object.fromEntries(new URLSearchParams())],
        exact: true,
      });
    });

    it("only allows the user to enter up to 99 for wordCount", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder", { selector: "input" });
      const duration = screen.getByLabelText("Duration", { selector: "input" });
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "10000 hours");
      await user.type(duration, "2 weeks");
      await user.type(wordCount, "100");
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockCreateWordReminder).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("only allows the user to enter up to 10 characters for duration", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder", { selector: "input" });
      const duration = screen.getByLabelText("Duration", { selector: "input" });
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "1 hour");
      await user.type(duration, "20000 weeks");
      await user.type(wordCount, "7");
      await user.click(createButton);

      const notification = screen.getByRole("dialog");
      expect(notification).toBeInTheDocument();
      expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
      expect(mockCreateWordReminder).toHaveBeenCalledWith({
        userId: testUser.id,
        body: {
          auto: true,
          reminder: "1 hour",
          create_now: true,
          duration: "20000 week",
          word_count: 7,
          is_active: true,
          has_reminder_onload: true,
          has_learned_words: false,
          order: Order.Random,
        },
      });
      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["wordReminders", Object.fromEntries(new URLSearchParams())],
        exact: true,
      });
    });

    it("does not allow the user to submit when wordCount is empty", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder", { selector: "input" });
      const duration = screen.getByLabelText("Duration", { selector: "input" });
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "1 hour");
      await user.type(duration, "2 weeks");
      await user.clear(wordCount);
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockCreateWordReminder).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow the user to submit when reminder is empty", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder", { selector: "input" });
      const duration = screen.getByLabelText("Duration", { selector: "input" });
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.clear(reminder);
      await user.type(duration, "2 weeks");
      await user.type(wordCount, "7");
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockCreateWordReminder).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("does not allow the user to submit when duration is empty", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const mockToggleModal = vi.fn();
      const queryClient = new QueryClient();
      const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const { user } = setup({ toggleModal: mockToggleModal, queryClient });
      const reminder = screen.getByLabelText("Reminder", { selector: "input" });
      const duration = screen.getByLabelText("Duration", { selector: "input" });
      const wordCount = screen.getByLabelText("Word Count", {
        selector: "input",
      });
      const createButton = screen.getByRole("button", { name: "Create" });

      await user.type(reminder, "1 hour");
      await user.clear(duration);
      await user.type(wordCount, "7");
      await user.click(createButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockCreateWordReminder).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});
