import { createRoutesStub, Outlet, useParams } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

import { UserChangeModal } from "./UserChangeModal";

vi.mock("../ModalContainer/ModalContainer");

describe("EmailChangeModal", () => {
  const testUser = {
    email: "bob@email.com",
    id: "1",
  };

  const mockToggleModal = vi.fn();

  function setup(path: string) {
    const queryClient = new QueryClient();
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <Outlet context={{ user: testUser }} />;
        },
        children: [
          {
            path: "/users/update",
            Component: function () {
              return (
                <QueryClientProvider client={queryClient}>
                  <UserChangeModal path={path} toggleModal={mockToggleModal} />
                </QueryClientProvider>
              );
            },
          },
          {
            path: "/users/update/email/:code",
            Component: function () {
              const { code } = useParams();

              return (
                <div>You can change your email thanks to this code: {code}</div>
              );
            },
          },
          {
            path: "/users/update/password/:code",
            Component: function () {
              const { code } = useParams();

              return (
                <div>
                  You can change your password thanks to this code: {code}
                </div>
              );
            },
          },
        ],
      },
    ]);
    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={["/users/update"]} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateEmail", () => {
    const path = "email";

    it("shows form", async () => {
      const { asFragment } = setup(path);

      const message = screen.getByText((_, element) => {
        return (
          element?.textContent ===
          `Please enter the confirmation code that was sent to ${testUser.email} within 5 minutes.`
        );
      });
      expect(message).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("calls the functions to navigate to update email page with token param", async () => {
      const { user } = setup(path);

      const code = "code";
      const codeInput = screen.getByLabelText("Code", { selector: "input" });
      await user.type(codeInput, code);
      const enterCodeButton = screen.getByRole("button", {
        name: "Enter Code",
      });
      await user.click(enterCodeButton);

      const updateCode = await screen.findByText(
        `You can change your email thanks to this code: ${code}`
      );
      expect(updateCode).toBeInTheDocument();
      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });

    it("does not allow the user to submit when the code field is empty", async () => {
      const { user } = setup(path);

      const enterCodeButton = screen.getByRole("button", {
        name: "Enter Code",
      });
      await user.click(enterCodeButton);

      expect(mockToggleModal).not.toHaveBeenCalled();
    });

    it("works when user closes the modal using cancel button", async () => {
      const { user } = setup("updatePassword");

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });

    it("works when user closes the modal using x button", async () => {
      const { user } = setup(path);

      const modalContainerCloseButton = screen.getByRole("button", {
        name: "Cancel",
      });
      await user.click(modalContainerCloseButton);

      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });
  });

  describe("updatePassword", () => {
    const path = "password";

    it("shows form", async () => {
      const { asFragment } = setup(path);

      const message = screen.getByText((_, element) => {
        return (
          element?.textContent ===
          `Please enter the confirmation code that was sent to ${testUser.email} within 5 minutes.`
        );
      });
      expect(message).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("calls the functions to navigate to update password page with token param", async () => {
      const { user } = setup(path);

      const code = "code";
      const codeInput = screen.getByLabelText("Code", { selector: "input" });
      await user.type(codeInput, code);
      const enterCodeButton = screen.getByRole("button", {
        name: "Enter Code",
      });
      await user.click(enterCodeButton);

      const updateCode = await screen.findByText(
        `You can change your password thanks to this code: ${code}`
      );
      expect(updateCode).toBeInTheDocument();
      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });

    it("does not allow the user to submit when the code field is empty", async () => {
      const { user } = setup(path);

      const enterCodeButton = screen.getByRole("button", {
        name: "Enter Code",
      });
      await user.click(enterCodeButton);

      expect(mockToggleModal).not.toHaveBeenCalled();
    });

    it("works when user closes the modal using cancel button", async () => {
      const { user } = setup("updatePassword");

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });

    it("works when user closes the modal using x button", async () => {
      const { user } = setup(path);

      const modalContainerCloseButton = screen.getByRole("button", {
        name: "Cancel",
      });
      await user.click(modalContainerCloseButton);

      expect(mockToggleModal).toHaveBeenCalledTimes(1);
      expect(mockToggleModal).toHaveBeenCalledWith();
    });
  });
});
