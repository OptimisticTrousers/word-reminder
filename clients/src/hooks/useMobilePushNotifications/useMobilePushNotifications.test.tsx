/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from "@testing-library/react";
import {
  useMobilePushNotificationListeners,
  useMobilePushNotificationRegistration,
} from "./useMobilePushNotifications";
import { NotificationProvider } from "../../context/Notification";
import { PushNotifications } from "@capacitor/push-notifications";
import { fcmTokenService } from "../../services/fcm_token_service";
import { Capacitor } from "@capacitor/core";
import { createRoutesStub, Outlet } from "react-router-dom";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";

vi.mock("@capacitor/push-notifications", () => {
  return {
    PushNotifications: {
      register: vi.fn(),
      checkPermissions: vi.fn(),
      requestPermissions: vi.fn(),
      addListener: vi.fn(),
      removeAllListeners: vi.fn(),
    },
  };
});

vi.mock("@capacitor/core", () => {
  return {
    Capacitor: {
      getPlatform: vi.fn(),
    },
  };
});

describe("useMobilePushNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "1";
  const wordReminderId = "1";
  const token = { value: "adkdwnakj21n12j" };
  const error = {
    error: "Error message",
  };
  const notification = {
    data: {
      wordReminderId,
    },
  };

  function setup(Component: () => ReactNode) {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return (
            <NotificationProvider>
              <Outlet />
            </NotificationProvider>
          );
        },
        children: [
          {
            path: "/",
            Component,
          },
          {
            path: `/wordReminders/${wordReminderId}`,
            Component: function () {
              return (
                <div data-testid={`wordReminderId-${wordReminderId}`}></div>
              );
            },
          },
        ],
      },
    ]);

    return render(<Stub initialEntries={["/"]} />);
  }

  describe("useMobilePushNotificationRegistration", () => {
    function TestRegistrationComponent() {
      const { register } = useMobilePushNotificationRegistration(userId);

      return <button onClick={register}>Register</button>;
    }

    it("does not register if the platform is web", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("web");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockImplementation(vi.fn());
      const mockRequestPermissions = vi
        .spyOn(PushNotifications, "requestPermissions")
        .mockImplementation(vi.fn());
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementation(vi.fn());
      const user = userEvent.setup();
      setup(TestRegistrationComponent);

      const registerButtton = screen.getByRole("button", { name: "Register" });
      await user.click(registerButtton);

      await waitFor(() => {
        const notification = screen.queryByRole("dialog", {
          name: "Push Notification permission denied.",
        });
        const wordReminder = screen.queryByTestId(
          `wordReminderId-${wordReminderId}`
        );
        expect(wordReminder).not.toBeInTheDocument();
        expect(notification).not.toBeInTheDocument();
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).not.toHaveBeenCalled();
        expect(mockRequestPermissions).not.toHaveBeenCalled();
        expect(mockRegister).not.toHaveBeenCalled();
        expect(mockAddListener).not.toHaveBeenCalled();
      });
    });

    it("does not request permissions if permissions are already granted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRequestPermissions = vi
        .spyOn(PushNotifications, "requestPermissions")
        .mockImplementation(vi.fn());
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementation(vi.fn());
      const user = userEvent.setup();
      setup(TestRegistrationComponent);

      const registerButtton = screen.getByRole("button", { name: "Register" });
      await user.click(registerButtton);

      await waitFor(() => {
        const notification = screen.queryByRole("dialog", {
          name: "Push Notification permission denied.",
        });
        const wordReminder = screen.queryByTestId(
          `wordReminderId-${wordReminderId}`
        );
        expect(wordReminder).not.toBeInTheDocument();
        expect(notification).not.toBeInTheDocument();
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRequestPermissions).not.toHaveBeenCalled();
        expect(mockRegister).not.toHaveBeenCalled();
        expect(mockAddListener).not.toHaveBeenCalled();
      });
    });

    it("renders error notification if permission requests are denied", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "denied" });
      const mockRequestPermissions = vi
        .spyOn(PushNotifications, "requestPermissions")
        .mockResolvedValue({ receive: "denied" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementation(vi.fn());
      const user = userEvent.setup();
      setup(TestRegistrationComponent);

      const registerButtton = screen.getByRole("button", { name: "Register" });
      await user.click(registerButtton);

      await waitFor(() => {
        const notification = screen.getByRole("dialog", {
          name: "Push Notification permission denied.",
        });
        const wordReminder = screen.queryByTestId(
          `wordReminderId-${wordReminderId}`
        );
        expect(wordReminder).not.toBeInTheDocument();
        expect(notification).toBeInTheDocument();
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
        expect(mockRequestPermissions).toHaveBeenCalledWith();
        expect(mockRegister).not.toHaveBeenCalled();
        expect(mockAddListener).not.toHaveBeenCalled();
      });
    });

    it("calls the functions to register and call the registration listener if permission requests are granted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "denied" });
      const mockRequestPermissions = vi
        .spyOn(PushNotifications, "requestPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockCreateFCMToken = vi
        .spyOn(fcmTokenService, "createFCMToken")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementationOnce(async (_eventName, callback: any) => {
          callback(token);
          return { remove: vi.fn() };
        });
      mockAddListener.mockImplementationOnce(vi.fn());
      mockAddListener.mockImplementationOnce(vi.fn());
      const user = userEvent.setup();
      setup(TestRegistrationComponent);

      const registerButtton = screen.getByRole("button", { name: "Register" });
      await user.click(registerButtton);

      await waitFor(() => {
        const notification = screen.queryByRole("dialog", {
          name: "Push Notification permission denied.",
        });
        const wordReminder = screen.queryByTestId(
          `wordReminderId-${wordReminderId}`
        );
        expect(wordReminder).not.toBeInTheDocument();
        expect(notification).not.toBeInTheDocument();
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
        expect(mockRequestPermissions).toHaveBeenCalledWith();
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(mockRegister).toHaveBeenCalledWith();
        expect(mockAddListener).toHaveBeenCalledTimes(3);
        expect(mockAddListener).toHaveBeenCalledWith(
          "registration",
          expect.any(Function)
        );
        expect(mockCreateFCMToken).toHaveBeenCalledTimes(1);
        expect(mockCreateFCMToken).toHaveBeenCalledWith({ token, userId });
      });
    });

    it("calls the functions to register and call the registrationError listener when permissions are granted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "denied" });
      const mockRequestPermissions = vi
        .spyOn(PushNotifications, "requestPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockCreateFCMToken = vi
        .spyOn(fcmTokenService, "createFCMToken")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementationOnce(vi.fn());
      mockAddListener.mockImplementationOnce(
        async (_eventName, callback: any) => {
          callback(error);
          return { remove: vi.fn() };
        }
      );
      mockAddListener.mockImplementationOnce(vi.fn());
      const user = userEvent.setup();
      setup(TestRegistrationComponent);

      const registerButtton = screen.getByRole("button", { name: "Register" });
      await user.click(registerButtton);

      await waitFor(() => {
        const notification = screen.getByRole("dialog", {
          name: error.error,
        });
        const wordReminder = screen.queryByTestId(
          `wordReminderId-${wordReminderId}`
        );
        expect(wordReminder).not.toBeInTheDocument();
        expect(notification).toBeInTheDocument();
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
        expect(mockRequestPermissions).toHaveBeenCalledWith();
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(mockRegister).toHaveBeenCalledWith();
        expect(mockAddListener).toHaveBeenCalledTimes(3);
        expect(mockAddListener).toHaveBeenCalledWith(
          "registration",
          expect.any(Function)
        );
        expect(mockCreateFCMToken).not.toHaveBeenCalled();
      });
    });

    it("calls the functions to register and call the pushNotificationActionPerformed listener when permissions are granted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "denied" });
      const mockRequestPermissions = vi
        .spyOn(PushNotifications, "requestPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockCreateFCMToken = vi
        .spyOn(fcmTokenService, "createFCMToken")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementationOnce(vi.fn());
      mockAddListener.mockImplementationOnce(vi.fn());
      mockAddListener.mockImplementationOnce(
        async (_eventName, callback: any) => {
          callback({ notification });
          return { remove: vi.fn() };
        }
      );
      const user = userEvent.setup();
      setup(TestRegistrationComponent);

      const registerButtton = screen.getByRole("button", { name: "Register" });
      await user.click(registerButtton);

      await waitFor(() => {
        const notification = screen.queryByRole("dialog", {
          name: "Push Notification permission denied.",
        });
        const wordReminder = screen.getByTestId(
          `wordReminderId-${wordReminderId}`
        );
        expect(notification).not.toBeInTheDocument();
        expect(wordReminder).toBeInTheDocument();
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
        expect(mockRequestPermissions).toHaveBeenCalledWith();
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(mockRegister).toHaveBeenCalledWith();
        expect(mockAddListener).toHaveBeenCalledTimes(3);
        expect(mockAddListener).toHaveBeenCalledWith(
          "registration",
          expect.any(Function)
        );
        expect(mockCreateFCMToken).not.toHaveBeenCalled();
      });
    });
  });

  describe("useMobilePushNotificationListeners", () => {
    function TestListenerComponent() {
      useMobilePushNotificationListeners(userId);
      return <div></div>;
    }

    it("does not do anything if on web", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("web");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementation(vi.fn());

      setup(TestListenerComponent);

      await waitFor(() => {
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).not.toHaveBeenCalled();
        expect(mockRegister).not.toHaveBeenCalled();
        expect(mockAddListener).not.toHaveBeenCalled();
      });
    });

    it("calls the functions to register when permissions are granted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());

      setup(TestListenerComponent);

      await waitFor(() => {
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(mockRegister).toHaveBeenCalledWith();
      });
    });

    it("calls the functions to remove all listeners when unmounted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockResolvedValue();
      const mockRemoveAllListeners = vi
        .spyOn(PushNotifications, "removeAllListeners")
        .mockResolvedValue();

      const { unmount } = setup(TestListenerComponent);
      unmount();

      await waitFor(() => {
        expect(mockGetPlatform).toHaveBeenCalledTimes(2);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(mockRegister).toHaveBeenCalledWith();
        expect(mockRemoveAllListeners).toHaveBeenCalledTimes(1);
        expect(mockRemoveAllListeners).toHaveBeenCalledWith();
      });
    });

    it("calls the functions to register and call the registration listener when permissions are granted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockCreateFCMToken = vi
        .spyOn(fcmTokenService, "createFCMToken")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementationOnce(async (_eventName, callback: any) => {
          callback(token);
          return { remove: vi.fn() };
        });
      mockAddListener.mockImplementationOnce(vi.fn());
      mockAddListener.mockImplementationOnce(vi.fn());

      setup(TestListenerComponent);

      await waitFor(() => {
        expect(mockGetPlatform).toHaveBeenCalledTimes(1);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(mockRegister).toHaveBeenCalledWith();
        expect(mockAddListener).toHaveBeenCalledTimes(3);
        expect(mockAddListener).toHaveBeenCalledWith(
          "registration",
          expect.any(Function)
        );
        expect(mockCreateFCMToken).toHaveBeenCalledTimes(1);
        expect(mockCreateFCMToken).toHaveBeenCalledWith({ token, userId });
      });
    });

    it("calls the functions to register and call the registrationError listener when permissions are granted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockCreateFCMToken = vi
        .spyOn(fcmTokenService, "createFCMToken")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementationOnce(vi.fn());
      mockAddListener.mockImplementationOnce(
        async (_eventName, callback: any) => {
          callback(error);
          return { remove: vi.fn() };
        }
      );
      mockAddListener.mockImplementationOnce(vi.fn());

      setup(TestListenerComponent);

      await waitFor(() => {
        const notification = screen.getByRole("dialog", { name: error.error });
        const wordReminder = screen.queryByTestId(
          `wordReminderId-${wordReminderId}`
        );
        expect(wordReminder).not.toBeInTheDocument();
        expect(notification).toBeInTheDocument();
        expect(mockGetPlatform).toHaveBeenCalledTimes(3);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(2);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRegister).toHaveBeenCalledTimes(2);
        expect(mockRegister).toHaveBeenCalledWith();
        expect(mockAddListener).toHaveBeenCalledTimes(6);
        expect(mockAddListener).toHaveBeenCalledWith(
          "registration",
          expect.any(Function)
        );
        expect(mockCreateFCMToken).not.toHaveBeenCalled();
      });
    });

    it("calls the functions to register and call the pushNotificationActionPerformed listener when permissions are granted", async () => {
      const mockGetPlatform = vi
        .spyOn(Capacitor, "getPlatform")
        .mockReturnValue("android");
      const mockCheckPermissions = vi
        .spyOn(PushNotifications, "checkPermissions")
        .mockResolvedValue({ receive: "granted" });
      const mockRegister = vi
        .spyOn(PushNotifications, "register")
        .mockImplementation(vi.fn());
      const mockCreateFCMToken = vi
        .spyOn(fcmTokenService, "createFCMToken")
        .mockImplementation(vi.fn());
      const mockAddListener = vi
        .spyOn(PushNotifications, "addListener")
        .mockImplementationOnce(vi.fn());
      mockAddListener.mockImplementationOnce(vi.fn());
      mockAddListener.mockImplementationOnce(
        async (_eventName, callback: any) => {
          callback({ notification });
          return { remove: vi.fn() };
        }
      );

      setup(TestListenerComponent);

      await waitFor(() => {
        const wordReminder = screen.getByTestId(
          `wordReminderId-${wordReminderId}`
        );
        const notification = screen.queryByRole("dialog", {
          name: error.error,
        });
        expect(notification).not.toBeInTheDocument();
        expect(wordReminder).toBeInTheDocument();
        expect(mockGetPlatform).toHaveBeenCalledTimes(2);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        expect(mockCheckPermissions).toHaveBeenCalledWith();
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(mockRegister).toHaveBeenCalledWith();
        expect(mockAddListener).toHaveBeenCalledTimes(3);
        expect(mockAddListener).toHaveBeenCalledWith(
          "registration",
          expect.any(Function)
        );
        expect(mockCreateFCMToken).not.toHaveBeenCalled();
      });
    });
  });
});
