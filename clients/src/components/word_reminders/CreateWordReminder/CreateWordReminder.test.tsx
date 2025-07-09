import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateWordReminder } from "./CreateWordReminder";
import { Theme, ThemeContext } from "../../../context/Theme/Context";

vi.mock("../../modals/CreateWordReminderModal/CreateWordReminderModal", () => {
  return {
    CreateWordReminderModal: function ({
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
});

describe("CreateWordReminder component", () => {
  function setup() {
    return {
      user: userEvent.setup(),
      ...render(<CreateWordReminder />),
    };
  }

  it("renders button", async () => {
    const { asFragment } = setup();

    const heading = screen.getByRole("heading", {
      name: "Create Word Reminder",
    });
    const description = screen.getByText(
      "Create a word reminder to remember words you come across in your readings."
    );
    expect(heading).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(asFragment).toMatchSnapshot();
  });

  it("has light class", () => {
    render(
      <ThemeContext.Provider
        value={{ theme: Theme.Light, toggleTheme: vi.fn() }}
      >
        <CreateWordReminder />
      </ThemeContext.Provider>
    );

    const button = screen.getByRole("button", { name: "Create Word Reminder" });
    expect(button.getAttribute("class")).toContain(`create--${Theme.Light}`);
  });

  it("has dark class", () => {
    render(
      <ThemeContext.Provider
        value={{ theme: Theme.Dark, toggleTheme: vi.fn() }}
      >
        <CreateWordReminder />
      </ThemeContext.Provider>
    );

    const button = screen.getByRole("button", { name: "Create Word Reminder" });
    expect(button.getAttribute("class")).toContain(`create--${Theme.Dark}`);
  });

  it("opens model when the create word reminder is clicked", async () => {
    const { user } = setup();

    const createWordReminderButton = screen.getByRole("button", {
      name: "Create Word Reminder",
    });
    await user.click(createWordReminderButton);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
  });

  it("closes model when the create word reminder is clicked and modal close button is clicked", async () => {
    const { user } = setup();

    const createWordReminderButton = screen.getByRole("button", {
      name: "Create Word Reminder",
    });
    await user.click(createWordReminderButton);
    const closeModalButton = screen.getByRole("button", { name: "Close" });
    await user.click(closeModalButton);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });
});
