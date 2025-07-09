import { useContext } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NOTIFICATION_ACTIONS, NotificationContext } from "./Context";
import { NotificationProvider } from "./Provider";
import { ErrorBoundary } from "../../components/ErrorBoundary";

vi.mock("../../components/ErrorBoundary/ErrorBoundary");

describe("NotificationProvider component", () => {
  function TestComponent() {
    const { showNotification, dismissNotification } =
      useContext(NotificationContext);

    function handleShowNotification() {
      showNotification(NOTIFICATION_ACTIONS.SUCCESS, "Message.");
    }

    function handleDismissNotification() {
      dismissNotification();
    }

    return (
      <div>
        <button onClick={handleShowNotification}>Show Notification</button>
        <button onClick={handleDismissNotification}>
          Dismiss Notification
        </button>
      </div>
    );
  }

  it("calls the function to show the notification", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    const user = userEvent.setup();

    const showNotificationButton = screen.getByRole("button", {
      name: "Show Notification",
    });
    await user.click(showNotificationButton);
    const notification = screen.getByRole("dialog");
    expect(notification).toBeInTheDocument();
  });

  it("throws an error when the notification type is invalid", async () => {
    function TestComponent() {
      const { showNotification, dismissNotification } =
        useContext(NotificationContext);

      function handleShowNotification() {
        showNotification("invalid-type", "Message.");
      }

      function handleDismissNotification() {
        dismissNotification();
      }

      return (
        <div>
          <button onClick={handleShowNotification}>Show Notification</button>
          <button onClick={handleDismissNotification}>
            Dismiss Notification
          </button>
        </div>
      );
    }
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      </ErrorBoundary>
    );

    const showNotificationButton = screen.getByRole("button", {
      name: "Show Notification",
    });
    await user.click(showNotificationButton);
    const errorBoundary = screen.getByTestId("error-boundary");
    expect(errorBoundary).toBeInTheDocument();
  });

  it("calls the function to dismiss the notification", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    const user = userEvent.setup();

    const showNotificationButton = screen.getByRole("button", {
      name: "Show Notification",
    });
    await user.click(showNotificationButton);
    const dismissNotificationButton = screen.getByRole("button", {
      name: "Dismiss Notification",
    });
    await user.click(dismissNotificationButton);
    const notification = screen.queryByRole("dialog");
    expect(notification).not.toBeInTheDocument();
  });

  it("calls the function to dismiss the notification after 5 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    const user = userEvent.setup();

    const showNotificationButton = screen.getByRole("button", {
      name: "Show Notification",
    });
    await user.click(showNotificationButton);
    act(() => {
      vi.runAllTimers();
    });
    const notification = screen.queryByRole("dialog");
    expect(notification).not.toBeInTheDocument();
  });
});
