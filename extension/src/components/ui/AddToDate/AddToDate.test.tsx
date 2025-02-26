import { render, screen } from "@testing-library/react";
import { AddToDate } from "./AddToDate";

describe("AddToDate", () => {
  it("renders five inputs for minutes, hours, days, weeks, and months", async () => {
    const { asFragment } = render(
      <AddToDate
        disabled={false}
        legend="Reminder"
        defaultValues={{
          minutes: 5,
          hours: 2,
          days: 3,
          weeks: 4,
          months: 1,
        }}
      />
    );

    const legend = screen.getByText("Reminder");
    const minutesInput = screen.getByLabelText("Minutes");
    const hoursInput = screen.getByLabelText("Hours");
    const daysInput = screen.getByLabelText("Days");
    const weeksInput = screen.getByLabelText("Weeks");
    const monthsInput = screen.getByLabelText("Months");

    expect(legend).toBeInTheDocument();
    expect(minutesInput).toBeInTheDocument();
    expect(minutesInput).toHaveAttribute("name", "reminder-minutes");
    expect(minutesInput).toHaveValue(5);
    expect(minutesInput).not.toBeDisabled();
    expect(hoursInput).toBeInTheDocument();
    expect(hoursInput).toHaveAttribute("name", "reminder-hours");
    expect(hoursInput).toHaveValue(2);
    expect(hoursInput).not.toBeDisabled();
    expect(daysInput).toBeInTheDocument();
    expect(daysInput).toHaveAttribute("name", "reminder-days");
    expect(daysInput).toHaveValue(3);
    expect(daysInput).not.toBeDisabled();
    expect(weeksInput).toBeInTheDocument();
    expect(weeksInput).toHaveAttribute("name", "reminder-weeks");
    expect(weeksInput).toHaveValue(4);
    expect(weeksInput).not.toBeDisabled();
    expect(monthsInput).toBeInTheDocument();
    expect(monthsInput).toHaveAttribute("name", "reminder-months");
    expect(monthsInput).toHaveValue(1);
    expect(monthsInput).not.toBeDisabled();
    expect(asFragment()).toMatchSnapshot();
  });

  it("disables all five inputs", async () => {
    render(
      <AddToDate
        disabled={true}
        legend="Duration"
        defaultValues={{
          minutes: 0,
          hours: 0,
          days: 0,
          weeks: 0,
          months: 0,
        }}
      />
    );

    const legend = screen.getByText("Duration");
    const minutesInput = screen.getByLabelText("Minutes");
    const hoursInput = screen.getByLabelText("Hours");
    const daysInput = screen.getByLabelText("Days");
    const weeksInput = screen.getByLabelText("Weeks");
    const monthsInput = screen.getByLabelText("Months");

    expect(legend).toBeInTheDocument();
    expect(minutesInput).toBeInTheDocument();
    expect(minutesInput).toBeDisabled();
    expect(hoursInput).toBeInTheDocument();
    expect(hoursInput).toBeDisabled();
    expect(daysInput).toBeInTheDocument();
    expect(daysInput).toBeDisabled();
    expect(weeksInput).toBeInTheDocument();
    expect(weeksInput).toBeDisabled();
    expect(monthsInput).toBeInTheDocument();
    expect(monthsInput).toBeDisabled();
  });
});
