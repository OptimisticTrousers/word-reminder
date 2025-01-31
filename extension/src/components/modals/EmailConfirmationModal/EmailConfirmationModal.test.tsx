import { createRoutesStub, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { Props } from "../ModalContainer/ModalContainer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { emailService } from "../../../services/email_service";
import { EmailConfirmationModal } from "./EmailConfirmationModal";

vi.mock("../ModalContainer", () => {
  return {
    ModalContainer: function ({ title, toggleModal, children }: Props) {
      return (
        <div>
          <h2>{title}</h2>
          <button aria-label="Close modal" onClick={toggleModal}>
            X
          </button>
          <div>{children}</div>
        </div>
      );
    },
  };
});
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

  const mockToggleModal = vi.fn();

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
            path: "/wordReminders",
            Component: function () {
              return (
                <QueryClientProvider client={queryClient}>
                  <EmailConfirmationModal toggleModal={mockToggleModal} />
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);

    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={["/wordReminders"]} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // describe("send confirmation modal", () => {
  //   it("shows form", async () => {
  //     const { asFragment } = setup();

  //     const message = screen.getByText(
  //       "In order to verify it is you, we need to send an email associated with this account."
  //     );
  //     expect(message).toBeInTheDocument();
  //     expect(asFragment()).toMatchSnapshot();
  //   });

  //   it("calls the functions to send a confirmation email", async () => {
  //     const mockSendEmail = vi
  //       .spyOn(emailService, "sendEmail")
  //       .mockImplementation(async () => {
  //         return { json: info, status };
  //       });

  //     const { user } = setup();

  //     const sendConfirmationButton = screen.getByRole("button", {
  //       name: "Send Confirmation",
  //     });
  //     await user.click(sendConfirmationButton);

  //     const modal = screen.queryByRole("dialog");
  //     expect(modal).not.toBeInTheDocument();
  //     expect(mockSendEmail).toHaveBeenCalledTimes(1);
  //     expect(mockSendEmail).toHaveBeenCalledWith({
  //       email: testUser.email,
  //       subject: "Confirm Your Email",
  //       template: Templates.EMAIL_VERIFICATION,
  //     });
  //     expect(mockToggleModal).not.toHaveBeenCalled();
  //   });

  //   it("calls the functions to show notification error", async () => {
  //     const message = "Error Message.";
  //     const status = 400;
  //     const mockSendEmail = vi
  //       .spyOn(emailService, "sendEmail")
  //       .mockImplementation(async () => {
  //         return Promise.reject({ json: { message }, status });
  //       });

  //     const { user } = setup();
  //     const sendConfirmationButton = screen.getByRole("button", {
  //       name: "Send Confirmation",
  //     });
  //     await user.click(sendConfirmationButton);

  //     const modal = screen.queryByRole("dialog");
  //     expect(mockSendEmail).toHaveBeenCalledTimes(1);
  //     expect(mockSendEmail).toHaveBeenCalledWith({
  //       email: testUser.email,
  //       subject: "Confirm Your Email",
  //       template: Templates.EMAIL_VERIFICATION,
  //     });
  //     expect(modal).not.toBeInTheDocument();
  //     expect(mockToggleModal).not.toHaveBeenCalled();
  //   });

  //   it("changes the modal so the user can enter the code", async () => {
  //     vi.spyOn(emailService, "sendEmail").mockImplementation(async () => {
  //       return { json: info, status };
  //     });
  //     const { user } = setup();

  //     const sendConfirmationButton = screen.getByRole("button", {
  //       name: "Send Confirmation",
  //     });
  //     await user.click(sendConfirmationButton);

  //     const enterCodeButton = screen.getByRole("button", {
  //       name: "Enter Code",
  //     });
  //     const message = screen.getByText(
  //       `Please enter the code that was sent to your email: ${testUser.email}.`
  //     );
  //     expect(enterCodeButton).toBeInTheDocument();
  //     expect(message).toBeInTheDocument();
  //     expect(mockToggleModal).not.toHaveBeenCalled();
  //   });

  //   it("user closes the modal after modal was changed", async () => {
  //     vi.spyOn(emailService, "sendEmail").mockImplementation(async () => {
  //       return { json: info, status };
  //     });
  //     const { user } = setup();
  //     const sendConfirmationButton = screen.getByRole("button", {
  //       name: "Send Confirmation",
  //     });
  //     await user.click(sendConfirmationButton);

  //     const cancelButton = screen.getByRole("button", { name: "Cancel" });
  //     await user.click(cancelButton);

  //     const modal = screen.queryByRole("dialog");
  //     expect(modal).not.toBeInTheDocument();
  //     expect(mockToggleModal).toHaveBeenCalledTimes(1);
  //     expect(mockToggleModal).toHaveBeenCalledWith();
  //   });

  //   it("user closes the modal using cancel button", async () => {
  //     const { user } = setup();

  //     const cancelButton = screen.getByRole("button", { name: "Cancel" });
  //     await user.click(cancelButton);

  //     const modal = screen.getByRole("dialog");
  //     expect(modal).not.toBeInTheDocument();
  //     expect(mockToggleModal).toHaveBeenCalledTimes(1);
  //     expect(mockToggleModal).toHaveBeenCalledWith();
  //   });

  //   it("user closes the modal using x button", async () => {
  //     const { user } = setup();

  //     const modalContainerCloseButton = screen.getByRole("button", {
  //       name: "Close modal",
  //     });
  //     await user.click(modalContainerCloseButton);

  //     const modal = screen.getByRole("dialog");
  //     expect(modal).not.toBeInTheDocument();
  //     expect(mockToggleModal).toHaveBeenCalledTimes(1);
  //     expect(mockToggleModal).toHaveBeenCalledWith();
  //   });
  // });

  describe("type email code modal", () => {
    it("shows form", async () => {
      const { asFragment } = setup();

      const message = screen.getByText((_, element) => {
        return (
          element?.textContent ===
          `Please enter the confirmation code that was sent to ${testUser.email} within 5 minutes.`
        );
      });
      expect(message).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("calls the functions to verify confirmation email code", async () => {
      const mockVerifyEmailCode = vi
        .spyOn(emailService, "verifyEmailCode")
        .mockImplementation(async () => {
          return { json: info, status };
        });
      const { user } = setup();

      const code = "code";
      const codeInput = screen.getByLabelText("Code", { selector: "input" });
      await user.type(codeInput, code);
      const enterCodeButton = screen.getByRole("button", {
        name: "Enter Code",
      });
      await user.click(enterCodeButton);

      expect(mockVerifyEmailCode).toHaveBeenCalledTimes(1);
      expect(mockVerifyEmailCode).toHaveBeenCalledWith({ code });
      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });

    it("does not allow the user to submit when the code field is empty", async () => {
      const mockVerifyEmailCode = vi
        .spyOn(emailService, "verifyEmailCode")
        .mockImplementation(async () => {
          return { json: info, status };
        });

      const { user } = setup();

      const enterCodeButton = screen.getByRole("button", {
        name: "Enter Code",
      });
      await user.click(enterCodeButton);

      expect(mockVerifyEmailCode).not.toHaveBeenCalled();
      expect(mockToggleModal).not.toHaveBeenCalled();
    });

    it("calls the functions to show notification error", async () => {
      const message = "Error Message.";
      const status = 400;
      const mockVerifyEmailCode = vi
        .spyOn(emailService, "verifyEmailCode")
        .mockImplementation(async () => {
          return Promise.reject({ json: { message }, status });
        });
      const { user } = setup();

      const code = "Wrong code.";
      const codeInput = screen.getByLabelText("Code", { selector: "input" });
      await user.type(codeInput, code);
      const enterCodeButton = screen.getByRole("button", {
        name: "Enter Code",
      });
      await user.click(enterCodeButton);

      expect(mockVerifyEmailCode).toHaveBeenCalledTimes(1);
      expect(mockVerifyEmailCode).toHaveBeenCalledWith({ code });
      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });

    it("user closes the modal using cancel button", async () => {
      const { user } = setup();

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });

    it("user closes the modal using x button", async () => {
      const { user } = setup();

      const modalContainerCloseButton = screen.getByRole("button", {
        name: "Cancel",
      });
      await user.click(modalContainerCloseButton);

      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });
  });
});
