import { useContextMenu } from "./useContextMenu";
import { render, screen } from "@testing-library/react";
import * as hooks from "../../hooks/useChromeStorageSync";
import { createRoutesStub, useParams } from "react-router-dom";
import { userWordService } from "../../services/user_word_service";

describe("useContextMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const key = "userId";
  const userId = "1";
  const id = "84";

  const json = [
    {
      id: 1,
      details: [
        {
          word: "word",
        },
      ],
    },
  ];

  const userWord1 = {
    id: 1,
    user_id: "1",
    word_id: json[0].id,
    details: json[0].details,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const status = 200;

  function setup() {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: TestComponent,
      },
      {
        path: "/userWords/:userWordId",
        Component: function () {
          const { userWordId } = useParams();
          return <div data-testid={`user-word-${userWordId}`}>ok</div>;
        },
      },
    ]);

    function TestComponent() {
      useContextMenu(userId);

      return <div></div>;
    }

    return {
      ...render(<Stub initialEntries={["/"]} />),
    };
  }

  describe("onInstalled event", () => {
    it("creates the context menu on mount", async () => {
      const mockUseChromeStorageSync = vi
        .spyOn(hooks, "useChromeStorageSync")
        .mockReturnValue([userId, function () {}]);
      const mockCreate = vi.spyOn(chrome.contextMenus, "create");

      setup();

      expect(mockUseChromeStorageSync).toHaveBeenCalledTimes(1);
      expect(mockUseChromeStorageSync).toHaveBeenCalledWith("userId", userId);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        id,
        title: "Add Word",
        contexts: ["selection"],
        type: "normal",
        enabled: true,
        visible: true,
      });
    });

    it("removes the context menu on unmount", async () => {
      const mockAddListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "addListener"
      );
      const mockRemoveListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "removeListener"
      );
      const mockRemove = vi.spyOn(chrome.contextMenus, "remove");
      const { unmount } = setup();

      unmount();

      expect(mockRemoveListener).toHaveBeenCalledTimes(1);
      expect(mockRemoveListener).toHaveBeenCalledWith(
        mockAddListener.mock.calls[0][0] // make sure that the remove listener is called with the same callback as the add listener
      );
      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith(id);
    });
  });

  describe("onClicked event", async () => {
    it("opens popup extension window and creates a user word", async () => {
      const mockCreateUserWord = vi
        .spyOn(userWordService, "createUserWord")
        .mockImplementation(async () => {
          return {
            json: { userWord: { ...userWord1, word: json[0] } },
            status,
          };
        });
      const selectionText = "jones";
      const mockAddListener = vi
        .spyOn(chrome.contextMenus.onClicked, "addListener")
        .mockImplementation((callback) => {
          const item = { selectionText } as chrome.contextMenus.OnClickData;
          callback(item);
        });
      const mockUseChromeStorageSync = vi
        .spyOn(hooks, "useChromeStorageSync")
        .mockReturnValue([userId, function () {}]);
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");
      const formData = new FormData();
      formData.append("word", selectionText);

      setup();

      const userWord = await screen.findByTestId(`user-word-${userWord1.id}`);
      expect(userWord).toBeInTheDocument();
      expect(mockAddListener).toHaveBeenCalledTimes(1);
      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));
      expect(mockUseChromeStorageSync).toHaveBeenCalledTimes(1);
      expect(mockUseChromeStorageSync).toHaveBeenCalledWith(key, userId);
      expect(mockCreateUserWord).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWord).toHaveBeenCalledWith({ userId, formData });
      expect(mockOpenPopup).toHaveBeenCalledTimes(1);
      expect(mockOpenPopup).toHaveBeenCalledWith();
    });

    it("removes onclicked listener on unmount", async () => {
      const selectionText = "jones";
      const mockAddListener = vi
        .spyOn(chrome.contextMenus.onClicked, "addListener")
        .mockImplementation((callback) => {
          const item = { selectionText } as chrome.contextMenus.OnClickData;
          callback(item);
        });
      const mockRemoveListener = vi.spyOn(
        chrome.contextMenus.onClicked,
        "removeListener"
      );
      const { unmount } = setup();

      unmount();

      expect(mockRemoveListener).toHaveBeenCalledTimes(1);
      expect(mockRemoveListener).toHaveBeenCalledWith(
        mockAddListener.mock.calls[0][0] // make sure that the remove listener is called with the same callback as the add listener
      );
    });

    it("does not open the popup extension window and does not create user word", async () => {
      const selectionText = "";
      const mockAddListener = vi
        .spyOn(chrome.contextMenus.onClicked, "addListener")
        .mockImplementation((callback) => {
          const item = { selectionText } as chrome.contextMenus.OnClickData;
          callback(item);
        });
      const mockCreateUserWord = vi
        .spyOn(userWordService, "createUserWord")
        .mockImplementation(async () => {
          return {
            json: { userWord: { ...userWord1, word: json[0] } },
            status,
          };
        });
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");

      setup();

      expect(mockAddListener).toHaveBeenCalledTimes(1);
      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOpenPopup).not.toHaveBeenCalled();
      expect(mockCreateUserWord).not.toHaveBeenCalled();
    });
  });
});
