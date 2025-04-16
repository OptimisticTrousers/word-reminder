import { render, screen } from "@testing-library/react";
import { Reminder } from "./Reminder";
import userEvent from "@testing-library/user-event";
import { ChangeEvent, useState } from "react";

describe("Reminder", () => {
  it("renders reminder input", async () => {
    const value = "";
    function TestComponent() {
      const [reminder, setReminder] = useState(value);

      function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setReminder(event.target.value);
      }

      return (
        <Reminder
          disabled={false}
          value={reminder}
          handleChange={handleChange}
        />
      );
    }

    const { asFragment } = render(<TestComponent />);

    const reminderInput = screen.getByDisplayValue(value);
    const reminderDescription = screen.queryByText(
      "An error occurred when generating the expression description. Check the cron expression syntax."
    );
    const cronPromptLink = screen.getByRole("link", {
      name: "Visit cronprompt for more details",
    });
    expect(cronPromptLink).toBeInTheDocument();
    expect(reminderDescription).not.toBeInTheDocument();
    expect(reminderInput).toBeInTheDocument();
    expect(asFragment());
  });

  it("renders valid reminder when default value is a valid cron expression", async () => {
    const value = "*/5 * * * *";
    function TestComponent() {
      const [reminder, setReminder] = useState(value);

      function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setReminder(event.target.value);
      }

      return (
        <Reminder
          disabled={false}
          value={reminder}
          handleChange={handleChange}
        />
      );
    }

    render(<TestComponent />);

    const reminderInput = screen.getByDisplayValue(value);
    const reminderDescription = screen.getByText("Every 5 minutes");
    const cronPromptLink = screen.getByRole("link", {
      name: "Visit cronprompt for more details",
    });
    expect(cronPromptLink).toBeInTheDocument();
    expect(reminderDescription).toBeInTheDocument();
    expect(reminderInput).toBeInTheDocument();
  });

  it("renders valid reminder when user enters an invalid cron expression", async () => {
    const value = "";
    function TestComponent() {
      const [reminder, setReminder] = useState(value);

      function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setReminder(event.target.value);
      }

      return (
        <Reminder
          disabled={false}
          value={reminder}
          handleChange={handleChange}
        />
      );
    }

    render(<TestComponent />);

    const reminderInput = screen.getByDisplayValue(value);
    const user = userEvent.setup();
    await user.type(reminderInput, "invalid cron");

    const reminderDescription = screen.getByText(
      "An error occurred when generating the expression description. Check the cron expression syntax."
    );
    expect(reminderDescription).toBeInTheDocument();
  });

  it("renders error when user enters a valid cron expression input", async () => {
    const value = "";
    function TestComponent() {
      const [reminder, setReminder] = useState(value);

      function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setReminder(event.target.value);
      }

      return (
        <Reminder
          disabled={false}
          value={reminder}
          handleChange={handleChange}
        />
      );
    }
    render(<TestComponent />);

    const reminderInput = screen.getByDisplayValue(value);
    const user = userEvent.setup();
    await user.type(reminderInput, "*/2 * * * *");

    const reminderDescription = screen.getByText("Every 2 minutes");
    expect(reminderDescription).toBeInTheDocument();
  });

  it("renders disabled reminder input", async () => {
    const value = "* * * * *";
    function TestComponent() {
      const [reminder, setReminder] = useState(value);

      function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setReminder(event.target.value);
      }

      return (
        <Reminder
          disabled={true}
          value={reminder}
          handleChange={handleChange}
        />
      );
    }

    render(<TestComponent />);

    const reminderInput = screen.getByDisplayValue(value);
    expect(reminderInput).toBeDisabled();
  });
});
