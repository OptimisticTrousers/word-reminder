import { render, screen } from "@testing-library/react";
import { createRoutesStub, useParams } from "react-router-dom";

import { useOnMessageRedirect } from "./useOnMessageNavigate";

describe("useOnMessageNavigate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userWordId = "1";

  it("navigates to a page thats get a resource once a message is received", async () => {
    const mockOnMessageAddListener = vi
      .spyOn(window.chrome.runtime.onMessage, "addListener")
      .mockImplementation((callback) => {
        callback(
          { resource: "userWords", id: userWordId },
          {
            id: "hiligdjmbpdajadhmciipkifbofekokl",
            origin: "chrome-extension://hiligdjmbpdajadhmciipkifbofekokl",
            url: "chrome-extension://hiligdjmbpdajadhmciipkifbofekokl/service-worker.js",
          },
          vi.fn()
        );
      });
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function TestComponent() {
          useOnMessageRedirect();

          return <div></div>;
        },
      },
      {
        path: "/userWords/:userWordId",
        Component: function () {
          const { userWordId } = useParams();
          return <div data-testid="user-word">{userWordId}</div>;
        },
      },
    ]);

    render(<Stub initialEntries={["/"]} />);

    const userWord = screen.getByTestId("user-word");
    expect(userWord).toBeInTheDocument();
    expect(userWord).toHaveTextContent(userWordId);
    expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
    expect(mockOnMessageAddListener).toHaveBeenCalledWith(expect.any(Function));
  });
});
