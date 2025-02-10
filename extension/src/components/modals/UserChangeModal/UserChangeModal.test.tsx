import { createRoutesStub, Outlet, useParams } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

import { UserChangeModal } from "./UserChangeModal";
import { Mock } from "vitest";
import { TOKEN_MAX_BYTES } from "common";

vi.mock("../ModalContainer/ModalContainer");

describe("UserChangeModal", () => {
  const testUser = {
    email: "bob@email.com",
    id: "1",
  };

  function setup({ toggleModal }: { toggleModal: Mock }) {
    const queryClient = new QueryClient();
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <Outlet context={{ user: testUser }} />;
        },
        children: [
          {
            path: "/settings",
            Component: function () {
              return (
                <QueryClientProvider client={queryClient}>
                  <UserChangeModal toggleModal={toggleModal} />
                </QueryClientProvider>
              );
            },
          },
          {
            path: "/settings/:token",
            Component: function () {
              const { token } = useParams();
              return <div data-testid="settings-token">{token}</div>;
            },
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

  it("shows form", async () => {
    const mockToggleModal = vi.fn();
    const { asFragment } = setup({ toggleModal: mockToggleModal });

    const message = screen.getByText((_, element) => {
      return (
        element?.textContent ===
        `Please enter the confirmation code that was sent to ${testUser.email} within 5 minutes.`
      );
    });
    expect(message).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the functions to submit code", async () => {
    const mockToggleModal = vi.fn();
    const { user } = setup({ toggleModal: mockToggleModal });

    const codeInput = screen.getByLabelText("Code", { selector: "input" });
    const enterCodeButton = screen.getByRole("button", {
      name: "Enter Code",
    });
    await user.type(codeInput, "code");
    await user.click(enterCodeButton);

    const settingsToken = await screen.findByTestId("settings-token");
    expect(settingsToken).toBeInTheDocument();
    expect(settingsToken).toHaveTextContent("code");
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
  });

  it("does not allow the user to submit when the code field is empty", async () => {
    const mockToggleModal = vi.fn();
    const { user } = setup({ toggleModal: mockToggleModal });

    const enterCodeButton = screen.getByRole("button", {
      name: "Enter Code",
    });
    await user.click(enterCodeButton);

    expect(mockToggleModal).not.toHaveBeenCalled();
  });

  it(`does not allow the user to enter a code larger than ${TOKEN_MAX_BYTES}`, async () => {
    const mockToggleModal = vi.fn();
    const { user } = setup({ toggleModal: mockToggleModal });

    const codeInput = screen.getByLabelText("Code", { selector: "input" });
    const enterCodeButton = screen.getByRole("button", {
      name: "Enter Code",
    });
    const code = new Array(TOKEN_MAX_BYTES + 1).fill("a").join("");
    await user.type(codeInput, code);
    await user.click(enterCodeButton);

    const settingsToken = await screen.findByTestId("settings-token");
    expect(settingsToken).toBeInTheDocument();
    expect(settingsToken).toHaveTextContent(code.slice(0, -1));
    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
  });

  it("works when user closes the modal using x button", async () => {
    const mockToggleModal = vi.fn();
    const { user } = setup({ toggleModal: mockToggleModal });

    const modalContainerCloseButton = screen.getByRole("button", {
      name: "Close modal",
    });
    await user.click(modalContainerCloseButton);

    expect(mockToggleModal).toHaveBeenCalledTimes(1);
    expect(mockToggleModal).toHaveBeenCalledWith();
  });
});
