import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoCreateWordReminder } from "./AutoCreateWordReminder";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { autoWordReminderService } from "../../../services/auto_word_reminder_service/auto_word_reminder_service";
import { SortMode } from "common";
import { msToUnits } from "../../../utils/date/date";
import { Theme, ThemeContext } from "../../../context/Theme/Context";

vi.mock("../../modals/CreateAutoWordReminderModal", () => {
  return {
    CreateAutoWordReminderModal: function ({
      toggleModal,
    }: {
      toggleModal: () => void;
    }) {
      return (
        <div data-testid="create-auto-word-reminder-modal">
          <button onClick={toggleModal}>Close</button>
        </div>
      );
    },
  };
});

vi.mock("../../modals/UpdateAutoWordReminderModal", () => {
  return {
    UpdateAutoWordReminderModal: function ({
      toggleModal,
    }: {
      toggleModal: () => void;
    }) {
      return (
        <div data-testid="update-auto-word-reminder-modal">
          <button onClick={toggleModal}>Close</button>
        </div>
      );
    },
  };
});

vi.mock("../../modals/DeleteAutoWordReminderModal", () => {
  return {
    DeleteAutoWordReminderModal: function ({
      toggleModal,
    }: {
      toggleModal: () => void;
    }) {
      return (
        <div data-testid="delete-auto-word-reminder-modal">
          <button onClick={toggleModal}>Close</button>
        </div>
      );
    },
  };
});

vi.mock("../../ui/Loading/Loading");

vi.mock("../../ui/ErrorMessage/ErrorMessage");

const testUser = {
  id: 1,
};

const autoWordReminder = {
  id: 1,
  user_id: testUser.id,
  is_active: true,
  has_reminder_onload: true,
  has_learned_words: true,
  sort_mode: SortMode.Newest,
  word_count: 7,
  reminder: "*/5 * * * * ",
  duration: 3600000,
  created_at: new Date("December 17, 1995 03:24:00"),
  updated_at: new Date("December 17, 1995 03:24:00"),
};

const status = 200;

