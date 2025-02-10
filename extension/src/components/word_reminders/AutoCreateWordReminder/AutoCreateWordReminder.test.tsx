import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoCreateWordReminder } from "./AutoCreateWordReminder";
import { Theme, ThemeContext } from "../../../context/Theme/Context";
import { createRoutesStub, Outlet } from "react-router-dom";

vi.mock(
  "../../modals/AutoCreateWordReminderModal/AutoCreateWordReminderModal",
  () => {
    return {
      AutoCreateWordReminderModal: function ({
        toggleModal,
      }: {
        toggleModal: () => void;
      }) {
        return (
          <div role="dialog">
            <button onClick={toggleModal}>Close</button>
          </div>
        );
      },
    };
  }
);

describe("AutoCreateWordReminder component", () => {
  const searchParams = new URLSearchParams();
  function setup(testUser: { id: string; auto: boolean }, theme: Theme) {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <Outlet context={{ user: testUser }} />;
        },
        children: [
          {
            path: "/",
            Component: function () {
              return (
                <ThemeContext.Provider value={{ theme, toggleTheme: vi.fn() }}>
                  <AutoCreateWordReminder searchParams={searchParams} />;
                </ThemeContext.Provider>
              );
            },
          },
        ],
      },
    ]);
    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={["/"]} />),
    };
  }

  describe("auto", () => {
    it("renders untoggled button", async () => {
      const testUser = { id: "1", auto: false };
      const { asFragment } = setup(testUser, Theme.Dark);

      const heading = screen.getByRole("heading", {
        name: "Automatic Create Word Reminder",
      });
      const description = screen.getByText(
        "Automatically create word reminder on an interval to remember words you come across in your readings. Set it and forget it."
      );
      expect(heading).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(asFragment).toMatchSnapshot();
    });

    it("renders toggled button", async () => {
      const testUser = { id: "1", auto: true };
      const { asFragment } = setup(testUser, Theme.Dark);

      const heading = screen.getByRole("heading", {
        name: "Automatic Create Word Reminder Toggled...",
      });
      const description = screen.getByText(
        "Automatically create word reminder on an interval to remember words you come across in your readings. Set it and forget it."
      );
      expect(heading).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(asFragment).toMatchSnapshot();
    });
  });

  it("has light class", () => {
    const testUser = { id: "1", auto: false };
    setup(testUser, Theme.Light);

    const button = screen.getByRole("button", {
      name: "Automatic Create Word Reminder",
    });
    expect(button.getAttribute("class")).toContain(`create--${Theme.Light}`);
  });

  it("has dark class", () => {
    const testUser = { id: "1", auto: false };
    setup(testUser, Theme.Dark);

    const button = screen.getByRole("button", {
      name: "Automatic Create Word Reminder",
    });
    expect(button.getAttribute("class")).toContain(`create--${Theme.Dark}`);
  });

  it("opens model when the create word reminder is clicked", async () => {
    const testUser = { id: "1", auto: false };
    const { user } = setup(testUser, Theme.Dark);

    const button = screen.getByRole("button", {
      name: "Automatic Create Word Reminder",
    });
    await user.click(button);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
  });

  it("closes model when the create word reminder is clicked and modal close button is clicked", async () => {
    const testUser = { id: "1", auto: false };
    const { user } = setup(testUser, Theme.Dark);

    const button = screen.getByRole("button", {
      name: "Automatic Create Word Reminder",
    });
    await user.click(button);
    const closeModalButton = screen.getByRole("button", { name: "Close" });
    await user.click(closeModalButton);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });
});
