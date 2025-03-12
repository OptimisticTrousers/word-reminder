import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { emailService } from "../../../services/email_service";
import { EmailConfirmation } from "./EmailConfirmation";
import { Subject, Template } from "common";
import { NotificationProvider } from "../../../context/Notification";
import { createRoutesStub, Outlet } from "react-router-dom";

vi.mock("../../../components/ui/Loading/Loading");

vi.mock("../../Error500/Error500");

describe("EmailConfirmation component", () => {
  const info = {
    message:
      "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
  };

  const user = {
    id: "1",
    email: "bob@gmail.com",
  };

  const status = 200;

  function setup() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <Outlet context={{ user }} />;
        },
        children: [
          {
            path: "/confirmation",
            Component: function () {
              return (
                <NotificationProvider>
                  <QueryClientProvider client={queryClient}>
                    <EmailConfirmation />
                  </QueryClientProvider>
                </NotificationProvider>
              );
            },
          },
        ],
      },
    ]);

    return render(<Stub initialEntries={["/confirmation"]} />);
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
        `Follow the link in the email sent to ${user.email} and continue creating your account.`
      );
    });
    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: user.id,
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

    setup();

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: user.id,
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

    setup();

    const error = await screen.findByTestId("error-500");
    expect(error).toBeInTheDocument();
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      userId: user.id,
      body: {
        email: user.email,
        subject: Subject.CONFIRM_ACCOUNT,
        template: Template.CONFIRM_ACCOUNT,
      },
    });
  });
});
