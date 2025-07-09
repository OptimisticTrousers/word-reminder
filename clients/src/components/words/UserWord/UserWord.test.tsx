import { Detail, UserWord as UserWordI } from "common";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserWord } from "./UserWord";
import { createRoutesStub, Outlet } from "react-router-dom";
import { userWordService } from "../../../services/user_word_service";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "../../../context/Notification";

vi.mock("../CondensedWord/CondensedWord", () => {
  return {
    CondensedWord: function ({ details }: { details: Detail[] }) {
      return (
        <>
          <div data-testid="details">{JSON.stringify(details)}</div>
        </>
      );
    },
  };
});

vi.mock("../../modals/DeleteUserWordModal", () => {
  return {
    DeleteUserWordModal: function () {
      return <div data-testid="modal"></div>;
    },
  };
});

const props = {
  id: 1,
  word_id: 1,
  user_id: 1,
  learned: false,
  updated_at: new Date("December 17, 1995 03:24:00"),
  created_at: new Date("December 17, 1995 03:24:00"),
  details: [{ word: "exemplary", phonetics: [], meanings: [] }],
};

describe("UserWord component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testUser = {
    id: "1",
  };

  function setup({
    userWord,
    queryClient,
  }: {
    userWord: UserWordI & { details: Detail[] };
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
                    <UserWord {...userWord} />
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

  it("renders user word component when learned is true", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    setup({ userWord: { ...props, learned: true }, queryClient });

    const word = screen.getByText(`${props.details[0].word}`);
    const createdAt = screen.getByText(
      `Created At: ${props.created_at.toLocaleString()}`
    );
    const updatedAt = screen.getByText(
      `Updated At: ${props.created_at.toLocaleString()}`
    );
    const learned = screen.getByText("Learned: Yes");
    const infoButton = screen.getByRole("button", {
      name: "More word details",
    });
    const toggleLearnedButton = screen.getByRole("button", {
      name: "Toggle Learned",
    });
    const deleteButton = screen.getByRole("button", {
      name: "Open delete user word modal",
    });
    const moreWordDetailsLink = screen.getByRole("link", {
      name: "More Word Details",
    });
    expect(word).toBeInTheDocument();
    expect(createdAt).toBeInTheDocument();
    expect(updatedAt).toBeInTheDocument();
    expect(learned).toBeInTheDocument();
    expect(infoButton).toBeInTheDocument();
    expect(toggleLearnedButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(moreWordDetailsLink).toBeInTheDocument();
  });

  it("renders user word component when learned is false", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    setup({ userWord: { ...props, learned: false }, queryClient });

    const word = screen.getByText(`${props.details[0].word}`);
    const createdAt = screen.getByText(
      `Created At: ${props.created_at.toLocaleString()}`
    );
    const updatedAt = screen.getByText(
      `Updated At: ${props.created_at.toLocaleString()}`
    );
    const learned = screen.getByText("Learned: No");
    const infoButton = screen.getByRole("button", {
      name: "More word details",
    });
    const toggleLearnedButton = screen.getByRole("button", {
      name: "Toggle Learned",
    });
    const deleteButton = screen.getByRole("button", {
      name: "Open delete user word modal",
    });
    const moreWordDetailsLink = screen.getByRole("link", {
      name: "More Word Details",
    });
    expect(word).toBeInTheDocument();
    expect(createdAt).toBeInTheDocument();
    expect(updatedAt).toBeInTheDocument();
    expect(learned).toBeInTheDocument();
    expect(infoButton).toBeInTheDocument();
    expect(toggleLearnedButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(moreWordDetailsLink).toBeInTheDocument();
  });

  describe("when toggling learned property", () => {
    const status = 200;

    it("calls the functions to toggle learned when user word is currently false", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockUpdateUserWord = vi
        .spyOn(userWordService, "updateUserWord")
        .mockImplementation(async () => {
          return {
            json: { userWord: props },
            status,
          };
        });
      const mockInvalidateQueries = vi
        .spyOn(queryClient, "invalidateQueries")
        .mockImplementation(vi.fn());
      const body = {
        learned: true,
      };
      const { user } = setup({
        userWord: { ...props, learned: false },
        queryClient,
      });

      const toggleLearnedButton = screen.getByRole("button", {
        name: "Toggle Learned",
      });
      await user.click(toggleLearnedButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockUpdateUserWord).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserWord).toHaveBeenCalledWith({
        userId: testUser.id,
        userWordId: String(props.id),
        body,
      });
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["userWords"],
      });
    });

    it("calls the functions to toggle learned when user word is currently true", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockUpdateUserWord = vi
        .spyOn(userWordService, "updateUserWord")
        .mockImplementation(async () => {
          return {
            json: { userWord: props },
            status,
          };
        });
      const mockInvalidateQueries = vi
        .spyOn(queryClient, "invalidateQueries")
        .mockImplementation(vi.fn());
      const body = {
        learned: false,
      };
      const { user } = setup({
        userWord: { ...props, learned: true },
        queryClient,
      });

      const toggleLearnedButton = screen.getByRole("button", {
        name: "Toggle Learned",
      });
      await user.click(toggleLearnedButton);

      const notification = screen.queryByRole("dialog");
      expect(toggleLearnedButton).not.toBeDisabled();
      expect(notification).not.toBeInTheDocument();
      expect(mockUpdateUserWord).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserWord).toHaveBeenCalledWith({
        userId: testUser.id,
        userWordId: String(props.id),
        body,
      });
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["userWords"],
      });
    });

    it("calls the functions to show a notification error", async () => {
      const message = "Bad Request.";
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockUpdateUserWord = vi
        .spyOn(userWordService, "updateUserWord")
        .mockImplementation(async () => {
          return Promise.reject({
            json: { message },
            status: 400,
          });
        });
      const mockInvalidateQueries = vi
        .spyOn(queryClient, "invalidateQueries")
        .mockImplementation(vi.fn());
      const body = {
        learned: !props.learned,
      };
      const { user } = setup({ userWord: props, queryClient });

      const toggleLearnedButton = screen.getByRole("button", {
        name: "Toggle Learned",
      });
      await user.click(toggleLearnedButton);

      const notification = screen.getByRole("dialog", { name: message });
      expect(notification).toBeInTheDocument();
      expect(toggleLearnedButton).not.toBeDisabled();
      expect(mockUpdateUserWord).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserWord).toHaveBeenCalledWith({
        userId: testUser.id,
        userWordId: String(props.id),
        body,
      });
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("disables the toggle learned button when the mutation is loading", async () => {
      const delay = 50;
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockUpdateUserWord = vi
        .spyOn(userWordService, "updateUserWord")
        .mockImplementation(async () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                json: { userWord: props },
                status,
              });
            }, delay);
          });
        });
      const mockInvalidateQueries = vi
        .spyOn(queryClient, "invalidateQueries")
        .mockImplementation(vi.fn());
      const body = {
        learned: !props.learned,
      };
      const { user } = setup({ userWord: props, queryClient });

      const toggleLearnedButton = screen.getByRole("button", {
        name: "Toggle Learned",
      });
      await user.click(toggleLearnedButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(toggleLearnedButton).toBeDisabled();
      expect(toggleLearnedButton).toHaveTextContent("Toggling Learned...");
      expect(mockUpdateUserWord).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserWord).toHaveBeenCalledWith({
        userId: testUser.id,
        userWordId: String(props.id),
        body,
      });
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });

  it("does not renders the word by default", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    setup({ userWord: props, queryClient });

    const word = screen.getByText("exemplary");
    const createdAt = screen.getByText(
      `Created At: ${props.created_at.toLocaleString()}`
    );
    const updatedAt = screen.getByText(
      `Updated At: ${props.updated_at.toLocaleString()}`
    );
    const details = screen.queryByTestId("details");
    expect(word).toBeInTheDocument();
    expect(createdAt).toBeInTheDocument();
    expect(updatedAt).toBeInTheDocument();
    expect(details).not.toBeInTheDocument();
  });

  it("it opens delete modal", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { user } = setup({ userWord: props, queryClient });

    const deleteButton = screen.getByRole("button", {
      name: "Open delete user word modal",
    });
    await user.click(deleteButton);

    const deleteModal = screen.getByTestId("modal");
    expect(deleteModal).toBeInTheDocument();
  });

  it("it opens the accordion", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { user, asFragment } = setup({ userWord: props, queryClient });

    const infoButton = screen.getByRole("button", {
      name: "More word details",
    });
    await user.click(infoButton);

    const details = screen.getByTestId("details");
    expect(details).toHaveTextContent(JSON.stringify(props.details));
    const word = screen.getByText("exemplary");
    const createdAt = screen.getByText(
      `Created At: ${props.created_at.toLocaleString()}`
    );
    const updatedAt = screen.getByText(
      `Updated At: ${props.updated_at.toLocaleString()}`
    );
    expect(word).toBeInTheDocument();
    expect(createdAt).toBeInTheDocument();
    expect(updatedAt).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("it closes the accordion", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { user } = setup({ userWord: props, queryClient });

    const infoButton = screen.getByRole("button", {
      name: "More word details",
    });
    await user.click(infoButton);
    await user.click(infoButton);

    const details = screen.queryByTestId("details");
    expect(details).not.toBeInTheDocument();
  });
});
