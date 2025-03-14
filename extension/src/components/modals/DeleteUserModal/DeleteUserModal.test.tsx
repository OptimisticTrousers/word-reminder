import { createRoutesStub, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

import { DeleteUserModal } from "./DeleteUserModal";
import * as hooks from "../../../hooks/useNotificationError";
import { userService } from "../../../services/user_service";

describe("DeleteUserModal component", () => {
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
                  <DeleteUserModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);

    const { asFragment } = render(<Stub initialEntries={["/"]} />);

    const alert = screen.getByText(
      "Are you sure you want to delete your user?"
    );
    const message = screen.getByText("You can't undo this action.");

    expect(alert).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the functions to delete a user", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
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
                  <DeleteUserModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 200;
    const mockDeleteUser = vi
      .spyOn(userService, "deleteUser")
      .mockImplementation(async () => {
        return { json, status };
      });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const user = userEvent.setup();

    render(<Stub initialEntries={["/"]} />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["sessions"],
    });
    expect(mockDeleteUser).toHaveBeenCalledTimes(1);
    expect(mockDeleteUser).toHaveBeenCalledWith({
      userId: testUser.id,
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
                  <DeleteUserModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 200;
    const message = "Error Message.";
    const mockDeleteUser = vi
      .spyOn(userService, "deleteUser")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const mockShowNotificationError = vi.fn();
    vi.spyOn(hooks, "useNotificationError").mockImplementation(() => {
      return { showNotificationError: mockShowNotificationError };
    });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const user = userEvent.setup();

    render(<Stub initialEntries={["/"]} />);

    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);
    expect(mockDeleteUser).toHaveBeenCalledTimes(1);
    expect(mockDeleteUser).toHaveBeenCalledWith({
      userId: testUser.id,
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
                  <DeleteUserModal {...props} />;
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    const status = 200;
    const delay = 50;
    const mockDeleteUser = vi
      .spyOn(userService, "deleteUser")
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
    expect(mockDeleteUser).toHaveBeenCalledTimes(1);
    expect(mockDeleteUser).toHaveBeenCalledWith({
      userId: testUser.id,
    });
  });

  it("calls the functions to close a modal", async () => {
    const mockToggleModal = vi.fn();
    const props = {
      toggleModal: mockToggleModal,
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
                  <DeleteUserModal {...props} />;
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
