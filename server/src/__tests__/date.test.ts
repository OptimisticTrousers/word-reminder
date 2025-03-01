import { dateAdd } from "../utils/date";

describe("dateAdd", () => {
  const date = new Date("December 17, 1995 03:24:00");

  it("adds 3 year to the date", () => {
    const newDate = dateAdd(date, "year", 3);

    expect(newDate).toEqual(new Date("December 17, 1998 03:24:00"));
  });

  it("adds 3 quarters to the date", () => {
    const newDate = dateAdd(date, "quarter", 3);

    expect(newDate).toEqual(new Date("September 17, 1996 03:24:00"));
  });

  it("adds 3 month to the date", () => {
    const newDate = dateAdd(date, "month", 3);

    expect(newDate).toEqual(new Date("March 17, 1996 03:24:00"));
  });

  it("adds 3 weeks to the date", async () => {
    const newDate = dateAdd(date, "week", 3);

    expect(newDate).toEqual(new Date("January 7, 1996 03:24:00"));
  });

  it("adds 3 days to the date", async () => {
    const newDate = dateAdd(date, "day", 3);

    expect(newDate).toEqual(new Date("December 20, 1995 03:24:00"));
  });

  it("adds 3 hours to the date", async () => {
    const newDate = dateAdd(date, "hour", 3);

    expect(newDate).toEqual(new Date("December 17, 1995 06:24:00"));
  });

  it("adds 3 minutes to the date", async () => {
    const newDate = dateAdd(date, "minute", 3);

    expect(newDate).toEqual(new Date("December 17, 1995 03:27:00"));
  });

  it("adds 3 seconds to the date", async () => {
    const newDate = dateAdd(date, "second", 3);

    expect(newDate).toEqual(new Date("December 17, 1995 03:24:03"));
  });

  it("returns the date when the interval is wrong", async () => {
    const newDate = dateAdd(date, "seconds", 3);

    expect(newDate).toEqual(date);
  });
});
