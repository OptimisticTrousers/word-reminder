import { MemoryRouter, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Router } from "./Router";
import { sessionService } from "../services/session_service";

vi.mock("../components/ui/Loading", function () {
  return {
    Loading: function () {
      return <p>Loading...</p>;
    },
  };
});

vi.mock("../pages/Error500", function () {
  return {
    Error500: function ({ message }: { message: string }) {
      return <p>{message}</p>;
    },
  };
});

vi.mock("../components/App", function () {
  return {
    App: function () {
      return (
        <main>
          <Outlet />
        </main>
      );
    },
  };
});

vi.mock("../pages/Login", function () {
  return {
    Login: function () {
      return (
        <form>
          <button type="submit">Login</button>
        </form>
      );
    },
  };
});

vi.mock("../pages/Signup", function () {
  return {
    Signup: function () {
      return (
        <form>
          <button type="submit">Signup</button>
        </form>
      );
    },
  };
});

vi.mock("../pages/UserWords", function () {
  return {
    UserWords: function () {
      return (
        <>
          <h2>UserWords</h2>
          <ul></ul>
        </>
      );
    },
  };
});

vi.mock("../pages/UserWord", function () {
  return {
    UserWord: function () {
      return (
        <div>
          <h2>UserWord</h2>
        </div>
      );
    },
  };
});

vi.mock("../pages/WordReminders", function () {
  return {
    WordReminders: function () {
      return (
        <>
          <h2>WordReminders</h2>
          <ul></ul>
        </>
      );
    },
  };
});

vi.mock("../pages/Settings", function () {
  return {
    Settings: function () {
      return (
        <form>
          <button type="submit">Update</button>
        </form>
      );
    },
  };
});

