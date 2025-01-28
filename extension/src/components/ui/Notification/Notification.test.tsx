import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { Notification } from "./Notification";

describe("Notification component", () => {
  it("renders notification with success class", async () => {
    const mockDismissNotification = vi.fn();
    const props = {
      type: NOTIFICATION_ACTIONS.SUCCESS,
      message: "Success Message.",
      dismissNotification: mockDismissNotification,
    };
    const user = userEvent.setup();

    const { asFragment } = render(
      <NotificationContext.Provider
        value={{
          dismissNotification: mockDismissNotification,
          showNotification: vi.fn(),
        }}
      >
        <Notification {...props} />
      </NotificationContext.Provider>
    );
    const dismissButton = screen.getByRole("button", { name: "Dismiss" });
    await user.click(dismissButton);

    const notification = screen.getByRole("dialog");
    const message = screen.getByText(props.message);
    expect(mockDismissNotification).toHaveBeenCalledTimes(1);
    expect(mockDismissNotification).toHaveBeenCalledWith();
    expect(message).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
    expect(notification.getAttribute("class")).toContain(
      `notification--${NOTIFICATION_ACTIONS.SUCCESS}`
    );
  });

  it("renders notification with error class", async () => {
    const mockDismissNotification = vi.fn();
    const props = {
      type: NOTIFICATION_ACTIONS.ERROR,
      message: "Error Message.",
      dismissNotification: mockDismissNotification,
    };
    const user = userEvent.setup();

    const { asFragment } = render(
      <NotificationContext.Provider
        value={{
          dismissNotification: mockDismissNotification,
          showNotification: vi.fn(),
        }}
      >
        <Notification {...props} />
      </NotificationContext.Provider>
    );
    const dismissButton = screen.getByRole("button", { name: "Dismiss" });
    await user.click(dismissButton);

    const notification = screen.getByRole("dialog");
    const message = screen.getByText(props.message);
    expect(mockDismissNotification).toHaveBeenCalledTimes(1);
    expect(mockDismissNotification).toHaveBeenCalledWith();
    expect(message).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
    expect(notification.getAttribute("class")).toContain(
      `notification--${NOTIFICATION_ACTIONS.ERROR}`
    );
  });
});
