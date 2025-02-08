import { render, screen } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AutoCreateWordReminderModal } from "./AutoCreateWordReminderModal";
import userEvent from "@testing-library/user-event";
import { wordReminderService } from "../../../services/word_reminder_service";
import { Order } from "common";
import { NotificationProvider } from "../../../context/Notification";

vi.mock("../../ModalContainer/ModalContainer");

describe("AutoCreateWordReminderModal component", () => {
  const testUser = {
    id: "1",
  };

  const mockToggleModal = vi.fn();
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
                <NotificationProvider>
                  <QueryClientProvider client={queryClient}>
                    <AutoCreateWordReminderModal
                      toggleModal={mockToggleModal}
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
    vi.spyOn(wordReminderService, "createWordReminder").mockImplementation(
      async () => {
        return { json: { wordReminder }, status };
      }
    );

    const { asFragment } = setup();

    const reminder = screen.getByLabelText("Reminder", { selector: "input" });
    const duration = screen.getByLabelText("Duration", { selector: "input" });
    const wordCount = screen.getByLabelText("Word Count", {
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
    const modal = screen.getByRole("dialog", {
      name: "Automatically Create Word Reminder",
    });
    expect(modal).toBeInTheDocument();
    expect(reminder).toBeInTheDocument();
    expect(duration).toBeInTheDocument();
    expect(wordCount).toBeInTheDocument();
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
    const { user } = setup();
    const reminder = screen.getByLabelText("Reminder", { selector: "input" });
    const duration = screen.getByLabelText("Duration", { selector: "input" });
    const wordCount = screen.getByLabelText("Word Count", {
      selector: "input",
    });
    const createButton = screen.getByRole("button", { name: "Create" });
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
    await user.click(isActive);
    await user.click(hasReminderOnload);
    await user.click(hasLearnedWords);
    await user.selectOptions(order, Order.Oldest);
    await user.click(createButton);

    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        auto: true,
        reminder: "1 hour",
        duration: "2 weeks",
        wordCount: 7,
        isActive: false,
        hasReminderOnload: false,
        hasLearnedWords: true,
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
    const { user } = setup();
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
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        auto: true,
        reminder: "1 hour",
        duration: "2 weeks",
        wordCount: 7,
        isActive: true,
        hasReminderOnload: true,
        hasLearnedWords: false,
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
    const { user } = setup();
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

    expect(createButton).toBeDisabled();
    expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
    expect(mockCreateWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        auto: true,
        reminder: "1 hour",
        duration: "2 weeks",
        wordCount: 7,
        isActive: true,
        hasReminderOnload: true,
        hasLearnedWords: false,
        order: Order.Random,
      },
    });
  });

  it("calls the functions to close a modal", async () => {
    const { user } = setup();

    const closeButton = screen.getByRole("button", { name: "Close modal" });
    await user.click(closeButton);

    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
  });

  describe("form validation", () => {
    it("only allows the user to enter up to 10 characters for reminder", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const { user } = setup();
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

      expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
      expect(mockCreateWordReminder).toHaveBeenCalledWith({
        userId: testUser.id,
        body: {
          auto: true,
          reminder: "10000 hour",
          duration: "2 weeks",
          wordCount: 7,
          isActive: true,
          hasReminderOnload: true,
          hasLearnedWords: false,
          order: Order.Random,
        },
      });
    });

    it("only allows the user to enter up to 99 for wordCount", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const { user } = setup();
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

      expect(mockCreateWordReminder).not.toHaveBeenCalled();
    });

    it("only allows the user to enter up to 10 characters for duration", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const { user } = setup();
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

      expect(mockCreateWordReminder).toHaveBeenCalledTimes(1);
      expect(mockCreateWordReminder).toHaveBeenCalledWith({
        userId: testUser.id,
        body: {
          auto: true,
          reminder: "1 hour",
          duration: "20000 week",
          wordCount: 7,
          isActive: true,
          hasReminderOnload: true,
          hasLearnedWords: false,
          order: Order.Random,
        },
      });
    });

    it("does not allow the user to submit when wordCount is empty", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const { user } = setup();
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

      expect(mockCreateWordReminder).not.toHaveBeenCalled();
    });

    it("does not allow the user to submit when reminder is empty", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const { user } = setup();
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

      expect(mockCreateWordReminder).not.toHaveBeenCalled();
    });

    it("does not allow the user to submit when duration is empty", async () => {
      const mockCreateWordReminder = vi
        .spyOn(wordReminderService, "createWordReminder")
        .mockImplementation(async () => {
          return { json: { wordReminder }, status };
        });
      const { user } = setup();
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

      expect(mockCreateWordReminder).not.toHaveBeenCalled();
    });
  });
});
