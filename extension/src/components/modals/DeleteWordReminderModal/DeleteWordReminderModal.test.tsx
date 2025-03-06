import { createRoutesStub, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

import { DeleteWordReminderModal } from "./DeleteWordReminderModal";
import * as hooks from "../../../hooks/useNotificationError";
import { wordReminderService } from "../../../services/word_reminder_service";

describe("DeleteWordReminderModal component", () => {
  const json = {
    word: { id: "1" },
  };

  const testUser = {
    id: "1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with alert and message", async () => {
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordReminderId: "1",
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
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
                  <DeleteWordReminderModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);

    const { asFragment } = render(<Stub initialEntries={["/"]} />);
    const alert = screen.getByText(
      "Are you sure you want to delete this word reminder?"
    );
    const message = screen.getByText("You can't undo this action.");

    expect(alert).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the functions to delete a word", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordReminderId: "1",
    };
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
                  <DeleteWordReminderModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 200;
    const mockDeleteWordReminder = vi
      .spyOn(wordReminderService, "deleteWordReminder")
      .mockImplementation(async () => {
        return { json, status };
      });
    const user = userEvent.setup();

    render(<Stub initialEntries={["/"]} />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);
    expect(mockDeleteWordReminder).toHaveBeenCalledTimes(1);
    expect(mockDeleteWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: props.wordReminderId,
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
  });

  it("calls the functions to show a notification error", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordReminderId: "1",
    };
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
                  <DeleteWordReminderModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 400;
    const message = "Error Message.";
    const mockDeleteWordReminder = vi
      .spyOn(wordReminderService, "deleteWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const mockShowNotificationError = vi.fn();
    vi.spyOn(hooks, "useNotificationError").mockImplementation(() => {
      return { showNotificationError: mockShowNotificationError };
    });
    const user = userEvent.setup();

    render(<Stub initialEntries={["/"]} />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);
    expect(mockDeleteWordReminder).toHaveBeenCalledTimes(1);
    expect(mockDeleteWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: props.wordReminderId,
    });
    expect(mockShowNotificationError).toHaveBeenCalledTimes(1);
    expect(mockShowNotificationError).toHaveBeenCalledWith({
      json: { message },
      status,
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
  });

  it("disables the delete button when the mutation is loading", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordReminderId: "1",
    };
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
                  <DeleteWordReminderModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 200;
    const delay = 50;
    const mockDeleteWordReminder = vi
      .spyOn(wordReminderService, "deleteWordReminder")
      .mockImplementation(async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json, status });
          }, delay);
        });
      });
    const user = userEvent.setup();

    render(<Stub initialEntries={["/"]} />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(deleteButton).toBeDisabled();
    expect(mockDeleteWordReminder).toHaveBeenCalledTimes(1);
    expect(mockDeleteWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: props.wordReminderId,
    });
  });

  it("calls the functions to close a modal", async () => {
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordReminderId: "1",
    };
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
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
                  <DeleteWordReminderModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    render(<Stub initialEntries={["/"]} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(props.toggleModal).toHaveBeenCalledTimes(1);
    expect(props.toggleModal).toHaveBeenCalledWith();
  });
});
