import { createRoutesStub, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { Navigation } from "./Navigation";
import userEvent from "@testing-library/user-event";
import { sessionService } from "../../services/session_service";
import { NotificationProvider } from "../../context/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function UserWords() {
  return <div data-testid="userWords">user words</div>;
}

function WordReminders() {
  return <div data-testid="wordReminders">word reminders</div>;
}

function Settings() {
  return <div data-testid="settings">settings</div>;
}

describe("Navigation component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function setup(initialEntry: string) {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return (
            <NotificationProvider>
              <QueryClientProvider client={queryClient}>
                <Navigation />
                <Outlet />
              </QueryClientProvider>
            </NotificationProvider>
          );
        },
        children: [
          {
            path: "/userWords",
            Component: UserWords,
          },
          { path: "/wordReminders", Component: WordReminders },
          { path: "/settings", Component: Settings },
        ],
      },
    ]);

    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={[initialEntry]} />),
    };
  }

  it("renders two links to words and word reminders pages respectively", async () => {
    const { asFragment } = setup("/");

    const navigation = screen.getByRole("navigation");
    expect(navigation).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("adds the active class to the words page when on the words page", async () => {
    const { user } = setup("/wordReminders");

    const userWordsLink = screen.getByRole("link", {
      name: "User Words",
      current: false,
    });
    await user.click(userWordsLink);

    const userWords = screen.getByTestId("userWords");
    expect(userWordsLink.getAttribute("class")).toContain(
      "navigation__link--active"
    );
    expect(userWords).toBeInTheDocument();
    expect(userWordsLink).toHaveAttribute("aria-current", "page");
  });

  it("adds the active class to the word reminders page when on the word reminders page", async () => {
    const { user } = setup("/userWords");

    const wordRemindersLink = screen.getByRole("link", {
      name: "Word Reminders",
      current: false,
    });
    await user.click(wordRemindersLink);

    const wordReminders = screen.getByTestId("wordReminders");
    expect(wordRemindersLink.getAttribute("class")).toContain(
      "navigation__link--active"
    );
    expect(wordReminders).toBeInTheDocument();
    expect(wordRemindersLink).toHaveAttribute("aria-current", "page");
  });

  it("adds the active class to the settings page when on the settings page", async () => {
    const { user } = setup("/userWords");

    const settingsLink = screen.getByRole("link", {
      name: "Settings",
      current: false,
    });
    await user.click(settingsLink);

    const settings = screen.getByTestId("settings");
    expect(settingsLink.getAttribute("class")).toContain(
      "navigation__link--active"
    );
    expect(settings).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute("aria-current", "page");
  });

  it("logs out the user when the 'Log Out' button is clicked", async () => {
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const mockLogout = vi
      .spyOn(sessionService, "logoutUser")
      .mockImplementation(async () => {
        return { json: { user: { id: "1" } }, status: 200 };
      });
    const { user } = setup("/");

    const logoutButton = screen.getByRole("button", { name: "Log Out" });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledWith(undefined);
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["sessions"],
      exact: true,
    });
  });

  it("opens a new tab with the extension", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { search: "?popup=true" },
    });
    const path = "index.html?popup=false";
    const url = `chrome-extension://okplhmjkgoekmcnjbjjglmnpanfkgdfa/${path}`;
    const mockGetURL = vi.spyOn(chrome.runtime, "getURL").mockReturnValue(url);
    const mockCreate = vi.spyOn(chrome.tabs, "create");
    const { user } = setup("/");

    const openNewTabButton = screen.getByRole("button", {
      name: "Open in New Tab",
    });
    await user.click(openNewTabButton);

    expect(mockGetURL).toHaveBeenCalledTimes(1);
    expect(mockGetURL).toHaveBeenCalledWith(path);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({ url });
  });

  it("does not show the button to open the extension in a new tab when the extension is in a tab", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { search: "?popup=false" },
    });
    setup("/");

    const openNewTabButton = await screen.queryByRole("button", {
      name: "Open in New Tab",
    });

    expect(openNewTabButton).not.toBeInTheDocument();
  });

  it("disables 'Log Out' button when mutation is pending", async () => {
    const delay = 50;
    const mockLogout = vi
      .spyOn(sessionService, "logoutUser")
      .mockImplementation(async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { user: { id: "1" } }, status: 200 });
          }, delay);
        });
      });
    const { user } = setup("/");

    const logoutButton = screen.getByRole("button", { name: "Log Out" });
    await user.click(logoutButton);

    expect(logoutButton).toBeDisabled();
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledWith(undefined);
  });

  it("shows a notification error when attempting to log out", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockLogout = vi
      .spyOn(sessionService, "logoutUser")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const { user } = setup("/");

    const logoutButton = screen.getByRole("button", { name: "Log Out" });
    await user.click(logoutButton);

    const notification = await screen.findByRole("dialog", { name: message });
    expect(notification).toBeInTheDocument();
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledWith(undefined);
  });
});
