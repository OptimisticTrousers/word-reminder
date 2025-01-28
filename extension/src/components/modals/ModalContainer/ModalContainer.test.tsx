import { render, screen } from "@testing-library/react";
import { ModalContainer } from "./ModalContainer";
import userEvent from "@testing-library/user-event";

import * as hooks from "../../../hooks/useDisableScroll";

describe("ModalContainer", () => {
  it("renders modal with text", () => {
    const mockToggleModal = vi.fn();
    const props = {
      title: "Title",
      toggleModal: mockToggleModal,
    };
    const mockUseDisableScroll = vi.spyOn(hooks, "useDisableScroll");

    const { asFragment } = render(
      <ModalContainer {...props}>
        <div></div>
      </ModalContainer>
    );

    const notification = screen.getByRole("dialog", { name: props.title });
    expect(notification).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
    expect(mockUseDisableScroll).toHaveBeenCalledTimes(1);
    expect(mockUseDisableScroll).toHaveBeenCalledWith();
  });

  it("calls toggleModal function when button is clicked", async () => {
    const mockToggleModal = vi.fn();
    const props = {
      title: "Title",
      toggleModal: mockToggleModal,
    };
    render(
      <ModalContainer {...props}>
        <div></div>
      </ModalContainer>
    );
    const user = userEvent.setup();

    const button = screen.getByRole("button", { name: "Close modal" });
    await user.click(button);

    expect(props.toggleModal).toHaveBeenCalledTimes(1);
    expect(props.toggleModal).toHaveBeenCalledWith();
  });
});
