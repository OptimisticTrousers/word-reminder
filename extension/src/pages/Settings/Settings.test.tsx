import { render, screen } from "@testing-library/react";
import { Settings } from "./Settings";
import { createRoutesStub, Outlet } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { emailService } from "../../services/email_service";
import { Subject, Template } from "common";
import { NotificationProvider } from "../../context/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("Settings component", () => {
  function setup({ initialRoute }: { initialRoute: string }) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return (
            <QueryClientProvider client={queryClient}>
              <NotificationProvider>
                <Outlet context={{ user: testUser }} />
              </NotificationProvider>
            </QueryClientProvider>
          );
        },
        children: [
          {
            path: "/settings",
            Component: Settings,
          },
        ],
      },
    ]);
    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={[initialRoute]} />),
    };
  }

  const info = {
    message:
      "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
  };

  const testUser = {
    email: "bob@gmail.com",
    password: "password",
    id: "1",
  };

  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders non disabled inputs and heading", async () => {
    const { asFragment } = setup({ initialRoute: "/settings" });

    const heading = screen.getByRole("heading", {
      name: "Change Account Details",
    });
    const emailInput = screen.getByLabelText("Change Email", {
      selector: "input",
    });
    const passwordInput = screen.getByLabelText("Change Password", {
      selector: "input",
    });

    expect(heading).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("sends change email verification email when clicking change email button", async () => {
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return { json: { info }, status };
      });
    const { user } = setup({ initialRoute: "/settings" });

    const changeEmailButton = screen.getByRole("button", {
      name: "Change Email",
    });
    await user.click(changeEmailButton);

    const notification = screen.getByRole("dialog", {
      name: "A confirmation email was sent to your email to update your email.",
    });
    expect(notification).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        email: testUser.email,
        subject: Subject.CHANGE_EMAIL,
        template: Template.CHANGE_EMAIL,
      },
    });
  });

  it("sends change password verification email when clicking change password button", async () => {
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return { json: { info }, status };
      });
    const { user } = setup({ initialRoute: "/settings" });

    const changePasswordButton = screen.getByRole("button", {
      name: "Change Password",
    });
    await user.click(changePasswordButton);

    const notification = screen.getByRole("dialog", {
      name: "A confirmation email was sent to your email to update your password.",
    });
    expect(notification).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        email: testUser.email,
        subject: Subject.CHANGE_PASSWORD,
        template: Template.CHANGE_PASSWORD,
      },
    });
  });

  it("calls the functions to show a notification error when changing email", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const { user } = setup({ initialRoute: "/settings" });

    const changeEmailButton = screen.getByRole("button", {
      name: "Change Email",
    });
    await user.click(changeEmailButton);

    const notification = screen.getByRole("dialog", { name: message });
    expect(notification).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        email: testUser.email,
        subject: Subject.CHANGE_EMAIL,
        template: Template.CHANGE_EMAIL,
      },
    });
  });

  it("calls the functions to show a notification error when changing password", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const { user } = setup({ initialRoute: "/settings" });

    const changePasswordButton = screen.getByRole("button", {
      name: "Change Password",
    });
    await user.click(changePasswordButton);

    const notification = screen.getByRole("dialog", { name: message });
    expect(notification).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: testUser.id,
      body: {
        email: testUser.email,
        subject: Subject.CHANGE_PASSWORD,
        template: Template.CHANGE_PASSWORD,
      },
    });
  });
});
