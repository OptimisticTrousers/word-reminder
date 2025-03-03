import { addToDateQueries } from "../db/add_to_date_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("addToDateQueries", () => {
  const addToDate1 = {
    minutes: 0,
    hours: 0,
    days: 0,
    weeks: 0,
    months: 0,
  };

  describe("create", () => {
    it("creates an add to date", async () => {
      const addToDate = await addToDateQueries.create(addToDate1);

      expect(addToDate).toEqual({ ...addToDate1, id: 1 });
    });
  });

  describe("deleteById", () => {
    it("deletes add to date", async () => {
      const addToDate = await addToDateQueries.create(addToDate1);

      await addToDateQueries.deleteById(addToDate.id);

      const deletedReminder = await addToDateQueries.getById(addToDate.id);
      expect(deletedReminder).toBeUndefined();
    });
  });
});
