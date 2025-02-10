// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- disable ESLint check for the next line
// @ts-nocheck -- this TS comment turns off TypeScript type checking for this file because we do not
// mock the entire Chrome API, but only the parts we need
import { useRef, useState } from "react";
import { useContextMenu } from "./useContextMenu";
import { render, screen } from "@testing-library/react";

describe("useContextMenu", () => {
  const id = "1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("onInstalled event", () => {
    it("creates the context menu on mount through the oninstalled listener", async () => {
      function TestComponent() {
        const inputRef = useRef(null);
        const submitButtonRef = useRef(null);
        useContextMenu({ inputRef, submitButtonRef });

        return (
          <>
            <input ref={inputRef} />
            <button ref={submitButtonRef}>Submit</button>
          </>
        );
      }
      const mockCreate = vi.spyOn(chrome.contextMenus, "create");

      render(<TestComponent />);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        id,
        title: "Add Word",
        contexts: ["page"],
        enabled: true,
        visible: true,
      });
    });

    it("removes the context and oninstalled listener menu on unmount", async () => {
      function TestComponent() {
        const inputRef = useRef(null);
        const submitButtonRef = useRef(null);
        useContextMenu({ inputRef, submitButtonRef });

        return (
          <>
            <input ref={inputRef} />
            <button ref={submitButtonRef}>Submit</button>
          </>
        );
      }
      const mockAddListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "addListener"
      );
      const mockRemoveListener = vi.spyOn(
        chrome.runtime.onInstalled,
        "removeListener"
      );
      const mockRemove = vi.spyOn(chrome.contextMenus, "remove");
      const { unmount } = render(<TestComponent />);

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
    it("opens popup, sets input value to selected text, and clicks submit button in the onclicked listener", async () => {
      function TestComponent() {
        const inputRef = useRef(null);
        const submitButtonRef = useRef(null);
        useContextMenu({ inputRef, submitButtonRef });
        const [text, setText] = useState("Submit");

        function toggleClick() {
          setText("Submitting...");
        }

        return (
          <>
            <input ref={inputRef} />
            <button ref={submitButtonRef} onClick={toggleClick}>
              {text}
            </button>
          </>
        );
      }
      const selectionText = "jones";
      const mockAddListener = vi
        .spyOn(chrome.contextMenus.onClicked, "addListener")
        .mockImplementation((callback) => {
          const item = { selectionText };
          callback(item);
        });
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");

      render(<TestComponent />);

      const button = screen.getByRole("button");
      const input = screen.getByDisplayValue(selectionText);
      expect(input).toBeInTheDocument();
      expect(button).toHaveTextContent("Submitting...");
      expect(mockAddListener).toHaveBeenCalledTimes(1);
      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOpenPopup).toHaveBeenCalledTimes(1);
      expect(mockOpenPopup).toHaveBeenCalledWith();
    });

    it("removes onclicked listener on unmount", async () => {
      function TestComponent() {
        const inputRef = useRef(null);
        const submitButtonRef = useRef(null);
        useContextMenu({ inputRef, submitButtonRef });
        const [text, setText] = useState("Submit");

        function toggleClick() {
          setText("Submitting...");
        }

        return (
          <>
            <input ref={inputRef} />
            <button ref={submitButtonRef} onClick={toggleClick}>
              {text}
            </button>
          </>
        );
      }
      const selectionText = "jones";
      const mockAddListener = vi
        .spyOn(chrome.contextMenus.onClicked, "addListener")
        .mockImplementation((callback) => {
          const item = { selectionText };
          callback(item);
        });
      const mockRemoveListener = vi.spyOn(
        chrome.contextMenus.onClicked,
        "removeListener"
      );
      const { unmount } = render(<TestComponent />);

      unmount();

      expect(mockRemoveListener).toHaveBeenCalledTimes(1);
      expect(mockRemoveListener).toHaveBeenCalledWith(
        mockAddListener.mock.calls[0][0] // make sure that the remove listener is called with the same callback as the add listener
      );
    });

    it("does not open extension popup, change input value, or call button when selection text is empty", async () => {
      function TestComponent() {
        const inputRef = useRef(null);
        const submitButtonRef = useRef(null);
        useContextMenu({ inputRef, submitButtonRef });
        const [text, setText] = useState("Submit");

        function toggleClick() {
          setText("Submitting...");
        }

        return (
          <>
            <input ref={inputRef} defaultValue="" />
            <button ref={submitButtonRef} onClick={toggleClick}>
              {text}
            </button>
          </>
        );
      }
      const selectionText = "";
      const mockAddListener = vi
        .spyOn(chrome.contextMenus.onClicked, "addListener")
        .mockImplementation((callback) => {
          const item = { selectionText };
          callback(item);
        });
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");

      render(<TestComponent />);

      const button = screen.getByRole("button");
      const input = screen.getByDisplayValue("");
      expect(input).toBeInTheDocument();
      expect(button).toHaveTextContent("Submit");
      expect(mockOpenPopup).not.toHaveBeenCalled();
      expect(mockAddListener).toHaveBeenCalledTimes(1);
      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it("does not create the onclicked listener when input ref is null", async () => {
      function TestComponent() {
        const inputRef = useRef(null);
        const submitButtonRef = useRef(null);
        useContextMenu({ inputRef, submitButtonRef });

        return (
          <>
            <input />
            <button ref={submitButtonRef}>Submit</button>
          </>
        );
      }
      const mockAddListener = vi.spyOn(
        chrome.contextMenus.onClicked,
        "addListener"
      );
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");

      render(<TestComponent />);

      const button = screen.getByRole("button");
      const input = screen.getByDisplayValue("");
      expect(input).toBeInTheDocument();
      expect(button).toHaveTextContent("Submit");
      expect(mockOpenPopup).not.toHaveBeenCalled();
      expect(mockAddListener).toHaveBeenCalledTimes(1);
      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it("does not create the onclicked listener when submit button ref is null", async () => {
      function TestComponent() {
        const inputRef = useRef(null);
        const submitButtonRef = useRef(null);
        useContextMenu({ inputRef, submitButtonRef });

        return (
          <>
            <input ref={inputRef} />
            <button>Submit</button>
          </>
        );
      }
      const mockAddListener = vi.spyOn(
        chrome.contextMenus.onClicked,
        "addListener"
      );
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");

      render(<TestComponent />);

      const button = screen.getByRole("button");
      const input = screen.getByDisplayValue("");
      expect(input).toBeInTheDocument();
      expect(button).toHaveTextContent("Submit");
      expect(mockOpenPopup).not.toHaveBeenCalled();
      expect(mockAddListener).toHaveBeenCalledTimes(1);
      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it("does not create the onclicked listener when input and submit button ref are null", async () => {
      function TestComponent() {
        const inputRef = useRef(null);
        const submitButtonRef = useRef(null);
        useContextMenu({ inputRef, submitButtonRef });

        return (
          <>
            <input />
            <button>Submit</button>
          </>
        );
      }
      const mockAddListener = vi.spyOn(
        chrome.contextMenus.onClicked,
        "addListener"
      );
      const mockOpenPopup = vi.spyOn(chrome.action, "openPopup");

      render(<TestComponent />);

      const button = screen.getByRole("button");
      const input = screen.getByDisplayValue("");
      expect(input).toBeInTheDocument();
      expect(button).toHaveTextContent("Submit");
      expect(mockOpenPopup).not.toHaveBeenCalled();
      expect(mockAddListener).toHaveBeenCalledTimes(1);
      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
