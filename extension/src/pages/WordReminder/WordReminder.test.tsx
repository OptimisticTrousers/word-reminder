import { createRoutesStub, Outlet } from "react-router-dom";
import { WordReminder } from "./WordReminder";
import { render, screen } from "@testing-library/react";
import { wordReminderService } from "../../services/word_reminder_service";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../Error500/Error500");
vi.mock("../../components/ui/Loading/Loading");
vi.mock("../../components/word_reminders/WordReminder/WordReminder");

describe("WordReminder component", () => {
  const testUser = {
    id: "1",
  };

  const testWordReminder = { id: "1" };

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
            path: "/:wordReminderId",
            Component: function () {
              return (
                <QueryClientProvider client={queryClient}>
                  <WordReminder />
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);
    return {
      ...render(<Stub initialEntries={[`/${testWordReminder.id}`]} />),
    };
  }

  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders parent div", () => {
    const mockGetWordReminder = vi
      .spyOn(wordReminderService, "getWordReminder")
      .mockImplementation(async () => {
        return { json: { wordReminder: testWordReminder }, status };
      });

    const { asFragment } = setup();

    expect(asFragment()).toMatchSnapshot();
    expect(mockGetWordReminder).toHaveBeenCalledTimes(1);
    expect(mockGetWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: testWordReminder.id,
    });
  });

  it("renders error message when there is an error", async () => {
    const mockGetWordReminder = vi
      .spyOn(wordReminderService, "getWordReminder")
      .mockImplementation(async () => {
        return Promise.reject({ json: { wordReminder }, status });
      });

    setup();

    const error = await screen.findByTestId("error-500");
    const loading = screen.queryByTestId("loading");
    const wordReminder = screen.queryByTestId("word-reminder");
    expect(error).toBeInTheDocument();
    expect(loading).not.toBeInTheDocument();
    expect(wordReminder).not.toBeInTheDocument();
    expect(mockGetWordReminder).toHaveBeenCalledTimes(1);
    expect(mockGetWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: testWordReminder.id,
    });
  });

  it("renders loading component when query is loading", async () => {
    const mockGetWordReminder = vi
      .spyOn(wordReminderService, "getWordReminder")
      .mockImplementation(async () => {
        return { json: { wordReminder: testWordReminder }, status };
      });

    setup();

    const error = screen.queryByTestId("error-500");
    const loading = screen.getByTestId("loading");
    const wordReminder = screen.queryByTestId("word-reminder");
    expect(error).not.toBeInTheDocument();
    expect(loading).toBeInTheDocument();
    expect(wordReminder).not.toBeInTheDocument();
    expect(mockGetWordReminder).toHaveBeenCalledTimes(1);
    expect(mockGetWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: testWordReminder.id,
    });
  });

  it("renders data when fetch was successful", async () => {
    const mockGetWordReminder = vi
      .spyOn(wordReminderService, "getWordReminder")
      .mockImplementation(async () => {
        return { json: { wordReminder: testWordReminder }, status };
      });

    setup();

    const error = screen.queryByTestId("error-500");
    const loading = screen.queryByTestId("loading");
    const wordReminder = await screen.findByTestId("word-reminder");
    expect(error).not.toBeInTheDocument();
    expect(loading).not.toBeInTheDocument();
    expect(wordReminder).toBeInTheDocument();
    expect(mockGetWordReminder).toHaveBeenCalledTimes(1);
    expect(mockGetWordReminder).toHaveBeenCalledWith({
      userId: testUser.id,
      wordReminderId: testWordReminder.id,
    });
  });
});
