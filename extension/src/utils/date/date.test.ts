import { addToDateToString } from "./date";

describe("addToDateToString", () => {
  it("returns an empty interval when addToDate object is filled with zeroes", async () => {
    const addToDate = {
      minutes: 0,
      hours: 0,
      days: 0,
      weeks: 0,
      months: 0,
    };
    const interval = addToDateToString(addToDate);
    expect(interval).toBe("");
  });

  it("returns an interval when all properties of addToDate is singular", async () => {
    const addToDate = {
      minutes: 1,
      hours: 1,
      days: 1,
      weeks: 1,
      months: 1,
    };
    const interval = addToDateToString(addToDate);
    expect(interval).toBe("every 1 month, 1 week, 1 day, 1 hour, and 1 minute");
  });

  it("returns an interval when one property of addToDate is plural", async () => {
    const addToDate = {
      minutes: 0,
      hours: 2,
      days: 0,
      weeks: 0,
      months: 0,
    };
    const interval = addToDateToString(addToDate);
    expect(interval).toBe("every 2 hours");
  });

  it("returns an interval when two property of addToDate are not zeroes", async () => {
    const addToDate = {
      minutes: 30,
      hours: 1,
      days: 0,
      weeks: 0,
      months: 0,
    };
    const interval = addToDateToString(addToDate);
    expect(interval).toBe("every 1 hour and 30 minutes");
  });

  it("returns an interval when all properties of addToDate are not zeroes", async () => {
    const addToDate = {
      minutes: 30,
      hours: 1,
      days: 2,
      weeks: 3,
      months: 5,
    };
    const interval = addToDateToString(addToDate);
    expect(interval).toBe(
      "every 5 months, 3 weeks, 2 days, 1 hour, and 30 minutes"
    );
  });
});
