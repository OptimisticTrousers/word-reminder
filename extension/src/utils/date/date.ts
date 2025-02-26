import { AddToDate } from "common";

export function addToDateToString(addToDate: AddToDate) {
  const intervals = [];

  if (addToDate.months) {
    intervals.push(
      `${addToDate.months} month${addToDate.months > 1 ? "s" : ""}`
    );
  }
  if (addToDate.weeks) {
    intervals.push(`${addToDate.weeks} week${addToDate.weeks > 1 ? "s" : ""}`);
  }
  if (addToDate.days) {
    intervals.push(`${addToDate.days} day${addToDate.days > 1 ? "s" : ""}`);
  }
  if (addToDate.hours) {
    intervals.push(`${addToDate.hours} hour${addToDate.hours > 1 ? "s" : ""}`);
  }
  if (addToDate.minutes) {
    intervals.push(
      `${addToDate.minutes} minute${addToDate.minutes > 1 ? "s" : ""}`
    );
  }

  const formatter = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  });

  const string = formatter.format(intervals);
  if (string === "") {
    return "";
  }
  return `every ${string}`;
}
