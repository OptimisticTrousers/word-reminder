import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { emailService } from "../../../services/email_service";
import { EmailConfirmation } from "./EmailConfirmation";
import { Subject, Templates } from "common";
import { NotificationProvider } from "../../../context/Notification";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../components/ui/Loading/Loading");

vi.mock("../../Error500/Error500");

describe("EmailConfirmation component", () => {
  const email = "bob@gmail.com";

  const info = {
    message:
      "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
  };

  const status = 200;

  function setup() {
    const queryClient = new QueryClient();

    return render(
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <EmailConfirmation email={email} />
          </MemoryRouter>
        </QueryClientProvider>
      </NotificationProvider>
    );
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

    const { asFragment } = setup();

    const heading = await screen.findByRole("heading", {
      name: "Check your email",
    });
    const message = screen.getByText((_, element) => {
      return (
        element?.textContent ===
        `Follow the link in the email sent to ${email} and continue creating your account.`
      );
    });
    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: email,
      subject: Subject.CHANGE_VERIFICATION,
      template: Templates.CONFIRM_EMAIL,
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

    setup();

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: email,
      subject: Subject.CHANGE_VERIFICATION,
      template: Templates.CONFIRM_EMAIL,
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

    setup();

    const error = await screen.findByTestId("error-500");
    expect(error).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: email,
      subject: Subject.CHANGE_VERIFICATION,
      template: Templates.CONFIRM_EMAIL,
    });
  });
});
