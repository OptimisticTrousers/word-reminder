export function msToUnits(ms: number) {
  if (ms < 0) {
    return { minutes: 0, hours: 0, days: 0, weeks: 0 };
  }

  const minuteMs = 1000 * 60; // (60 sec/1 min * 1000 ms/1 sec)
  const hourMs = minuteMs * 60; // (60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)
  const dayMs = hourMs * 24; // (24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)
  const weekMs = dayMs * 7; // (7 days/1 week * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)

  const weeks = Math.floor(ms / weekMs);
  ms %= weekMs;

  const days = Math.floor(ms / dayMs);
  ms %= dayMs;

  const hours = Math.floor(ms / hourMs);
  ms %= hourMs;

  const minutes = Math.floor(ms / minuteMs);

  return {
    minutes,
    hours,
    days,
    weeks,
  };
}

export function unitsToMs(units: {
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
}) {
  const minuteMs = 60 * 1000; // (60 sec/1 min * 1000 ms/1 sec)
  const hourMs = 60 * minuteMs; // (60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)
  const dayMs = 24 * hourMs; // (24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)
  const weekMs = 7 * dayMs; // (7 days/1 week * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)

  let totalMs = 0;

  if (units.minutes >= 0) {
    totalMs += units.minutes * minuteMs;
  }
  if (units.hours >= 0) {
    totalMs += units.hours * hourMs;
  }
  if (units.days >= 0) {
    totalMs += units.days * dayMs;
  }
  if (units.weeks >= 0) {
    totalMs += units.weeks * weekMs;
  }

  return totalMs;
}
