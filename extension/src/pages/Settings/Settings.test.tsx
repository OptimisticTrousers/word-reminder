import { render, screen } from "@testing-library/react";
import { Settings } from "./Settings";
import { createRoutesStub, Outlet } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { emailService } from "../../services/email_service";
import { Templates } from "common";
import { NotificationProvider } from "../../context/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../components/modals/UserChangeModal", () => {
  return {
    UserChangeModal: function ({
      toggleModal,
      path,
    }: {
      toggleModal: () => void;
      path: string;
    }) {
      return (
        <div role="dialog">
          <p>{path}</p>
          <button onClick={toggleModal}>Close</button>
        </div>
      );
    },
  };
});

describe("Settings component", () => {
  const testUser = {
    email: "bob@gmail.com",
    id: "1",
  };

  function setup() {
    const queryClient = new QueryClient();
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
      ...render(<Stub initialEntries={["/settings"]} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders links to change email and password", async () => {
    const { asFragment } = setup();

    const email = screen.getByText(`Email: ${testUser.email}`);
    const password = screen.getByText("Password: *********");
    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(asFragment).toMatchSnapshot();
  });

  it("calls the functions to show a notification error", async () => {
    const message = "Bad Request.";
    const status = 400;
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const { user } = setup();

    const changeEmailButton = screen.getByRole("button", {
      name: "Change Email",
    });
    await user.click(changeEmailButton);

    const notification = screen.getByRole("dialog", { name: message });
    expect(notification).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: testUser.email,
      subject: "Change Your Email",
      template: Templates.CHANGE_EMAIL_VERIFICATION,
    });
  });

  describe("email", () => {
    it("opens change email modal and sends email", async () => {
      const info = {
        message:
          "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
      };
      const status = 200;
      const mockSendEmail = vi
        .spyOn(emailService, "sendEmail")
        .mockImplementation(async () => {
          return { json: { info }, status };
        });
      const { user } = setup();

      const changeEmailButton = screen.getByRole("button", {
        name: "Change Email",
      });
      await user.click(changeEmailButton);

      const modal = screen.getByRole("dialog");
      const path = screen.getByText("/email");
      const modalButton = screen.getByRole("button", { name: "Close" });
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith({
        email: testUser.email,
        subject: "Change Your Email",
        template: Templates.CHANGE_EMAIL_VERIFICATION,
      });
      expect(modal).toBeInTheDocument();
      expect(path).toBeInTheDocument();
      expect(modalButton).toBeInTheDocument();
    });

    it("closes change email modal", async () => {
      const info = {
        message:
          "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
      };
      const status = 200;
      vi.spyOn(emailService, "sendEmail").mockImplementation(async () => {
        return { json: { info }, status };
      });
      const { user } = setup();

      const changeEmailModal = screen.getByRole("button", {
        name: "Change Email",
      });
      await user.click(changeEmailModal);

      const modalButton = screen.getByRole("button", { name: "Close" });
      await user.click(modalButton);

      const modal = screen.queryByRole("dialog");
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe("password", () => {
    it("opens change password modal", async () => {
      const info = {
        message:
          "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
      };
      const status = 200;
      const mockSendEmail = vi
        .spyOn(emailService, "sendEmail")
        .mockImplementation(async () => {
          return { json: { info }, status };
        });
      const { user } = setup();

      const changePasswordButton = screen.getByRole("button", {
        name: "Change Password",
      });
      await user.click(changePasswordButton);

      const modal = screen.getByRole("dialog");
      const path = screen.getByText("/password");
      const modalButton = screen.getByRole("button", { name: "Close" });
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith({
        email: testUser.email,
        subject: "Change Your Password",
        template: Templates.CHANGE_PASSWORD_VERIFICATION,
      });
      expect(modal).toBeInTheDocument();
      expect(path).toBeInTheDocument();
      expect(modalButton).toBeInTheDocument();
    });

    it("closes change email modal", async () => {
      const info = {
        message:
          "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
      };
      const status = 200;
      vi.spyOn(emailService, "sendEmail").mockImplementation(async () => {
        return { json: { info }, status };
      });
      const { user } = setup();

      const changePasswordModal = screen.getByRole("button", {
        name: "Change Password",
      });
      await user.click(changePasswordModal);

      const modalButton = screen.getByRole("button", { name: "Close" });
      await user.click(modalButton);

      const modal = screen.queryByRole("dialog");
      expect(modal).not.toBeInTheDocument();
    });
  });
});
