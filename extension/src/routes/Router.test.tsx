import { MemoryRouter, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Router } from "./Router";
import { sessionService } from "../services/session_service";

vi.mock("../components/ui/Loading/Loading");

vi.mock("../pages/Error500/Error500");

vi.mock("../components/App", function () {
  return {
    App: function () {
      return (
        <div data-testid="app">
          <Outlet />
        </div>
      );
    },
  };
});

vi.mock("../pages/Auth/Login", function () {
  return {
    Login: function () {
      return <div data-testid="login"></div>;
    },
  };
});

vi.mock("../pages/Auth/Signup", function () {
  return {
    Signup: function () {
      return <div data-testid="signup"></div>;
    },
  };
});

vi.mock("../pages/UserWords", function () {
  return {
    UserWords: function () {
      return <div data-testid="user-words"></div>;
    },
  };
});

vi.mock("../pages/UserWord", function () {
  return {
    UserWord: function () {
      return <div data-testid="user-word"></div>;
    },
  };
});

vi.mock("../pages/WordReminder", function () {
  return {
    WordReminder: function () {
      return <div data-testid="word-reminder"></div>;
    },
  };
});

vi.mock("../pages/WordReminders", function () {
  return {
    WordReminders: function () {
      return <div data-testid="word-reminders"></div>;
    },
  };
});

vi.mock("../pages/Settings", function () {
  return {
    Settings: function () {
      return <div data-testid="settings"></div>;
    },
  };
});

vi.mock("../components/modals/EmailConfirmationModal", () => {
  return {
    EmailConfirmationModal: function () {
      return <div data-testid="email-confirmation-modal"></div>;
    },
  };
});

describe("Router component", () => {
  const errorMessage = "Server Error.";

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
    confirmed: true,
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

        const userWord = await screen.findByTestId("user-word");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(userWord).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });

      it("renders user words page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/userWords" });

        const userWords = await screen.findByTestId("user-words");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(userWords).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });

      it("renders word reminders page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/wordReminders" });

        const wordReminders = await screen.findByTestId("word-reminders");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(wordReminders).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });

      it("renders settings page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/settings" });

        const settings = await screen.findByTestId("settings");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(settings).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });

      it("renders settings page with token", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/settings/token" });

        const settings = await screen.findByTestId("settings");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(settings).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });

      it("redirects to user words page when user navigates to non-protected routes", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user }, status };
          });

        setup({ initialRoute: "/login" });

        const userWords = await screen.findByTestId("user-words");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(userWords).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });

      it("shows the email confirmation modal when the user is not confirmed", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user: { ...user, confirmed: false } }, status };
          });

        setup({ initialRoute: "/userWords" });

        const emailConfirmationModal = await screen.findByTestId(
          "email-confirmation-modal"
        );
        expect(emailConfirmationModal).toBeInTheDocument();
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
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

        const login = await screen.findByTestId("login");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(login).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });

      it("renders signup page", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user: null }, status };
          });

        setup({ initialRoute: "/signup" });

        const signup = await screen.findByTestId("signup");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(signup).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });

      it("redirects to login page when user navigates to protected routes", async () => {
        const mockSessionServiceGetCurrentUser = vi
          .spyOn(sessionService, "getCurrentUser")
          .mockImplementation(async () => {
            return { json: { user: undefined }, status };
          });

        setup({ initialRoute: "/userWords" });

        const login = await screen.findByTestId("login");
        const app = screen.getByTestId("app");
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
        expect(login).toBeInTheDocument();
        expect(app).toBeInTheDocument();
      });
    });
  });

  it("renders error page", async () => {
    const mockSessionServiceGetCurrentUser = vi
      .spyOn(sessionService, "getCurrentUser")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message: errorMessage }, status: 400 });
      });

    setup({ initialRoute: "/userWords" });

    const error = await screen.findByText(errorMessage);
    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
    expect(error).toBeInTheDocument();
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

    setup({ initialRoute: "/userWords" });

    const loading = screen.getByTestId("loading");
    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockSessionServiceGetCurrentUser).toHaveBeenCalledWith();
    expect(loading).toBeInTheDocument();
  });
});
