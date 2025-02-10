import { render, screen } from "@testing-library/react";
import { Settings } from "./Settings";
import { createRoutesStub, Outlet } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { emailService } from "../../services/email_service";
import { EMAIL_MAX, PASSWORD_MAX, Subject, Templates } from "common";
import { NotificationProvider } from "../../context/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userService } from "../../services/user_service";

vi.mock("../../components/modals/UserChangeModal", () => {
  return {
    UserChangeModal: function ({ toggleModal }: { toggleModal: () => void }) {
      return (
        <div role="dialog">
          <button onClick={toggleModal}>Close</button>
        </div>
      );
    },
  };
});

describe("Settings component", () => {
  const testUser = {
    email: "bob@gmail.com",
    password: "password",
    id: "1",
  };

  const status = 200;

  function setup({ initialRoute }: { initialRoute: string }) {
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
          {
            path: "/settings/:token",
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = "token";

  describe("settings with token", () => {
    it("renders non disabled inputs, heading, and change button", async () => {
      const mockVerifyEmailToken = vi
        .spyOn(emailService, "verifyEmailToken")
        .mockImplementation(async () => {
          return { json: { token }, status };
        });
      const { asFragment } = setup({ initialRoute: `/settings/${token}` });

      const heading = await screen.findByRole("heading");
      const emailInput = screen.getByLabelText("Email", {
        selector: "input",
      });
      const newPasswordInput = screen.getByLabelText("New Password", {
        selector: "input",
      });
      const newPasswordConfirmationInput = screen.getByLabelText(
        "New Password Confirmation",
        { selector: "input" }
      );
      const submitButton = screen.getByRole("button", { name: "Submit" });
      const changeButton = screen.queryByRole("button", {
        name: "Change",
      });

      expect(heading).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(newPasswordInput).toBeInTheDocument();
      expect(newPasswordConfirmationInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(changeButton).not.toBeInTheDocument();
      expect(mockVerifyEmailToken).toHaveBeenCalledTimes(1);
      expect(mockVerifyEmailToken).toHaveBeenCalledWith({ token });
      expect(asFragment()).toMatchSnapshot();
    });

    it("allows user to change their email only", async () => {
      vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
        async () => {
          return { json: { token }, status };
        }
      );
      const mockUpdateUser = vi
        .spyOn(userService, "updateUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });

      const { user } = setup({ initialRoute: `/settings/${token}` });

      const email = "joe@gmail.com";
      const emailInput = await screen.findByLabelText("Email", {
        selector: "input",
      });
      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.clear(emailInput);
      await user.type(emailInput, email);
      await user.click(submitButton);

      const notification = screen.getByRole("dialog", {
        name: "You have successfully updated your account.",
      });
      expect(notification).toBeInTheDocument();
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledWith({
        id: testUser.id,
        email,
        newPassword: "",
        newPasswordConfirmation: "",
      });
    });

    it("allows user to change their password only", async () => {
      vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
        async () => {
          return { json: { token }, status };
        }
      );
      const mockUpdateUser = vi
        .spyOn(userService, "updateUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });

      const { user } = setup({ initialRoute: `/settings/${token}` });

      const password = "new password";
      const newPasswordInput = await screen.findByLabelText("New Password", {
        selector: "input",
      });
      const newPasswordConfirmationInput = screen.getByLabelText(
        "New Password Confirmation",
        { selector: "input" }
      );
      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.type(newPasswordInput, password);
      await user.type(newPasswordConfirmationInput, password);
      await user.click(submitButton);

      const notification = screen.getByRole("dialog", {
        name: "You have successfully updated your account.",
      });
      expect(notification).toBeInTheDocument();
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledWith({
        id: testUser.id,
        email: testUser.email,
        newPassword: password,
        newPasswordConfirmation: password,
      });
    });

    it("allows user to change their email and password", async () => {
      vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
        async () => {
          return { json: { token }, status };
        }
      );
      const mockUpdateUser = vi
        .spyOn(userService, "updateUser")
        .mockImplementation(async () => {
          return { json: { user: testUser }, status };
        });

      const { user } = setup({ initialRoute: `/settings/${token}` });

      const email = "joe@gmail.com";
      const emailInput = await screen.findByLabelText("Email", {
        selector: "input",
      });
      const password = "new password";
      const newPasswordInput = screen.getByLabelText("New Password", {
        selector: "input",
      });
      const newPasswordConfirmationInput = screen.getByLabelText(
        "New Password Confirmation",
        { selector: "input" }
      );
      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.clear(emailInput);
      await user.type(emailInput, email);
      await user.type(newPasswordInput, password);
      await user.type(newPasswordConfirmationInput, password);
      await user.click(submitButton);

      const notification = screen.getByRole("dialog", {
        name: "You have successfully updated your account.",
      });
      expect(notification).toBeInTheDocument();
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledWith({
        id: testUser.id,
        email,
        newPassword: password,
        newPasswordConfirmation: password,
      });
    });

    it("calls the functions to show a notification error", async () => {
      const message = "Bad Request.";
      const status = 400;
      vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
        async () => {
          return { json: { token }, status };
        }
      );
      const mockUpdateUser = vi
        .spyOn(userService, "updateUser")
        .mockImplementation(async () => {
          return Promise.reject({ json: { message }, status });
        });
      const { user } = setup({ initialRoute: `/settings/${token}` });

      const submitButton = await screen.findByRole("button", {
        name: "Submit",
      });
      await user.click(submitButton);

      const notification = screen.getByRole("dialog", { name: message });
      expect(notification).toBeInTheDocument();
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledWith({
        id: testUser.id,
        email: testUser.email,
        newPassword: "",
        newPasswordConfirmation: "",
      });
    });

    describe("form validation", () => {
      it("does not allow the user to submit an invalid email", async () => {
        vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
          async () => {
            return { json: { token }, status };
          }
        );
        const mockUpdateUser = vi
          .spyOn(userService, "updateUser")
          .mockImplementation(async () => {
            return { json: { user: testUser }, status };
          });

        const { user } = setup({ initialRoute: `/settings/${token}` });

        const email = "invalidemail";
        const emailInput = await screen.findByLabelText("Email", {
          selector: "input",
        });
        const submitButton = screen.getByRole("button", { name: "Submit" });
        await user.clear(emailInput);
        await user.type(emailInput, email);
        await user.click(submitButton);

        const notification = screen.queryByRole("dialog", {
          name: "You have successfully updated your account.",
        });
        expect(notification).not.toBeInTheDocument();
        expect(mockUpdateUser).not.toHaveBeenCalled();
      });

      it(`does not allow the user to submit email longer than ${EMAIL_MAX}`, async () => {
        vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
          async () => {
            return { json: { token }, status };
          }
        );
        const mockUpdateUser = vi
          .spyOn(userService, "updateUser")
          .mockImplementation(async () => {
            return { json: { user: testUser }, status };
          });

        const { user } = setup({ initialRoute: `/settings/${token}` });

        const email = new Array(EMAIL_MAX).fill("a").join("") + "@gmail.com";
        const emailInput = await screen.findByLabelText("Email", {
          selector: "input",
        });
        const submitButton = screen.getByRole("button", { name: "Submit" });
        await user.clear(emailInput);
        await user.type(emailInput, email);
        await user.click(submitButton);

        const notification = screen.queryByRole("dialog", {
          name: "You have successfully updated your account.",
        });
        expect(notification).not.toBeInTheDocument();
        expect(mockUpdateUser).not.toHaveBeenCalled();
      });

      it(`does not allow the user to submit password longer than ${PASSWORD_MAX}`, async () => {
        vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
          async () => {
            return { json: { token }, status };
          }
        );
        const mockUpdateUser = vi
          .spyOn(userService, "updateUser")
          .mockImplementation(async () => {
            return { json: { user: testUser }, status };
          });

        const { user } = setup({ initialRoute: `/settings/${token}` });

        const password = new Array(PASSWORD_MAX + 10).fill("a").join("");
        const newPasswordInput = await screen.findByLabelText("New Password", {
          selector: "input",
        });
        const newPasswordConfirmationInput = screen.getByLabelText(
          "New Password Confirmation",
          {
            selector: "input",
          }
        );
        const submitButton = screen.getByRole("button", { name: "Submit" });
        await user.type(newPasswordInput, password);
        await user.type(newPasswordConfirmationInput, password);
        await user.click(submitButton);

        const notification = screen.getByRole("dialog", {
          name: "You have successfully updated your account.",
        });
        expect(notification).toBeInTheDocument();
        expect(mockUpdateUser).toHaveBeenCalledTimes(1);
        expect(mockUpdateUser).toHaveBeenCalledWith({
          id: testUser.id,
          email: testUser.email,
          newPassword: password.slice(0, -10),
          newPasswordConfirmation: password.slice(0, -10),
        });
      });

      it("does not allow the user to submit password without password confirmation", async () => {
        vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
          async () => {
            return { json: { token }, status };
          }
        );
        const mockUpdateUser = vi
          .spyOn(userService, "updateUser")
          .mockImplementation(async () => {
            return { json: { user: testUser }, status };
          });

        const { user } = setup({ initialRoute: `/settings/${token}` });

        const newPasswordInput = await screen.findByLabelText("New Password", {
          selector: "input",
        });
        const newPasswordConfirmationInput = screen.getByLabelText(
          "New Password Confirmation",
          {
            selector: "input",
          }
        );
        const submitButton = screen.getByRole("button", { name: "Submit" });
        await user.type(newPasswordInput, "password");
        await user.type(newPasswordConfirmationInput, "not matching password");
        await user.click(submitButton);

        const notification = screen.queryByRole("dialog", {
          name: "You have successfully updated your account.",
        });
        expect(notification).not.toBeInTheDocument();
        expect(mockUpdateUser).not.toHaveBeenCalled();
      });

      it("does not allow the user to submit without email", async () => {
        vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
          async () => {
            return { json: { token }, status };
          }
        );
        const mockUpdateUser = vi
          .spyOn(userService, "updateUser")
          .mockImplementation(async () => {
            return { json: { user: testUser }, status };
          });

        const { user } = setup({ initialRoute: `/settings/${token}` });

        const emailInput = await screen.findByLabelText("Email", {
          selector: "input",
        });
        const submitButton = screen.getByRole("button", { name: "Submit" });
        await user.clear(emailInput);
        await user.click(submitButton);

        const notification = screen.queryByRole("dialog", {
          name: "You have successfully updated your account.",
        });
        expect(notification).not.toBeInTheDocument();
        expect(mockUpdateUser).not.toHaveBeenCalled();
      });
    });
  });

  describe("settings without token", () => {
    it("renders disabled inputs, headings, and change button", async () => {
      vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
        async () => {
          return { json: undefined, status };
        }
      );

      const { asFragment } = setup({ initialRoute: `/settings/${token}` });

      const heading = await screen.findByRole("heading");
      const emailInput = screen.getByLabelText("Email", { selector: "input" });
      const newPasswordInput = screen.getByLabelText("New Password", {
        selector: "input",
      });
      const newPasswordConfirmationInput = screen.getByLabelText(
        "New Password Confirmation",
        {
          selector: "input",
        }
      );
      const changeButton = screen.getByRole("button", {
        name: "Change",
      });
      const submitButton = screen.queryByRole("button", { name: "Submit" });

      expect(heading).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toBeDisabled();
      expect(newPasswordInput).toBeInTheDocument();
      expect(newPasswordInput).toBeDisabled();
      expect(newPasswordConfirmationInput).toBeInTheDocument();
      expect(newPasswordConfirmationInput).toBeDisabled();
      expect(changeButton).toBeInTheDocument();
      expect(submitButton).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("calls the functions to show a notification error when changing account details", async () => {
      const message = "Bad Request.";
      const status = 400;
      vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
        async () => {
          return { json: undefined, status };
        }
      );
      const mockSendEmail = vi
        .spyOn(emailService, "sendEmail")
        .mockImplementation(async () => {
          return Promise.reject({ json: { message }, status });
        });
      const { user } = setup({ initialRoute: "/settings" });

      const changeButton = await screen.findByRole("button", {
        name: "Change",
      });
      await user.click(changeButton);

      const notification = screen.getByRole("dialog", { name: message });
      expect(notification).toBeInTheDocument();
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith({
        email: testUser.email,
        subject: Subject.CHANGE_VERIFICATION,
        template: Templates.CHANGE_VERIFICATION,
      });
    });

    it("opens user change modal and sends email", async () => {
      const info = {
        message:
          "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
      };
      const status = 200;
      vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
        async () => {
          return { json: undefined, status };
        }
      );
      const mockSendEmail = vi
        .spyOn(emailService, "sendEmail")
        .mockImplementation(async () => {
          return { json: { info }, status };
        });
      const { user } = setup({ initialRoute: "/settings" });

      const changeButton = await screen.findByRole("button", {
        name: "Change",
      });
      await user.click(changeButton);

      const modal = screen.getByRole("dialog");
      const modalButton = screen.getByRole("button", { name: "Close" });
      expect(modal).toBeInTheDocument();
      expect(modalButton).toBeInTheDocument();
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith({
        email: testUser.email,
        subject: Subject.CHANGE_VERIFICATION,
        template: Templates.CHANGE_VERIFICATION,
      });
    });

    it("closes change email modal", async () => {
      const info = {
        message:
          "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
      };
      const status = 200;
      vi.spyOn(emailService, "verifyEmailToken").mockImplementation(
        async () => {
          return { json: undefined, status };
        }
      );
      vi.spyOn(emailService, "sendEmail").mockImplementation(async () => {
        return { json: { info }, status };
      });
      const { user } = setup({ initialRoute: "/settings" });

      const changeModal = await screen.findByRole("button", {
        name: "Change",
      });
      await user.click(changeModal);

      const modalButton = screen.getByRole("button", { name: "Close" });
      await user.click(modalButton);

      const modal = screen.queryByRole("dialog");
      expect(modal).not.toBeInTheDocument();
    });
  });
});
