import { MemoryRouter, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Router } from "./Router";
import { sessionService } from "../services/session_service";

vi.mock("../components/ui", function () {
  return {
    Loading: function () {
      return (
        <p id="loading" aria-labelledby="loading">
          Loading...
        </p>
      );
    },
  };
});

vi.mock("../pages/Error500", function () {
  return {
    Error500: function ({ message }: { message: string }) {
      return (
        <p id="message" aria-labelledby="message">
          {message}
        </p>
      );
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

vi.mock("../pages/Words", function () {
  return {
    Words: function () {
      return (
        <>
          <h2>Words</h2>
          <ul></ul>
        </>
      );
    },
  };
});

vi.mock("../pages/WordReminders", function () {
  return {
    WordReminders: function () {
      return (
        <>
          <h2>Word Reminders</h2>
          <ul></ul>
        </>
      );
    },
  };
});

vi.mock("../pages/settings", function () {
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const errorMessage = "Server Error.";
  const loadingMessage = "Loading...";

  function setup({ initialRoute }: { initialRoute: string }) {
    const queryClient = new QueryClient();

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

  describe("returns routing", () => {
    it("renders App", () => {
      const mockSessionServiceGetCurrentUser = vi
        .spyOn(sessionService, "getCurrentUser")
        .mockImplementation(async () => {
          return { json: { user }, status };
        });

      const { asFragment } = setup({ initialRoute: "/" });
      const error = screen.queryByRole("paragraph", { name: errorMessage });
      const loading = screen.queryByRole("paragraph", { name: loadingMessage });
      const loginButton = screen.queryByRole("button", { name: "Login" });
      const main = screen.getByRole("main");
      const settingsButton = screen.queryByRole("button", { name: "Update" });
      const signupButton = screen.queryByRole("button", { name: "Signup" });
      const wordsHeader = screen.queryByRole("heading", { name: "Words" });
      const wordRemindersHeader = screen.queryByRole("heading", {
        name: "Word Reminders",
      });

      expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
      expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
      expect(error).not.toBeInTheDocument();
      expect(loading).not.toBeInTheDocument();
      expect(loginButton).not.toBeInTheDocument();
      expect(main).toBeInTheDocument();
      expect(settingsButton).not.toBeInTheDocument();
      expect(signupButton).not.toBeInTheDocument();
      expect(wordsHeader).not.toBeInTheDocument();
      expect(wordRemindersHeader).not.toBeInTheDocument();
      expect(asFragment).toMatchSnapshot();
    });

    describe("when the user is logged in", () => {
      it("renders words page", () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        const { asFragment } = setup({ initialRoute: "/login" });
        const error = screen.queryByRole("paragraph", { name: errorMessage });
        const loading = screen.queryByRole("paragraph", {
          name: loadingMessage,
        });
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const main = screen.queryByRole("main");
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordsHeader = screen.getByRole("heading", { name: "Words" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "Word Reminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(main).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(wordsHeader).toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();
      });

      it("renders word reminders page", () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        const { asFragment } = setup({ initialRoute: "/login" });
        const error = screen.queryByRole("paragraph", { name: errorMessage });
        const loading = screen.queryByRole("paragraph", {
          name: loadingMessage,
        });
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const main = screen.queryByRole("main");
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordsHeader = screen.queryByRole("heading", { name: "Words" });
        const wordRemindersHeader = screen.getByRole("heading", {
          name: "Word Reminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(main).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(wordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();
      });

      it("renders settings page", () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        const { asFragment } = setup({ initialRoute: "/login" });
        const error = screen.queryByRole("paragraph", { name: errorMessage });
        const loading = screen.queryByRole("paragraph", {
          name: loadingMessage,
        });
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const main = screen.queryByRole("main");
        const settingsButton = screen.getByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordsHeader = screen.queryByRole("heading", { name: "Words" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "Word Reminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(main).not.toBeInTheDocument();
        expect(settingsButton).toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(wordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();
      });

      it("redirects to words page when user navigates to non-protected routes", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        const { asFragment } = setup({ initialRoute: "/login" });
        const error = screen.queryByRole("paragraph", { name: errorMessage });
        const loading = screen.queryByRole("paragraph", {
          name: loadingMessage,
        });
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const main = screen.queryByRole("main");
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordsHeader = screen.getByRole("heading", { name: "Words" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "Word Reminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(main).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(wordsHeader).toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();
      });
    });

    describe("when the user is not logged in", () => {
      it("renders login page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        const { asFragment } = setup({ initialRoute: "/login" });
        const error = screen.queryByRole("paragraph", { name: errorMessage });
        const loading = screen.queryByRole("paragraph", {
          name: loadingMessage,
        });
        const loginButton = screen.getByRole("button", { name: "Login" });
        const main = screen.queryByRole("main");
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordsHeader = screen.queryByRole("heading", { name: "Words" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "Word Reminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();
        expect(main).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(wordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();
      });

      it("renders signup page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        const { asFragment } = setup({ initialRoute: "/login" });
        const error = screen.queryByRole("paragraph", { name: errorMessage });
        const loading = screen.queryByRole("paragraph", {
          name: loadingMessage,
        });
        const loginButton = screen.queryByRole("button", { name: "Login" });
        const main = screen.queryByRole("main");
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.getByRole("button", { name: "Signup" });
        const wordsHeader = screen.queryByRole("heading", { name: "Words" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "Word Reminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).not.toBeInTheDocument();
        expect(main).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).toBeInTheDocument();
        expect(wordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();
      });

      it("redirects to login page when user navigates to protected routes", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        const { asFragment } = setup({ initialRoute: "/app" });
        const error = screen.queryByRole("paragraph", { name: errorMessage });
        const loading = screen.queryByRole("paragraph", {
          name: loadingMessage,
        });
        const loginButton = screen.getByRole("button", { name: "Login" });
        const main = screen.queryByRole("main");
        const settingsButton = screen.queryByRole("button", { name: "Update" });
        const signupButton = screen.queryByRole("button", { name: "Signup" });
        const wordsHeader = screen.queryByRole("heading", { name: "Words" });
        const wordRemindersHeader = screen.queryByRole("heading", {
          name: "Word Reminders",
        });

        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(error).not.toBeInTheDocument();
        expect(loading).not.toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();
        expect(main).not.toBeInTheDocument();
        expect(settingsButton).not.toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
        expect(wordsHeader).not.toBeInTheDocument();
        expect(wordRemindersHeader).not.toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();
      });
    });
  });

  it("renders error page", async () => {
    const mockSessionServiceGetCurrentUser = vi
      .spyOn(sessionService, "getCurrentUser")
      .mockImplementation(async () => {
        return { json: { message: errorMessage }, status: 400 };
      });

    const { asFragment } = setup({ initialRoute: "/" });
    const error = screen.getByRole("paragraph", { name: errorMessage });
    const loading = screen.queryByRole("paragraph", { name: loadingMessage });
    const loginButton = screen.queryByRole("button", { name: "Login" });
    const main = screen.queryByRole("main");
    const settingsButton = screen.queryByRole("button", { name: "Update" });
    const signupButton = screen.queryByRole("button", { name: "Signup" });
    const wordsHeader = screen.queryByRole("heading", { name: "Words" });
    const wordRemindersHeader = screen.queryByRole("heading", {
      name: "Word Reminders",
    });

    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
    expect(error).toBeInTheDocument();
    expect(loading).not.toBeInTheDocument();
    expect(loginButton).not.toBeInTheDocument();
    expect(main).not.toBeInTheDocument();
    expect(settingsButton).not.toBeInTheDocument();
    expect(signupButton).not.toBeInTheDocument();
    expect(wordsHeader).not.toBeInTheDocument();
    expect(wordRemindersHeader).not.toBeInTheDocument();
    expect(asFragment).toMatchSnapshot();
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

    const { asFragment } = setup({ initialRoute: "/" });
    const error = screen.queryByRole("paragraph", { name: errorMessage });
    const loading = screen.getByRole("paragraph", { name: loadingMessage });
    const loginButton = screen.queryByRole("button", { name: "Login" });
    const main = screen.queryByRole("main");
    const settingsButton = screen.queryByRole("button", { name: "Update" });
    const signupButton = screen.queryByRole("button", { name: "Signup" });
    const wordsHeader = screen.queryByRole("heading", { name: "Words" });
    const wordRemindersHeader = screen.queryByRole("heading", {
      name: "Word Reminders",
    });

    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
    expect(error).not.toBeInTheDocument();
    expect(loading).toBeInTheDocument();
    expect(loginButton).not.toBeInTheDocument();
    expect(main).not.toBeInTheDocument();
    expect(settingsButton).not.toBeInTheDocument();
    expect(signupButton).not.toBeInTheDocument();
    expect(wordsHeader).not.toBeInTheDocument();
    expect(wordRemindersHeader).not.toBeInTheDocument();
    expect(asFragment).toMatchSnapshot();
  });
});
