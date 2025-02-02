import { createRoutesStub, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { Navigation } from "./Navigation";
import userEvent from "@testing-library/user-event";

function Words() {
  return <div data-testid="words">words</div>;
}

function WordReminders() {
  return <div data-testid="wordReminders">word reminders</div>;
}

describe("Navigation component", () => {
  it("renders two links to words and word reminders pages respectively", async () => {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: Navigation,
      },
    ]);

    const { asFragment } = render(<Stub initialEntries={["/"]} />);

    const navigation = screen.getByRole("navigation");
    expect(navigation).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("adds the active class to the words page when on the words page", async () => {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return (
            <>
              <Navigation />
              <Outlet />
            </>
          );
        },
        children: [
          {
            path: "/words",
            Component: Words,
          },
          { path: "/wordReminders", Component: WordReminders },
        ],
      },
    ]);
    const user = userEvent.setup();
    render(<Stub initialEntries={["/wordReminders"]} />);

    const wordsLink = screen.getByRole("link", {
      name: "Words",
      current: false,
    });
    await user.click(wordsLink);

    const words = screen.getByTestId("words");
    expect(wordsLink.getAttribute("class")).toContain(
      "navigation__link--active"
    );
    expect(words).toBeInTheDocument();
    expect(wordsLink).toHaveAttribute("aria-current", "page");
  });

  it("adds the active class to the word reminders page when on the word reminders page", async () => {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return (
            <>
              <Navigation />
              <Outlet />
            </>
          );
        },
        children: [
          {
            path: "/words",
            Component: Words,
          },
          { path: "/wordReminders", Component: WordReminders },
        ],
      },
    ]);
    const user = userEvent.setup();

    render(<Stub initialEntries={["/words"]} />);

    const wordRemindersLink = screen.getByRole("link", {
      name: "Word Reminders",
      current: false,
    });
    await user.click(wordRemindersLink);

    const wordReminders = screen.getByTestId("wordReminders");
    expect(wordRemindersLink.getAttribute("class")).toContain(
      "navigation__link--active"
    );
    expect(wordReminders).toBeInTheDocument();
    expect(wordRemindersLink).toHaveAttribute("aria-current", "page");
  });
});
