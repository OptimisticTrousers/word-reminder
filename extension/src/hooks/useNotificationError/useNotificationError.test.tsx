import { createRoutesStub, MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotificationProvider } from "../../context/Notification";
import { useNotificationError } from "./useNotificationError";
import { ErrorResponse } from "../../types";

function Login() {
  return <div data-testid="login"></div>;
}

describe("useNotificationError", () => {
  describe("showNotificationError", () => {
    it("shows credentials expired notification and navigates to the login page", async () => {
      const fakeResponse: ErrorResponse = {
        json: { message: "User is unauthenticated." },
        status: 401,
      };
      function TestComponent() {
        const { showNotificationError } = useNotificationError();

        function handleClick() {
          showNotificationError(fakeResponse);
        }
        return <button onClick={handleClick}>Show Notification</button>;
      }
      const user = userEvent.setup();
      const Stub = createRoutesStub([
        {
          path: "/login",
          Component: Login,
        },
        {
          path: "/",
          Component: TestComponent,
        },
      ]);
      render(
        <NotificationProvider>
          <Stub initialEntries={["/"]} />
        </NotificationProvider>
      );

      const showNotificationButton = screen.getByRole("button", {
        name: "Show Notification",
      });
      await user.click(showNotificationButton);

      const login = screen.getByTestId("login");
      const notification = screen.getByRole("dialog", {
        name: "Your credentials have expired. Please log in again.",
      });
      expect(notification).toBeInTheDocument();
      expect(login).toBeInTheDocument();
    });

    it("shows invalid credentials notification when the email is incorrect and navigates to the login page", async () => {
      const fakeResponse: ErrorResponse = {
        json: { message: "Incorrect email." },
        status: 401,
      };
      function TestComponent() {
        const { showNotificationError } = useNotificationError();

        function handleClick() {
          showNotificationError(fakeResponse);
        }
        return <button onClick={handleClick}>Show Notification</button>;
      }
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </MemoryRouter>
      );

      const showNotificationButton = screen.getByRole("button", {
        name: "Show Notification",
      });
      await user.click(showNotificationButton);

      const notification = screen.getByRole("dialog", {
        name: "Your credentials are incorrect. Please log in again.",
      });
      expect(notification).toBeInTheDocument();
    });

    it("shows invalid credentials notification when the password is incorrect and navigates to the login page", async () => {
      const fakeResponse: ErrorResponse = {
        json: { message: "Incorrect password." },
        status: 401,
      };
      function TestComponent() {
        const { showNotificationError } = useNotificationError();

        function handleClick() {
          showNotificationError(fakeResponse);
        }
        return <button onClick={handleClick}>Show Notification</button>;
      }
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </MemoryRouter>
      );

      const showNotificationButton = screen.getByRole("button", {
        name: "Show Notification",
      });
      await user.click(showNotificationButton);

      const notification = screen.getByRole("dialog", {
        name: "Your credentials are incorrect. Please log in again.",
      });
      expect(notification).toBeInTheDocument();
    });

    it("shows custom message notification", async () => {
      const fakeResponse: ErrorResponse = {
        json: { message: "Bad Request." },
        status: 400,
      };
      function TestComponent() {
        const { showNotificationError } = useNotificationError();

        function handleClick() {
          showNotificationError(fakeResponse);
        }
        return <button onClick={handleClick}>Show Notification</button>;
      }
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </MemoryRouter>
      );

      const showNotificationButton = screen.getByRole("button", {
        name: "Show Notification",
      });
      await user.click(showNotificationButton);

      const notification = screen.getByRole("dialog", {
        name: fakeResponse.json.message,
      });
      expect(notification).toBeInTheDocument();
    });
  });
});
