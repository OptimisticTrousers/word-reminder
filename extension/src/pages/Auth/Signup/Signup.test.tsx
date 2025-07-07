import { EMAIL_MAX, PASSWORD_MAX } from "common";
import { createRoutesStub } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotificationProvider } from "../../../context/Notification";
import { sessionService } from "../../../services/session_service";
import { userService } from "../../../services/user_service";
import { Signup } from "./Signup";

describe("Signup component", () => {
  const Stub = createRoutesStub([
    {
      path: "/signup",
      Component: Signup,
    },
    {
      path: "/userWords",
      Component: function () {
        return <button>Current URL: /userWords</button>;
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
    id: "1",
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
            <Stub initialEntries={["/signup"]} />
          </QueryClientProvider>
        </NotificationProvider>
      ),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the functions to signup, login, show notification, redirect user", async () => {
    const mockSendMessage = vi.spyOn(window.chrome.runtime, "sendMessage");
    const mockStorageSet = vi.spyOn(window.chrome.storage.sync, "set");
    const mockUserServiceSignup = vi
      .spyOn(userService, "signupUser")
      .mockImplementation(async () => {
        return { json: { user: testUser }, status };
      });
    const mockSessionServiceLogin = vi
      .spyOn(sessionService, "loginUser")
      .mockImplementation(async () => {
        return { json: { user: testUser }, status };
      });
    const mockInvalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
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

    const signupButton = screen.getByRole("button", { name: "Signup" });
    await user.click(signupButton);

    const userWords = await screen.findByRole("button", {
      name: "Current URL: /userWords",
    });
    const notification = screen.getByRole("dialog", {
      name: `You have successfully signed in, ${email}.`,
    });
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(null);
    expect(mockStorageSet).toHaveBeenCalledTimes(1);
    expect(mockStorageSet).toHaveBeenCalledWith({ userId: testUser.id });
    expect(mockSessionServiceLogin).toHaveBeenCalledTimes(1);
    expect(mockSessionServiceLogin).toHaveBeenCalledWith({
      email: testUser.email,
      password: testUser.password,
    });
    expect(mockUserServiceSignup).toHaveBeenCalledTimes(1);
    expect(mockUserServiceSignup).toHaveBeenCalledWith({
      email: testUser.email,
      password: testUser.password,
    });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["sessions"],
      exact: true,
    });
    expect(userWords).toBeInTheDocument();
    expect(notification).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("returns signup user response when the response is not 200", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockUserServiceSignup = vi
      .spyOn(userService, "signupUser")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
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
    const signupButton = screen.getByRole("button", { name: "Signup" });
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    await user.click(signupButton);

    const notification = screen.getByRole("dialog", { name: message });
    expect(notification).toBeInTheDocument();
    expect(mockUserServiceSignup).toHaveBeenCalledTimes(1);
    expect(mockUserServiceSignup).toHaveBeenCalledWith({
      email: testUser.email,
      password: testUser.password,
    });
  });

  it("shows correct link to log into account", async () => {
    setup();
    const link = screen.getByRole("link", { name: "Login" });

    expect(link).toHaveAttribute("href", "/login");
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

    it("does not allow the user to signup when they provided an email but not a password", async () => {
      const mockUserServiceSignup = vi
        .spyOn(userService, "signupUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });
      const { user } = setup();
      const email = testUser.email;
      const emailInput = screen.getByLabelText("Email (required)", {
        selector: "input",
      });
      await user.type(emailInput, email);

      const signupButton = screen.getByRole("button", { name: "Signup" });
      await user.click(signupButton);

      expect(mockUserServiceSignup).not.toHaveBeenCalled();
    });

    it("does not allow the user to signup when they provided a password but not an email", async () => {
      const mockUserServiceSignup = vi
        .spyOn(userService, "signupUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });
      const { user } = setup();
      const password = testUser.password;
      const passwordInput = screen.getByLabelText("Password (required)", {
        selector: "input",
      });
      await user.type(passwordInput, password);

      const signupButton = screen.getByRole("button", { name: "Signup" });
      await user.click(signupButton);

      expect(mockUserServiceSignup).not.toHaveBeenCalled();
    });

    it("does not allow the user to signup when they did not provide a password or email", async () => {
      const mockUserServiceSignup = vi
        .spyOn(userService, "signupUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });
      const { user } = setup();

      const signupButton = screen.getByRole("button", { name: "Signup" });
      await user.click(signupButton);

      expect(mockUserServiceSignup).not.toHaveBeenCalled();
    });

    it("shows a notification when there is an error", async () => {
      const message = "Error";
      const mockUserServiceSignup = vi
        .spyOn(userService, "signupUser")
        .mockImplementation(async () => {
          return Promise.reject({ json: { message }, status: 400 });
        });
      const mockSessionServiceLogin = vi
        .spyOn(sessionService, "loginUser")
        .mockImplementation(async () => {
          return { json: { message }, status: 400 };
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

      const signupButton = screen.getByRole("button", { name: "Signup" });
      await user.click(signupButton);

      const notification = screen.getByRole("dialog", {
        name: message,
      });
      expect(notification).toBeInTheDocument();
      expect(mockUserServiceSignup).toHaveBeenCalledTimes(1);
      expect(mockUserServiceSignup).toHaveBeenCalledWith({
        email: testUser.email,
        password: testUser.password,
      });
      expect(mockSessionServiceLogin).not.toHaveBeenCalled();
    });

    it("disables the form elements and buttons when while it is loading", async () => {
      const delay = 50;
      vi.spyOn(userService, "signupUser").mockImplementation(() => {
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

      const signupButton = screen.getByRole("button", { name: "Signup" });
      await user.click(signupButton);

      expect(signupButton).toHaveTextContent("Signing up...");
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(signupButton).toBeDisabled();
    });
  });
});
