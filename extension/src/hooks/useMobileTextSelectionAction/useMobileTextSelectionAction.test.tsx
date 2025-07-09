import { createRoutesStub, Outlet, useParams } from "react-router-dom";
import { userWordService } from "../../services/user_word_service";
import { useMobileTextSelectionAction } from "./useMobileTextSelectionAction";
import * as CapacitorCore from "@capacitor/core";
import { NotificationProvider } from "../../context/Notification";
import { render, screen, waitFor } from "@testing-library/react";

describe("useMobileTextSelectionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userWordId = "1";
  const userId = "1";

  function TestComponent() {
    useMobileTextSelectionAction(userId);

    return <div data-testid="home"></div>;
  }

  function setup() {
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
            Component: TestComponent,
          },
          {
            path: "/userWords/:userWordId",
            Component: function () {
              const { userWordId } = useParams();
              return <div data-testid={`userWordId-${userWordId}`}></div>;
            },
          },
        ],
      },
    ]);

    return render(<Stub initialEntries={["/"]} />);
  }

  it("does not run on non-android environments", async () => {
    const mockGetPlatform = vi
      .spyOn(CapacitorCore.Capacitor, "getPlatform")
      .mockReturnValue("web");
    const selectionText = undefined;
    const mockGetSelectionText = vi.fn().mockResolvedValue({ selectionText });
    const mockRegisterPlugin = vi
      .spyOn(CapacitorCore, "registerPlugin")
      .mockReturnValue({
        getSelectionText: mockGetSelectionText,
      });
    const mockCreateUserWord = vi
      .spyOn(userWordService, "createUserWord")
      .mockResolvedValue({
        json: {
          userWord: {
            id: userWordId,
          },
        },
        status: 200,
      });

    setup();

    await waitFor(() => {
      const notification = screen.queryByRole("dialog");
      const home = screen.getByTestId("home");
      expect(mockGetPlatform).toHaveBeenCalledTimes(1);
      expect(mockGetPlatform).toHaveBeenCalledWith();
      expect(mockRegisterPlugin).not.toHaveBeenCalled();
      expect(mockGetSelectionText).not.toHaveBeenCalled();
      expect(mockCreateUserWord).not.toHaveBeenCalled();
      expect(notification).not.toBeInTheDocument();
      expect(home).toBeInTheDocument();
    });
  });

  it("creates user word using selection text and navigates to the user word's page", async () => {
    const mockGetPlatform = vi
      .spyOn(CapacitorCore.Capacitor, "getPlatform")
      .mockReturnValue("android");
    const selectionText = "word";
    const formData = new FormData();
    formData.append("word", selectionText);
    const mockGetSelectionText = vi.fn().mockResolvedValue({ selectionText });
    const mockRegisterPlugin = vi
      .spyOn(CapacitorCore, "registerPlugin")
      .mockReturnValue({
        getSelectionText: mockGetSelectionText,
      });
    const mockCreateUserWord = vi
      .spyOn(userWordService, "createUserWord")
      .mockResolvedValue({
        json: {
          userWord: {
            id: userWordId,
          },
        },
        status: 200,
      });

    setup();

    await waitFor(() => {
      const userWord = screen.getByTestId(`userWordId-${userWordId}`);
      expect(userWord).toBeInTheDocument();
      expect(mockGetPlatform).toHaveBeenCalledTimes(1);
      expect(mockGetPlatform).toHaveBeenCalledWith();
      expect(mockRegisterPlugin).toHaveBeenCalledTimes(1);
      expect(mockRegisterPlugin).toHaveBeenCalledWith("TextSelectionAction");
      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({ userId, formData });
    });
  });

  it("renders notification error when there is an error creating a user word", async () => {
    const errorMessage = "Error creating user word";
    const mockGetPlatform = vi
      .spyOn(CapacitorCore.Capacitor, "getPlatform")
      .mockReturnValue("android");
    const selectionText = "word";
    const formData = new FormData();
    formData.append("word", selectionText);
    const mockGetSelectionText = vi.fn().mockResolvedValue({ selectionText });
    const mockRegisterPlugin = vi
      .spyOn(CapacitorCore, "registerPlugin")
      .mockReturnValue({
        getSelectionText: mockGetSelectionText,
      });
    const mockCreateUserWord = vi
      .spyOn(userWordService, "createUserWord")
      .mockImplementation(() => {
        return Promise.reject({
          json: { message: errorMessage },
          status: 400,
        });
      });

    setup();

    await waitFor(() => {
      const notification = screen.getByRole("dialog", {
        name: errorMessage,
      });
      const home = screen.getByTestId("home");
      expect(notification).toBeInTheDocument();
      expect(home).toBeInTheDocument();
      expect(mockGetPlatform).toHaveBeenCalledTimes(1);
      expect(mockGetPlatform).toHaveBeenCalledWith();
      expect(mockRegisterPlugin).toHaveBeenCalledTimes(1);
      expect(mockRegisterPlugin).toHaveBeenCalledWith("TextSelectionAction");
      expect(mockGetSelectionText).toHaveBeenCalledTimes(1);
      expect(mockGetSelectionText).toHaveBeenCalledWith();
      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({ userId, formData });
    });
  });

  it("does not create a user word if no text is selected", async () => {
    const mockGetPlatform = vi
      .spyOn(CapacitorCore.Capacitor, "getPlatform")
      .mockReturnValue("android");
    const selectionText = undefined;
    const mockGetSelectionText = vi.fn().mockResolvedValue({ selectionText });
    const mockRegisterPlugin = vi
      .spyOn(CapacitorCore, "registerPlugin")
      .mockReturnValue({
        getSelectionText: mockGetSelectionText,
      });
    const mockCreateUserWord = vi
      .spyOn(userWordService, "createUserWord")
      .mockRejectedValue({
        json: {
          userWord: {
            id: userWordId,
          },
        },
        status: 200,
      });

    setup();

    await waitFor(() => {
      const notification = screen.queryByRole("dialog");
      const home = screen.getByTestId("home");
      expect(notification).not.toBeInTheDocument();
      expect(home).toBeInTheDocument();
      expect(mockGetPlatform).toHaveBeenCalledTimes(1);
      expect(mockGetPlatform).toHaveBeenCalledWith();
      expect(mockRegisterPlugin).toHaveBeenCalledTimes(1);
      expect(mockRegisterPlugin).toHaveBeenCalledWith("TextSelectionAction");
      expect(mockGetSelectionText).toHaveBeenCalledTimes(1);
      expect(mockGetSelectionText).toHaveBeenCalledWith();
      expect(mockCreateUserWord).not.toHaveBeenCalled();
    });
  });
});
