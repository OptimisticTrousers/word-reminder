import { render, screen } from "@testing-library/react";
import { Reminder } from "./Reminder";
import userEvent from "@testing-library/user-event";

describe("Reminder", () => {
  it("renders reminder input", async () => {
    const value = "";
    const { asFragment } = render(<Reminder disabled={false} value={value} />);

    const reminderInput = screen.getByDisplayValue(value);
    const reminderDescription = screen.queryByText(
      "An error occurred when generating the expression description. Check the cron expression syntax."
    );
    const cronPromptLink = screen.getByRole("link", {
      name: "Visit cronprompt to enter a valid reminder.",
    });
    const reminderNote = screen.getByText(
      "See details on the reminder attribute here."
    );
    expect(cronPromptLink).toBeInTheDocument();
    expect(reminderNote).toBeInTheDocument();
    expect(reminderDescription).not.toBeInTheDocument();
    expect(reminderInput).toBeInTheDocument();
    expect(asFragment());
  });

  it("renders valid reminder when default value is a valid cron expression", async () => {
    const value = "*/5 * * * *";
    render(<Reminder disabled={false} value={value} />);

    const reminderInput = screen.getByDisplayValue(value);
    const reminderDescription = screen.getByText("Every 5 minutes");
    const cronPromptLink = screen.getByRole("link", {
      name: "Visit cronprompt to enter a valid reminder.",
    });
    const reminderNote = screen.getByText(
      "See details on the reminder attribute here."
    );
    expect(cronPromptLink).toBeInTheDocument();
    expect(reminderNote).toBeInTheDocument();
    expect(reminderDescription).toBeInTheDocument();
    expect(reminderInput).toBeInTheDocument();
  });

  it("renders valid reminder when user enters an invalid cron expression", async () => {
    const value = "";
    render(<Reminder disabled={false} value={value} />);

    const reminderInput = screen.getByDisplayValue(value);
    const user = userEvent.setup();
    await user.type(reminderInput, "invalid cron");

    const reminderDescription = screen.getByText(
      "An error occurred when generating the expression description. Check the cron expression syntax."
    );
    expect(reminderDescription).toBeInTheDocument();
  });

  it("renders disabled reminder input", async () => {
    const value = "* * * * *";
    render(<Reminder disabled={true} value={value} />);

    const reminderInput = screen.getByDisplayValue(value);
    expect(reminderInput).toBeDisabled();
  });
});
