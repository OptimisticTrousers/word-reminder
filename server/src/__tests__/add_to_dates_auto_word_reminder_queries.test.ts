import { addToDateQueries } from "../db/add_to_date_queries";
import { addToDatesWordRemindersQueries } from "../db/add_to_dates_word_reminders_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";
import { userQueries } from "../db/user_queries";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { Order } from "common";
import { addToDatesAutoWordRemindersQueries } from "../db/add_to_dates_auto_word_reminders_queries";

describe("addToDatesAutoWordRemindersQueries", () => {
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

  const autoWordReminderId = "1";
  const reminderId = "1";
  const durationId = "2";
  const autoWordReminderParams = {
    user_id: sampleUser.id,
    is_active: true,
    has_reminder_onload: true,
    has_learned_words: true,
    order: Order.Newest,
    word_count: 7,
  };

  describe("create", () => {
    it("creates an auto word reminder", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      const addToDateReminder = await addToDateQueries.create(addToDateParams);
      const addToDateDuration = await addToDateQueries.create(addToDateParams);
      const autoWordReminder = await autoWordReminderQueries.create(
        autoWordReminderParams
      );
      const addToDatesAutoWordReminders =
        await addToDatesAutoWordRemindersQueries.create({
          auto_word_reminder_id: autoWordReminderId,
          reminder_id: reminderId,
          duration_id: durationId,
        });

      expect(addToDatesAutoWordReminders).toEqual({
        id: 1,
        auto_word_reminder_id: autoWordReminder.id,
        reminder_id: addToDateReminder.id,
        duration_id: addToDateDuration.id,
      });
    });
  });

  describe("updateByAutoWordReminderId", () => {
    it("updates add to date word reminders by word reminder id", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      await addToDateQueries.create(addToDateParams);
      await autoWordReminderQueries.create(autoWordReminderParams);
      await addToDatesAutoWordRemindersQueries.create({
        auto_word_reminder_id: autoWordReminderId,
        duration_id: durationId,
        reminder_id: reminderId,
      });

      const updatedAddToDatesAutoWordReminder =
        await addToDatesAutoWordRemindersQueries.updateByAutoWordReminderId(
          autoWordReminderId,
          {
            reminder: { minutes: 5, hours: 2, days: 1, weeks: 0, months: 0 },
            duration: { minutes: 5, hours: 2, days: 1, weeks: 0, months: 0 },
          }
        );

      expect(updatedAddToDatesAutoWordReminder).toEqual({
        id: 1,
        reminder_id: Number(reminderId),
        duration_id: Number(durationId),
        word_reminder_id: Number(autoWordReminderId),
      });
    });
  });

  describe("getByAutoWordReminderId", () => {
    it("gets add to dates auto word reminders by auto word reminder id", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      await addToDateQueries.create(addToDateParams);
      await autoWordReminderQueries.create(autoWordReminderParams);
      const newAddToDatesWordReminders =
        await addToDatesAutoWordRemindersQueries.create({
          auto_word_reminder_id: autoWordReminderId,
          reminder_id: reminderId,
          duration_id: durationId,
        });

      const addToDatesAutoWordReminders =
        await addToDatesAutoWordRemindersQueries.getByAutoWordReminderId(
          autoWordReminderId
        );

      expect(newAddToDatesWordReminders).toEqual(addToDatesAutoWordReminders);
    });
  });

  describe("deleteByAutoWordReminderId", () => {
    it("deletes add to date by word reminder id", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      await addToDateQueries.create(addToDateParams);
      await autoWordReminderQueries.create(autoWordReminderParams);
      const addToDatesAutoWordReminders =
        await addToDatesAutoWordRemindersQueries.create({
          auto_word_reminder_id: autoWordReminderId,
          reminder_id: reminderId,
          duration_id: durationId,
        });

      const deletedAddToDatesWordReminder =
        await addToDatesAutoWordRemindersQueries.deleteByAutoWordReminderId(
          autoWordReminderId
        );
      const goneAddToDatesAutoWordReminder =
        await addToDatesAutoWordRemindersQueries.getByAutoWordReminderId(
          autoWordReminderId
        );

      expect(deletedAddToDatesWordReminder).toEqual(
        addToDatesAutoWordReminders
      );
      expect(goneAddToDatesAutoWordReminder).toBeUndefined();
    });
  });

  describe("getByAutoWordReminderId", () => {
    it("gets add to dates word reminders by word reminder id", async () => {
      await userQueries.create({
        email: sampleUser.email,
        password: sampleUser.password,
      });
      await addToDateQueries.create(addToDateParams);
      await autoWordReminderQueries.create(autoWordReminderParams);
      const newAddToDatesWordReminders =
        await addToDatesAutoWordRemindersQueries.create({
          auto_word_reminder_id: autoWordReminderId,
          reminder_id: reminderId,
          duration_id: durationId,
        });

      const addToDatesWordReminders =
        await addToDatesAutoWordRemindersQueries.getByAutoWordReminderId(
          autoWordReminderId
        );

      expect(newAddToDatesWordReminders).toEqual(addToDatesWordReminders);
    });
  });
});