describe("Router component", () => {
  const errorMessage = "Server Error.";
  const loadingMessage = "Loading...";

  function setup({ initialRoute }: { initialRoute: string }) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return {
      ...render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Router />
          </MemoryRouter>
        </QueryClientProvider>
      ),
    };
  }

  const user = {
    id: "1",
  };
  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("returns routing", () => {
    describe("when the user is logged in", () => {
      it("renders user word page", async () => {
        const userWordId = 1;
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: `/userWords/${userWordId}` });
        const userWordHeader = await screen.findByRole("heading", {
          name: "UserWord",
        });
        const appMain = screen.getByRole("main");
        const error = screen.queryByText(errorMessage);
        const userWordsHeader = screen.queryByRole("heading", {
          name: "UserWords",
        });
        const loading = screen.queryByText(loadingMessage);
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "WordReminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(userWordHeader).toBeInTheDocument();
        expect(appMain).toBeInTheDocument();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(userWordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
      });

      it("renders user words page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/userWords" });
        const userWordsHeader = await screen.findByRole("heading", {
          name: "UserWords",
        });
        const appMain = screen.getByRole("main");
        const error = screen.queryByText(errorMessage);
        const loading = screen.queryByText(loadingMessage);
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "WordReminders",
        });
        const userWordHeader = screen.queryByRole("heading", {
          name: "UserWord",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(userWordsHeader).toBeInTheDocument();
        expect(appMain).toBeInTheDocument();
        expect(userWordHeader).not.toBeInTheDocument();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
      });

      it("renders word reminders page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/wordReminders" });
        const wordRemindersHeader = await screen.findByRole("heading", {
          name: "WordReminders",
        });
        const appMain = screen.getByRole("main");
        const error = screen.queryByText(errorMessage);
        const loading = screen.queryByText(loadingMessage);
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const userWordsHeader = screen.queryByRole("heading", {
          name: "UserWords",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(wordRemindersHeader).toBeInTheDocument();
        expect(appMain).toBeInTheDocument();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(userWordsHeader).not.toBeInTheDocument();
      });

      it("renders settings page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/settings" });
        const settingsButton = await screen.findByRole("button", {
          name: "Update",
        });
        const appMain = screen.getByRole("main");
        const error = screen.queryByText(errorMessage);
        const loading = screen.queryByText(loadingMessage);
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const userWordsHeader = screen.queryByRole("heading", {
          name: "UserWords",
        });
        const userWordHeader = screen.queryByRole("heading", {
          name: "UserWord",
        });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "WordReminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(settingsButton).toBeInTheDocument();
        expect(appMain).toBeInTheDocument();
        expect(userWordHeader).not.toBeInTheDocument();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(userWordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
      });

      it("redirects to user words page when user navigates to non-protected routes", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/login" });
        const userWordsHeader = await screen.findByRole("heading", {
          name: "UserWords",
        });
        const appMain = screen.getByRole("main");
        const error = screen.queryByText(errorMessage);
        const loading = screen.queryByText(loadingMessage);
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "WordReminders",
        });
        const userWordHeader = screen.queryByRole("heading", {
          name: "UserWord",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(userWordsHeader).toBeInTheDocument();
        expect(appMain).toBeInTheDocument();
        expect(error).not.toBeInTheDocument();
        expect(userWordHeader).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
      });
    });

    describe("when the user is not logged in", () => {
      it("renders login page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user: null }, status };
          });

        setup({ initialRoute: "/login" });
        const loginButton = await screen.findByRole("button", {
          name: "Login",
        });
        const appMain = screen.getByRole("main");
        const error = screen.queryByText(errorMessage);
        const loading = screen.queryByText(loadingMessage);
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const userWordsHeader = screen.queryByRole("heading", {
          name: "UserWords",
        });
        const userWordHeader = screen.queryByRole("heading", {
          name: "UserWord",
        });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "WordReminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(loginButton).toBeInTheDocument();
        expect(appMain).toBeInTheDocument();
        expect(error).not.toBeInTheDocument();
        expect(userWordHeader).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(userWordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
      });

      it("renders signup page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user: null }, status };
          });

        setup({ initialRoute: "/signup" });
        const signupButton = await screen.findByRole("button", {
          name: "Signup",
        });
        const appMain = screen.getByRole("main");
        const error = screen.queryByText(errorMessage);
        const loading = screen.queryByText(loadingMessage);
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const userWordsHeader = screen.queryByRole("heading", {
          name: "UserWords",
        });
        const userWordHeader = screen.queryByRole("heading", {
          name: "UserWord",
        });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "WordReminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(signupButton).toBeInTheDocument();
        expect(appMain).toBeInTheDocument();
        expect(userWordHeader).not.toBeInTheDocument();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(userWordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
      });

      it("redirects to login page when user navigates to protected routes", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user: null }, status };
          });

        setup({ initialRoute: "/userWords" });
        const loginButton = await screen.findByRole("button", {
          name: "Login",
        });
        const appMain = screen.getByRole("main");
        const error = screen.queryByText(errorMessage);
        const loading = screen.queryByText(loadingMessage);
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const userWordsHeader = screen.queryByRole("heading", {
          name: "UserWords",
        });
        const userWordHeader = screen.queryByRole("heading", {
          name: "UserWord",
        });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "WordReminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(loginButton).toBeInTheDocument();
        expect(appMain).toBeInTheDocument();
        expect(userWordHeader).not.toBeInTheDocument();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(userWordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
      });
    });
  });

  it("renders error page", async () => {
    const mockSessionServiceGetCurrentUser = vi
      .spyOn(sessionService, "getCurrentUser")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message: errorMessage }, status: 400 });
      });

    setup({ initialRoute: "/" });
    const error = await screen.findByText(errorMessage);
    const appMain = screen.queryByRole("main");
    const loading = screen.queryByText(loadingMessage);
    const loginButton = screen.queryByRole("button", { name: "Login" });
    const settingsButton = screen.queryByRole("button", { name: "Update" });
    const signupButton = screen.queryByRole("button", { name: "Signup" });
    const userWordsHeader = screen.queryByRole("heading", {
      name: "UserWords",
    });
    const userWordHeader = screen.queryByRole("heading", { name: "UserWord" });
    const wordRemindersHeader = screen.queryByRole("heading", {
      name: "WordReminders",
    });

    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
    expect(error).toBeInTheDocument();
    expect(appMain).not.toBeInTheDocument();
    expect(userWordHeader).not.toBeInTheDocument();
    expect(loading).not.toBeInTheDocument();
    expect(loginButton).not.toBeInTheDocument();
    expect(settingsButton).not.toBeInTheDocument();
    expect(signupButton).not.toBeInTheDocument();
    expect(userWordsHeader).not.toBeInTheDocument();
    expect(wordRemindersHeader).not.toBeInTheDocument();
  });

  it("renders loading page", async () => {
    const delay = 500;
    const mockSessionServiceGetCurrentUser = vi
      .spyOn(sessionService, "getCurrentUser")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { user }, status });
          }, delay);
        });
      });

    setup({ initialRoute: "/" });
    const loading = screen.getByText(loadingMessage);
    const appMain = screen.queryByRole("main");
    const error = screen.queryByText(errorMessage);
    const loginButton = screen.queryByRole("button", { name: "Login" });
    const settingsButton = screen.queryByRole("button", { name: "Update" });
    const signupButton = screen.queryByRole("button", { name: "Signup" });
    const userWordsHeader = screen.queryByRole("heading", {
      name: "UserWords",
    });
    const wordRemindersHeader = screen.queryByRole("heading", {
      name: "WordReminders",
    });
    const userWordHeader = screen.queryByRole("heading", { name: "UserWord" });

    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
    expect(loading).toBeInTheDocument();
    expect(appMain).not.toBeInTheDocument();
    expect(error).not.toBeInTheDocument();
    expect(userWordHeader).not.toBeInTheDocument();
    expect(loginButton).not.toBeInTheDocument();
    expect(settingsButton).not.toBeInTheDocument();
    expect(signupButton).not.toBeInTheDocument();
    expect(userWordsHeader).not.toBeInTheDocument();
    expect(wordRemindersHeader).not.toBeInTheDocument();
  });
});
