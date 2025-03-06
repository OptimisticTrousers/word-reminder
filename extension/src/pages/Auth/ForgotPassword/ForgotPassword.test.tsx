import { render, screen } from "@testing-library/react";
import { ForgotPassword } from "./ForgotPassword";
import userEvent from "@testing-library/user-event";
import { emailService } from "../../../services/email_service";
import { Subject, Template } from "common";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "../../../context/Notification";

describe("ForgotPassword component", () => {
  function setup() {
    const queryClient = new QueryClient();

    return render(
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ForgotPassword />
          </MemoryRouter>
        </QueryClientProvider>
      </NotificationProvider>
    );
  }

  const testUser = {
    email: "bob@gmail.com",
    password: "password",
    id: "1",
  };

  const info = {
    message:
      "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
  };

  const status = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders enter email page", async () => {
    const { asFragment } = setup();

    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send verification email",
    });
    const heading = screen.getByRole("heading", {
      name: "Reset your password",
    });
    const description = screen.getByText(
      "Enter your email address and we'll send you a link to reset your password."
    );
    expect(emailInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(asFragment());
  });

  it("sends verification email when the user clicks the send verification button", async () => {
    const mockSendEmail = vi
      .spyOn(emailService, "sendEmail")
      .mockImplementation(async () => {
        return { json: { info }, status };
      });
    setup();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, testUser.email);
    const submitButton = screen.getByRole("button", {
      name: "Send verification email",
    });
    await user.click(submitButton);

    const notification = screen.getByRole("dialog");
    expect(notification).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: testUser.email,
      subject: Subject.FORGOT_PASSWORD,
      template: Template.FORGOT_PASSWORD,
    });
  });

  describe("form validation", () => {
    it("does not allow the user to send verification email when the email field is empty", async () => {
      const mockSendEmail = vi
        .spyOn(emailService, "sendEmail")
        .mockImplementation(async () => {
          return { json: { info }, status };
        });
      setup();
      const user = userEvent.setup();

      const submitButton = screen.getByRole("button", {
        name: "Send verification email",
      });
      await user.click(submitButton);

      const notification = screen.queryByRole("dialog");
      expect(notification).not.toBeInTheDocument();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });
});
