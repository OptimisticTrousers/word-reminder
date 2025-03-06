import { render, screen } from "@testing-library/react";

import { Duration } from "./Duration";

describe("Duration", () => {
  it("renders five inputs for minutes, hours, days, weeks, and months", async () => {
    const { asFragment } = render(
      <Duration
        disabled={false}
        defaultValues={{
          minutes: 5,
          hours: 2,
          days: 3,
          weeks: 4,
        }}
      />
    );

    const legend = screen.getByText("Duration");
    const minutesInput = screen.getByLabelText("Minutes");
    const hoursInput = screen.getByLabelText("Hours");
    const daysInput = screen.getByLabelText("Days");
    const weeksInput = screen.getByLabelText("Weeks");

    expect(legend).toBeInTheDocument();
    expect(minutesInput).toBeInTheDocument();
    expect(minutesInput).toHaveAttribute("name", "minutes");
    expect(minutesInput).toHaveValue(5);
    expect(minutesInput).not.toBeDisabled();
    expect(hoursInput).toBeInTheDocument();
    expect(hoursInput).toHaveAttribute("name", "hours");
    expect(hoursInput).toHaveValue(2);
    expect(hoursInput).not.toBeDisabled();
    expect(daysInput).toBeInTheDocument();
    expect(daysInput).toHaveAttribute("name", "days");
    expect(daysInput).toHaveValue(3);
    expect(daysInput).not.toBeDisabled();
    expect(weeksInput).toBeInTheDocument();
    expect(weeksInput).toHaveAttribute("name", "weeks");
    expect(weeksInput).toHaveValue(4);
    expect(weeksInput).not.toBeDisabled();
    expect(asFragment()).toMatchSnapshot();
  });

  it("disables all five inputs", async () => {
    render(
      <Duration
        disabled={true}
        defaultValues={{
          minutes: 0,
          hours: 0,
          days: 0,
          weeks: 0,
        }}
      />
    );

    const legend = screen.getByText("Duration");
    const minutesInput = screen.getByLabelText("Minutes");
    const hoursInput = screen.getByLabelText("Hours");
    const daysInput = screen.getByLabelText("Days");
    const weeksInput = screen.getByLabelText("Weeks");

    expect(legend).toBeInTheDocument();
    expect(minutesInput).toBeInTheDocument();
    expect(minutesInput).toBeDisabled();
    expect(hoursInput).toBeInTheDocument();
    expect(hoursInput).toBeDisabled();
    expect(daysInput).toBeInTheDocument();
    expect(daysInput).toBeDisabled();
    expect(weeksInput).toBeInTheDocument();
    expect(weeksInput).toBeDisabled();
  });
});