describe("AutoCreateWordReminder component", () => {
  function setup(theme: Theme) {
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
            path: "/wordReminders",
            Component: function () {
              return (
                <ThemeContext.Provider value={{ theme, toggleTheme: vi.fn() }}>
                  <QueryClientProvider client={queryClient}>
                    <AutoCreateWordReminder />
                  </QueryClientProvider>
                </ThemeContext.Provider>
              );
            },
          },
        ],
      },
    ]);
    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={["/wordReminders"]} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when the auto word reminder does not exist", () => {
    it("renders the button to create the 'AutoCreateWordReminder'", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return { json: { autoWordReminder: undefined }, status };
        });

      const { asFragment } = setup(Theme.Dark);

      const createButton = await screen.findByRole("button", {
        name: "Create Auto Word Reminder",
      });
      expect(createButton).toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
      expect(asFragment()).toMatchSnapshot();
    });

    it("has light class", async () => {
      setup(Theme.Light);

      const button = await screen.findByRole("button", {
        name: "Create Auto Word Reminder",
      });
      expect(button.getAttribute("class")).toContain(`create--${Theme.Light}`);
    });

    it("has dark class", async () => {
      setup(Theme.Dark);

      const button = await screen.findByRole("button", {
        name: "Create Auto Word Reminder",
      });
      expect(button.getAttribute("class")).toContain(`create--${Theme.Dark}`);
    });

    it("opens the 'CreateAutoWordReminderModal' when the user clicks the button to create an auto word reminder", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return { json: { autoWordReminder: undefined }, status };
        });
      const { user } = setup(Theme.Dark);

      const createAutoWordReminderButton = await screen.findByRole("button", {
        name: "Create Auto Word Reminder",
      });
      await user.click(createAutoWordReminderButton);

      const createModal = screen.getByTestId("create-auto-word-reminder-modal");
      expect(createModal).toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });

    it("closes modal when the user clicks the button to create an auto word reminder and modal close button is clicked", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return { json: { autoWordReminder: undefined }, status };
        });
      const { user } = setup(Theme.Dark);

      const createAutoWordReminderButton = await screen.findByRole("button", {
        name: "Create Auto Word Reminder",
      });
      await user.click(createAutoWordReminderButton);
      const closeModalButton = screen.getByRole("button", { name: "Close" });
      await user.click(closeModalButton);

      const createModal = screen.queryByTestId(
        "create-auto-word-reminder-modal"
      );
      expect(createModal).not.toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });
  });

  describe("when the auto word reminder does exist", () => {
    it("renders the auto word reminder", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return { json: { autoWordReminder }, status };
        });

      const { asFragment } = setup(Theme.Dark);

      const units = msToUnits(autoWordReminder.duration);
      const id = await screen.findByText(`ID: ${autoWordReminder.id}`);
      const reminder = screen.getByText("Reminder: Every 5 minutes (UTC)");
      const duration = screen.getByText(
        `Weeks: ${units.weeks}, Days: ${units.days}, Hours: ${units.hours}, Minutes: ${units.minutes}`
      );
      const active = screen.getByText(
        "Active (whether the word reminder will actively remind you of the words in it): Yes"
      );
      const hasReminderOnload = screen.getByText(
        "Has Reminder Onload (reminds you of these words when you open your browser): Yes"
      );
      const hasLearned = screen.getByText(
        "Has Learned (whether to include words that you have already learned): Yes"
      );
      const sortMode = screen.getByText(
        `Sort Mode (determines sort mode): ${autoWordReminder.sort_mode}`
      );
      const wordCount = screen.getByText(
        `Word Count (how many words to include): ${autoWordReminder.word_count}`
      );
      const updatedAt = screen.getByText(
        `This auto word reminder was updated on ${autoWordReminder.updated_at.toLocaleString()}`
      );
      const createdAt = screen.getByText(
        `This auto word reminder was created on ${autoWordReminder.created_at.toLocaleString()}`
      );
      const updateButton = screen.getByRole("button", { name: "Update" });
      const deleteButton = screen.getByRole("button", { name: "Delete" });
      expect(id).toBeInTheDocument();
      expect(reminder).toBeInTheDocument();
      expect(duration).toBeInTheDocument();
      expect(active).toBeInTheDocument();
      expect(hasReminderOnload).toBeInTheDocument();
      expect(hasLearned).toBeInTheDocument();
      expect(sortMode).toBeInTheDocument();
      expect(wordCount).toBeInTheDocument();
      expect(updatedAt).toBeInTheDocument();
      expect(createdAt).toBeInTheDocument();
      expect(updateButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders that the word reminder will be inactive", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return {
            json: {
              autoWordReminder: { ...autoWordReminder, is_active: false },
            },
            status,
          };
        });

      setup(Theme.Dark);

      const active = await screen.findByText(
        "Active (whether the word reminder will actively remind you of the words in it): No"
      );
      expect(active).toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });

    it("renders that the word reminder will be not remind on load", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return {
            json: {
              autoWordReminder: {
                ...autoWordReminder,
                has_reminder_onload: false,
              },
            },
            status,
          };
        });

      setup(Theme.Dark);

      const hasReminderOnload = await screen.findByText(
        "Has Reminder Onload (reminds you of these words when you open your browser): No"
      );
      expect(hasReminderOnload).toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });

    it("renders that the word reminder will be not include learned words", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return {
            json: {
              autoWordReminder: {
                ...autoWordReminder,
                has_learned_words: false,
              },
            },
            status,
          };
        });

      setup(Theme.Dark);

      const hasLearned = await screen.findByText(
        "Has Learned (whether to include words that you have already learned): No"
      );
      expect(hasLearned).toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });

    it("opens the 'UpdateAutoWordReminderModal' when the update auto word reminder button is clicked", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return {
            json: {
              autoWordReminder,
            },
            status,
          };
        });
      const { user } = setup(Theme.Dark);

      const updateButton = await screen.findByRole("button", {
        name: "Update",
      });
      await user.click(updateButton);

      const updateModal = screen.getByTestId("update-auto-word-reminder-modal");
      expect(updateModal).toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });

    it("closes the 'UpdateAutoWordReminder' when the update auto word reminder is clicked and modal close button is clicked", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return {
            json: {
              autoWordReminder,
            },
            status,
          };
        });
      const { user } = setup(Theme.Dark);

      const updateButton = await screen.findByRole("button", {
        name: "Update",
      });
      await user.click(updateButton);
      const closeModalButton = screen.getByRole("button", { name: "Close" });
      await user.click(closeModalButton);

      const updateModal = screen.queryByTestId(
        "update-auto-word-reminder-modal"
      );
      expect(updateModal).not.toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });

    it("opens the 'DeleteAutoWordReminderModal' when the delete button is clicked", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return {
            json: {
              autoWordReminder,
            },
            status,
          };
        });
      const { user } = setup(Theme.Dark);

      const deleteButton = await screen.findByRole("button", {
        name: "Delete",
      });
      await user.click(deleteButton);

      const deleteModal = screen.getByTestId("delete-auto-word-reminder-modal");
      expect(deleteModal).toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });

    it("closes the 'DeleteAutoWordReminder' when the delete auto word reminder is clicked and modal close button is clicked", async () => {
      const mockGetAutoWordReminder = vi
        .spyOn(autoWordReminderService, "getAutoWordReminder")
        .mockImplementation(async () => {
          return {
            json: {
              autoWordReminder,
            },
            status,
          };
        });
      const { user } = setup(Theme.Dark);

      const deleteButton = await screen.findByRole("button", {
        name: "Delete",
      });
      await user.click(deleteButton);
      const closeModalButton = screen.getByRole("button", { name: "Close" });
      await user.click(closeModalButton);

      const deleteModal = screen.queryByTestId(
        "delete-auto-word-reminder-modal"
      );
      expect(deleteModal).not.toBeInTheDocument();
      expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
      expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
        userId: String(testUser.id),
      });
    });
  });

  it("renders error message component when the fetch promise rejects", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockGetAutoWordReminder = vi
      .spyOn(autoWordReminderService, "getAutoWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });

    setup(Theme.Dark);

    const errorMessage = await screen.findByTestId("error-message");
    expect(errorMessage).toBeInTheDocument();
    expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
    expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
      userId: String(testUser.id),
    });
  });

  it("renders loading component when loading", async () => {
    const delay = 50;
    const mockGetAutoWordReminder = vi
      .spyOn(autoWordReminderService, "getAutoWordReminder")
      .mockImplementation(async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { autoWordReminder }, status });
          }, delay);
        });
      });

    setup(Theme.Dark);

    const loading = await screen.findByTestId("loading");
    expect(loading).toBeInTheDocument();
    expect(mockGetAutoWordReminder).toHaveBeenCalledTimes(1);
    expect(mockGetAutoWordReminder).toHaveBeenCalledWith({
      userId: String(testUser.id),
    });
  });
});
