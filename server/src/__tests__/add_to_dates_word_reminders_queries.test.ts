import { addToDateQueries } from "../db/add_to_date_queries";
import { addToDatesWordRemindersQueries } from "../db/add_to_dates_word_reminders_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";
import { userQueries } from "../db/user_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";

describe("addToDatesWordRemindersQueries", () => {
  const addToDateParams = {
    minutes: 0,
    hours: 0,
    days: 0,
    weeks: 0,
    months: 0,
  };
  const sampleUser = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminderId = "1";
  const reminderId = "1";
  const wordReminderParams = {
    user_id: sampleUser.id,
    finish: new Date(Date.now() + 1000),
    is_active: true,
    has_reminder_onload: true,
  };

  describe("create", () => {
    it("creates an add to dates word reminders", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      const addToDate = await addToDateQueries.create(addToDateParams);
      const wordReminder = await wordReminderQueries.create(wordReminderParams);
      const addToDatesWordReminders =
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: wordReminderId,
          reminder_id: reminderId,
        });

      expect(addToDatesWordReminders).toEqual({
        id: 1,
        word_reminder_id: wordReminder.id,
        reminder_id: addToDate.id,
      });
    });
  });

  describe("deleteAllByUserId", () => {
    it("deletes all add to dates word reminders by user id", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      await addToDateQueries.create(addToDateParams);
      await wordReminderQueries.create(wordReminderParams);
      const addToDatesWordReminders =
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: wordReminderId,
          reminder_id: reminderId,
        });

      const deletedAddToDatesWordReminders =
        await addToDatesWordRemindersQueries.deleteAllByUserId(sampleUser.id);

      expect(deletedAddToDatesWordReminders).toEqual([addToDatesWordReminders]);
    });
  });

  describe("deleteByWordReminderId", () => {
    it("deletes add to date word reminders by word reminder id", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      await addToDateQueries.create(addToDateParams);
      await wordReminderQueries.create(wordReminderParams);
      const addToDatesWordReminders =
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: wordReminderId,
          reminder_id: reminderId,
        });

      const deletedAddToDatesWordReminder =
        await addToDatesWordRemindersQueries.deleteByWordReminderId(
          wordReminderId
        );
      const goneAddToDatesWordReminder =
        await addToDatesWordRemindersQueries.getByWordReminderId(
          wordReminderId
        );

      expect(deletedAddToDatesWordReminder).toEqual(addToDatesWordReminders);
      expect(goneAddToDatesWordReminder).toBeUndefined();
    });
  });

  describe("updateByWordReminderId", () => {
    it("updates add to date word reminders by word reminder id", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      await addToDateQueries.create(addToDateParams);
      await wordReminderQueries.create(wordReminderParams);
      await addToDatesWordRemindersQueries.create({
        word_reminder_id: wordReminderId,
        reminder_id: reminderId,
      });

      const updatedAddToDatesWordReminder =
        await addToDatesWordRemindersQueries.updateByWordReminderId(
          wordReminderId,
          { minutes: 5, hours: 2, days: 1, weeks: 0, months: 0 }
        );

      expect(updatedAddToDatesWordReminder).toEqual({
        id: 1,
        reminder_id: Number(reminderId),
        word_reminder_id: Number(wordReminderId),
      });
    });
  });

  describe("getByWordReminderId", () => {
    it("gets add to dates word reminders by word reminder id", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      await addToDateQueries.create(addToDateParams);
      await wordReminderQueries.create(wordReminderParams);
      const newAddToDatesWordReminders =
        await addToDatesWordRemindersQueries.create({
          word_reminder_id: wordReminderId,
          reminder_id: reminderId,
        });

      const addToDatesWordReminders =
        await addToDatesWordRemindersQueries.deleteByWordReminderId(
          wordReminderId
        );

      expect(newAddToDatesWordReminders).toEqual(addToDatesWordReminders);
    });
  });
});
