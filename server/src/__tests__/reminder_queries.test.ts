import { reminderQueries } from "../db/reminder_queries";
import { userQueries } from "../db/user_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("reminderQueries", () => {
  const reminder1 = {
    minutes: 0,
    hours: 0,
    days: 0,
    weeks: 0,
    months: 0,
  };

  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminder1 = {
    user_id: sampleUser1.id,
    finish: new Date(Date.now() + 1000),
    reminder: {
      minutes: 0,
      hours: 1,
      days: 0,
      weeks: 0,
      months: 0,
    },
    is_active: true,
    has_reminder_onload: true,
  };

  describe("create", () => {
    it("creates a reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);

      const reminder = await reminderQueries.create({
        ...reminder1,
        word_reminder_id: wordReminder.id,
      });

      expect(reminder).toEqual({
        ...reminder1,
        word_reminder_id: wordReminder.id,
        id: 1,
      });
    });
  });

  describe("updateByWordReminderId", () => {
    it("updates a reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);
      await reminderQueries.create({
        ...reminder1,
        word_reminder_id: wordReminder.id,
      });
      const newReminder = {
        minutes: 5,
        hours: 10,
        days: 2,
        weeks: 1,
        months: 1,
      };

      const updatedWordReminder = await reminderQueries.updateByWordReminderId(
        wordReminder.id,
        newReminder
      );

      expect(updatedWordReminder).toEqual({
        ...newReminder,
        word_reminder_id: wordReminder.id,
        id: 1,
      });
    });

    it("does nothing if the reminder does not exist", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);
      const newReminder = {
        minutes: 5,
        hours: 10,
        days: 2,
        weeks: 1,
        months: 1,
      };

      const updatedWordReminder = await reminderQueries.updateByWordReminderId(
        wordReminder.id,
        newReminder
      );

      expect(updatedWordReminder).toBeUndefined();
    });
  });

  describe("deleteByWordReminderId", () => {
    it("deletes reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);
      const reminder = await reminderQueries.create({
        ...reminder1,
        word_reminder_id: wordReminder.id,
      });

      await reminderQueries.deleteByWordReminderId(wordReminder.id);

      const deletedReminder = await reminderQueries.getById(reminder.id);
      expect(deletedReminder).toBeUndefined();
    });

    it("does nothing if the reminder does not exist", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);

      await reminderQueries.deleteByWordReminderId(wordReminder.id);

      const deletedReminder = await reminderQueries.getById(wordReminder.id);
      expect(deletedReminder).toBeUndefined();
    });
  });

  describe("deleteAllByUserId", () => {
    it("deletes all reminders related to a user", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);
      const reminder = await reminderQueries.create({
        ...reminder1,
        word_reminder_id: wordReminder.id,
      });

      const deletedReminders = await reminderQueries.deleteAllByUserId(
        sampleUser1.id
      );

      expect(deletedReminders).toEqual([reminder]);
    });
  });
});
