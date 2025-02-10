import { createRoutesStub, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

import { DeleteUserWordModal } from "./DeleteUserWordModal";
import * as hooks from "../../../hooks/useNotificationError";
import { wordService } from "../../../services/word_service";

describe("DeleteUserWordReminderModal component", () => {
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
      wordId: "1",
    };
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
                  <DeleteUserWordModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);

    const { asFragment } = render(<Stub initialEntries={["/"]} />);

    const alert = screen.getByText(
      "Are you sure you want to delete your user word?"
    );
    const message = screen.getByText("You can't undo this action.");

    expect(alert).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the functions to delete a word", async () => {
    const queryClient = new QueryClient();
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordId: "1",
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
                  <DeleteUserWordModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 200;
    const mockDeleteUserWord = vi
      .spyOn(wordService, "deleteUserWord")
      .mockImplementation(async () => {
        return { json, status };
      });
    const user = userEvent.setup();

    render(<Stub initialEntries={["/"]} />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);
    expect(mockDeleteUserWord).toHaveBeenCalledTimes(1);
    expect(mockDeleteUserWord).toHaveBeenCalledWith({
      userId: testUser.id,
      wordId: props.wordId,
    });
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
  });

  it("calls the functions to show a notification error", async () => {
    const queryClient = new QueryClient();
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordId: "1",
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
                  <DeleteUserWordModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 200;
    const message = "Error Message.";
    const mockDeleteUserWord = vi
      .spyOn(wordService, "deleteUserWord")
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
    expect(mockDeleteUserWord).toHaveBeenCalledTimes(1);
    expect(mockDeleteUserWord).toHaveBeenCalledWith({
      userId: testUser.id,
      wordId: props.wordId,
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
    const queryClient = new QueryClient();
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordId: "1",
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
                  <DeleteUserWordModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 200;
    const delay = 50;
    const mockDeleteUserWord = vi
      .spyOn(wordService, "deleteUserWord")
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
    expect(mockDeleteUserWord).toHaveBeenCalledTimes(1);
    expect(mockDeleteUserWord).toHaveBeenCalledWith({
      userId: testUser.id,
      wordId: props.wordId,
    });
  });

  it("calls the functions to close a modal", async () => {
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
      wordId: "1",
    };
    const user = userEvent.setup();
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
                  <DeleteUserWordModal {...props} />;
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
