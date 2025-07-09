import { msToUnits, unitsToMs } from "./date";

describe("date", () => {
  describe("msToUnits", () => {
    it("converts ms to units", () => {
      const units = msToUnits(3510231);
      expect(units).toEqual({
        days: 0,
        hours: 0,
        minutes: 58,
        weeks: 0,
      });
    });

    it("returns empty object when ms is a negative number", () => {
      const units = msToUnits(-1);
      expect(units).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        weeks: 0,
      });
    });
  });

  describe("unitsToMs", () => {
    it("converts units to ms", () => {
      const ms = unitsToMs({
        minutes: 14,
        hours: 12,
        days: 8,
        weeks: 2,
      });

      const minutes = 1000 * 60 * 14; // (14 min * 60 sec/1 min * 1000 ms/1 sec)
      const hours = 1000 * 60 * 60 * 12; // (12 hr * 60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)
      const days = 1000 * 60 * 60 * 24 * 8; // (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)
      const weeks = 1000 * 60 * 60 * 24 * 7 * 2; // (2 weeks * 7 days/1 week * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms/1 sec)
      const time = minutes + hours + days + weeks;
      expect(ms).toBe(time);
    });

    it("counts minutes as 0 when minutes is a negative number", () => {
      const ms = unitsToMs({
        minutes: -1,
        hours: 12,
        days: 8,
        weeks: 2,
      });

      expect(ms).toEqual(
        unitsToMs({
          minutes: 0,
          hours: 12,
          days: 8,
          weeks: 2,
        })
      );
    });

    it("counts hours as 0 when hours is a negative number", () => {
      const units = unitsToMs({
        minutes: 14,
        hours: -1,
        days: 8,
        weeks: 2,
      });

      expect(units).toEqual(
        unitsToMs({
          minutes: 14,
          hours: 0,
          days: 8,
          weeks: 2,
        })
      );
    });

    it("counts days as 0 when days is a negative number", () => {
      const units = unitsToMs({
        minutes: 14,
        hours: 12,
        days: -1,
        weeks: 2,
      });

      expect(units).toEqual(
        unitsToMs({
          minutes: 14,
          hours: 12,
          days: 0,
          weeks: 2,
        })
      );
    });

    it("counts weeks as 0 when weeks is a negative number", () => {
      const units = unitsToMs({
        minutes: 14,
        hours: 12,
        days: 8,
        weeks: -1,
      });

      expect(units).toEqual(
        unitsToMs({
          minutes: 14,
          hours: 12,
          days: 8,
          weeks: 0,
        })
      );
    });
  });
});
