import { EMAIL_MAX, PASSWORD_MAX } from "common";
import { createRoutesStub } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotificationProvider } from "../../../context/Notification";
import { Login } from "./Login";
import { sessionService } from "../../../services/session_service";

describe("Login component", () => {
  const Stub = createRoutesStub([
    {
      path: "/login",
      Component: Login,
    },
    {
      path: "/words",
      Component: function () {
        return <button>Current URL: /words</button>;
      },
    },
  ]);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const testUser = {
    email: "bob@gmail.com",
    password: "password",
  };
  const status = 200;

  function setup() {
    return {
      user: userEvent.setup(),
      ...render(
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <Stub initialEntries={["/login"]} />
          </QueryClientProvider>
        </NotificationProvider>
      ),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the functions to login, show notification, and redirect user", async () => {
    const mockSessionServiceLogin = vi
      .spyOn(sessionService, "loginUser")
      .mockImplementation(async () => {
        return { json: { user: testUser }, status };
      });
    const { asFragment, user } = setup();
    const email = testUser.email;
    const password = testUser.password;
    const passwordInput = screen.getByLabelText("Password (required)", {
      selector: "input",
    });
    const emailInput = screen.getByLabelText("Email (required)", {
      selector: "input",
    });
    await user.type(emailInput, email);
    await user.type(passwordInput, password);

    const loginButton = screen.getByRole("button", { name: "Login" });
    await user.click(loginButton);

    const words = screen.getByRole("button", { name: "Current URL: /words" });
    const notification = screen.getByRole("dialog", {
      name: `You have successfully logged in, ${email}.`,
    });
    expect(mockSessionServiceLogin).toHaveBeenCalledTimes(1);
    expect(mockSessionServiceLogin).toHaveBeenCalledWith(testUser);
    expect(words).toBeInTheDocument();
    expect(notification).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows correct link to creating an account", async () => {
    setup();
    const link = screen.getByRole("link", { name: "Create account" });

    expect(link).toHaveAttribute("href", "/register");
  });

  describe("form validation", () => {
    it("allows user to type on the email field", async () => {
      const { user } = setup();
      const email = testUser.email;
      const emailInput = screen.getByLabelText("Email (required)", {
        selector: "input",
      });

      await user.type(emailInput, email);

      expect(emailInput).toHaveValue(email);
    });

    it("allows user to type on the password field", async () => {
      const { user } = setup();
      const password = testUser.password;
      const passwordInput = screen.getByLabelText("Password (required)", {
        selector: "input",
      });

      await user.type(passwordInput, password);

      expect(passwordInput).toHaveValue(password);
    });

    it(`does not allow user to type more than ${EMAIL_MAX} characters in email field`, async () => {
      const { user } = setup();
      const email = new Array(EMAIL_MAX + 1).fill("a").join("");
      const emailInput = screen.getByLabelText("Email (required)", {
        selector: "input",
      });

      await user.type(emailInput, email);

      expect(emailInput).toHaveValue(email.slice(0, -1));
    });

    it(`does not allow user to type more than ${PASSWORD_MAX} characters in password field`, async () => {
      const { user } = setup();
      const password = new Array(PASSWORD_MAX + 1).fill("a").join("");
      const passwordInput = screen.getByLabelText("Password (required)", {
        selector: "input",
      });

      await user.type(passwordInput, password);

      expect(passwordInput).toHaveValue(password.slice(0, -1));
    });

    it("does not allow the user to login when they provided an email but not a password", async () => {
      const mockSessionServiceLogin = vi
        .spyOn(sessionService, "loginUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });
      const { user } = setup();
      const email = testUser.email;
      const emailInput = screen.getByLabelText("Email (required)", {
        selector: "input",
      });
      await user.type(emailInput, email);

      const loginButton = screen.getByRole("button", { name: "Login" });
      await user.click(loginButton);

      expect(mockSessionServiceLogin).not.toHaveBeenCalled();
    });

    it("does not allow the user to login when they provided a password but not an email", async () => {
      const mockSessionServiceLogin = vi
        .spyOn(sessionService, "loginUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });
      const { user } = setup();
      const password = testUser.password;
      const passwordInput = screen.getByLabelText("Password (required)", {
        selector: "input",
      });
      await user.type(passwordInput, password);

      const loginButton = screen.getByRole("button", { name: "Login" });
      await user.click(loginButton);

      expect(mockSessionServiceLogin).not.toHaveBeenCalled();
    });

    it("does not allow the user to login when they did not provide a password or email", async () => {
      const mockSessionServiceLogin = vi
        .spyOn(sessionService, "loginUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });
      const { user } = setup();

      const loginButton = screen.getByRole("button", { name: "Login" });
      await user.click(loginButton);

      expect(mockSessionServiceLogin).not.toHaveBeenCalled();
    });

    it("shows a notification when there is an error", async () => {
      const message = "Error";
      const mockSessionServiceLogin = vi
        .spyOn(sessionService, "loginUser")
        .mockImplementation(async () => {
          return Promise.reject({ json: { message }, status: 400 });
        });
      const { user } = setup();
      const email = testUser.email;
      const password = testUser.password;
      const passwordInput = screen.getByLabelText("Password (required)", {
        selector: "input",
      });
      const emailInput = screen.getByLabelText("Email (required)", {
        selector: "input",
      });
      await user.type(emailInput, email);
      await user.type(passwordInput, password);

      const loginButton = screen.getByRole("button", { name: "Login" });
      await user.click(loginButton);

      const notification = screen.getByRole("dialog", {
        name: message,
      });
      expect(notification).toBeInTheDocument();
      expect(mockSessionServiceLogin).toHaveBeenCalledTimes(1);
      expect(mockSessionServiceLogin).toHaveBeenCalledWith(testUser);
    });

    it("disables the form elements and buttons when while it is loading", async () => {
      const delay = 500;
      vi.spyOn(sessionService, "loginUser").mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { user: testUser }, status });
          }, delay);
        });
      });
      const { user } = setup();
      const email = testUser.email;
      const password = testUser.password;
      const passwordInput = screen.getByLabelText("Password (required)", {
        selector: "input",
      });
      const emailInput = screen.getByLabelText("Email (required)", {
        selector: "input",
      });
      await user.type(emailInput, email);
      await user.type(passwordInput, password);

      const loginButton = screen.getByRole("button", { name: "Login" });
      await user.click(loginButton);

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(loginButton).toBeDisabled();
    });
  });
});
