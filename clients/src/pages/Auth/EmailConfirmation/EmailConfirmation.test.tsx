import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { emailService } from "../../../services/email_service";
import { EmailConfirmation } from "./EmailConfirmation";
import { Subject, Template } from "common";
import { NotificationProvider } from "../../../context/Notification";
import { createRoutesStub, Outlet } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { sessionService } from "../../../services/session_service";

vi.mock("../../../components/ui/Loading/Loading");

vi.mock("../../Error500/Error500");

describe("EmailConfirmation component", () => {
  const info = {
    message:
      "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
  };

  const user = {
    id: 1,
    email: "bob@gmail.com",
    confirmed: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const status = 200;

  function setup(queryClient: QueryClient) {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return (
            <NotificationProvider>
              <QueryClientProvider client={queryClient}>
                <Outlet />
              </QueryClientProvider>
            </NotificationProvider>
          );
        },
        children: [
          {
            path: "/email-confirmation",
            Component: function () {
              return <EmailConfirmation user={user} />;
            },
          },
          {
            path: "/login",
            Component: function () {
              return <div data-testid="login"></div>;
            },
          },
        ],
      },
    ]);

    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={["/email-confirmation"]} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the functions to send confirmation email", async () => {
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return { json: { info }, status };
      });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { asFragment } = setup(queryClient);

    const heading = await screen.findByRole("heading", {
      name: "Check your email",
    });
    const message = screen.getByText((_, element) => {
      return (
        element?.textContent ===
        `Follow the link in the email sent to ${user.email} to create, verify, and use your account.`
      );
    });
    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: String(user.id),
      body: {
        email: user.email,
        subject: Subject.CONFIRM_ACCOUNT,
        template: Template.CONFIRM_ACCOUNT,
      },
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows that it is sending email when loading", async () => {
    const delay = 50;
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ json: { info }, status });
          }, delay);
        });
      });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    setup(queryClient);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: String(user.id),
      body: {
        email: user.email,
        subject: Subject.CONFIRM_ACCOUNT,
        template: Template.CONFIRM_ACCOUNT,
      },
    });
  });

  it("shows that it is sending email when there is an error", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    setup(queryClient);

    const error = await screen.findByTestId("error-500");
    expect(error).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: String(user.id),
      body: {
        email: user.email,
        subject: Subject.CONFIRM_ACCOUNT,
        template: Template.CONFIRM_ACCOUNT,
      },
    });
  });

  describe("when cancelling", () => {
    it("logs out the user when the 'Cancel' button is clicked", async () => {
      vi.spyOn(emailService, "sendEmail").mockImplementation(async () => {
        return { json: { info }, status };
      });
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockClear = vi.spyOn(queryClient, "clear");
      const mockLogout = vi
        .spyOn(sessionService, "logoutUser")
        .mockImplementation(async () => {
          return { json: { user: { id: "1" } }, status: 200 };
        });
      const mockStorageRemove = vi.spyOn(window.chrome.storage.sync, "remove");
      const { user } = setup(queryClient);

      const cancelButton = await screen.findByRole("button", {
        name: "Cancel",
      });
      await user.click(cancelButton);

      const login = await screen.findByTestId("login");
      expect(login).toBeInTheDocument();
      expect(mockStorageRemove).toHaveBeenCalledTimes(1);
      expect(mockStorageRemove).toHaveBeenCalledWith("userId");
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockLogout).toHaveBeenCalledWith(undefined);
      expect(mockClear).toHaveBeenCalledTimes(1);
      expect(mockClear).toHaveBeenCalledWith();
    });

    it("disables 'Cancel' button when mutation is pending", async () => {
      vi.spyOn(emailService, "sendEmail").mockImplementation(async () => {
        return { json: { info }, status };
      });
      const delay = 500;
      const mockLogout = vi
        .spyOn(sessionService, "logoutUser")
        .mockImplementation(async () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ json: { user: { id: "1" } }, status: 200 });
            }, delay);
          });
        });
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const { user } = setup(queryClient);

      await waitFor(async () => {
        const cancelButton = screen.getByRole("button", {
          name: "Cancel",
        });
        await user.click(cancelButton);

        expect(cancelButton).toBeDisabled();
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockLogout).toHaveBeenCalledWith(undefined);
      });
    });

    it("when there is an error, it shows a notification error when attempting to cancel", async () => {
      vi.spyOn(emailService, "sendEmail").mockImplementation(async () => {
        return { json: { info }, status };
      });
      const message = "Bad Request.";
      const status = 400;
      const mockLogout = vi
        .spyOn(sessionService, "logoutUser")
        .mockImplementation(async () => {
          return Promise.reject({ json: { message }, status });
        });
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const { user } = setup(queryClient);

      const cancelButton = await screen.findByRole("button", {
        name: "Cancel",
      });
      await user.click(cancelButton);

      const notification = await screen.findByRole("dialog", { name: message });
      expect(notification).toBeInTheDocument();
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockLogout).toHaveBeenCalledWith(undefined);
    });
  });
});
