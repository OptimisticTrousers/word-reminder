import { createRoutesStub, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

import { emailService } from "../../../services/email_service";
import { EmailConfirmationModal } from "./EmailConfirmationModal";
import { Subject, Templates } from "common";
import { NotificationProvider } from "../../../context/Notification";

vi.mock("../ModalContainer/ModalContainer");

describe("EmailConfirmationModal", () => {
  const testUser = {
    email: "bob@email.com",
    id: "1",
  };

  const info = {
    message:
      "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
  };
  const status = 200;

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
            path: "/",
            Component: function () {
              return (
                <NotificationProvider>
                  <QueryClientProvider client={queryClient}>
                    <EmailConfirmationModal />
                  </QueryClientProvider>
                </NotificationProvider>
              );
            },
          },
          {
            path: "/userWords",
            Component: function () {
              return <div data-testid="user-words"></div>;
            },
          },
        ],
      },
    ]);

    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={["/"]} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows form", async () => {
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return { json: { info }, status };
      });
    const { asFragment } = setup();

    const message = await screen.findByText((_, element) => {
      return (
        element?.textContent ===
        `Please enter the confirmation code that was sent to ${testUser.email} within 5 minutes.`
      );
    });
    const userWords = screen.queryByTestId("user-words");
    expect(message).toBeInTheDocument();
    expect(userWords).not.toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: testUser.email,
      subject: Subject.CHANGE_VERIFICATION,
      template: Templates.CHANGE_VERIFICATION,
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the functions to verify confirmation email code", async () => {
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return { json: { info }, status };
      });
    const mockVerifyEmailToken = vi
      .spyOn(emailService, "verifyEmailToken")
      .mockImplementation(async () => {
        return { json: info, status };
      });
    const { user } = setup();

    const token = "code";
    const codeInput = await screen.findByLabelText("Code", {
      selector: "input",
    });
    await user.type(codeInput, token);
    const enterCodeButton = screen.getByRole("button", {
      name: "Enter Code",
    });
    await user.click(enterCodeButton);

    const userWords = await screen.findByTestId("user-words");
    expect(userWords).toBeInTheDocument();
    expect(mockVerifyEmailToken).toHaveBeenCalledTimes(1);
    expect(mockVerifyEmailToken).toHaveBeenCalledWith({ token });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: testUser.email,
      subject: Subject.CHANGE_VERIFICATION,
      template: Templates.CHANGE_VERIFICATION,
    });
  });

  it("does not allow the user to submit when the code field is empty", async () => {
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return { json: { info }, status };
      });
    const mockVerifyEmailToken = vi
      .spyOn(emailService, "verifyEmailToken")
      .mockImplementation(async () => {
        return { json: info, status };
      });

    const { user } = setup();

    const enterCodeButton = await screen.findByRole("button", {
      name: "Enter Code",
    });
    await user.click(enterCodeButton);

    const userWords = screen.queryByTestId("user-words");
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: testUser.email,
      subject: Subject.CHANGE_VERIFICATION,
      template: Templates.CHANGE_VERIFICATION,
    });
    expect(userWords).not.toBeInTheDocument();
    expect(mockVerifyEmailToken).not.toHaveBeenCalled();
  });

  it("calls the functions to show notification error", async () => {
    const message = "Error Message.";
    const status = 400;
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return { json: { info }, status };
      });
    const mockVerifyEmailToken = vi
      .spyOn(emailService, "verifyEmailToken")
      .mockImplementation(async () => {
        return Promise.reject({ json: { message }, status });
      });
    const { user } = setup();

    const token = "Wrong code.";
    const codeInput = await screen.findByLabelText("Code", {
      selector: "input",
    });
    await user.type(codeInput, token);
    const enterCodeButton = screen.getByRole("button", {
      name: "Enter Code",
    });
    await user.click(enterCodeButton);

    const userWords = screen.queryByTestId("user-words");
    const notification = screen.getByRole("dialog");
    expect(notification).toBeInTheDocument();
    expect(userWords).not.toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: testUser.email,
      subject: Subject.CHANGE_VERIFICATION,
      template: Templates.CHANGE_VERIFICATION,
    });
    expect(mockVerifyEmailToken).toHaveBeenCalledTimes(1);
    expect(mockVerifyEmailToken).toHaveBeenCalledWith({ token });
  });
});
