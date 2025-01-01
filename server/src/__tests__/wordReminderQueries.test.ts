import { WordReminderQueries } from "../db/wordReminderQueries";
import { UserQueries } from "../db/userQueries";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("wordReminderQueries", () => {
  const userQueries = new UserQueries();
  const wordReminderQueries = new WordReminderQueries();

  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminderId1 = "1";
  const wordReminder1 = {
    user_id: sampleUser1.id,
    finish: new Date(Date.now() + 1000), // make sure date comes after current date
    reminder: "every 2 hours",
    is_active: true,
    has_reminder_onload: true,
  };

  // option for including duplicate words in the auto create
  describe("create", () => {
    it("creates word reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const wordReminder = await wordReminderQueries.create(wordReminder1);

      const createdAtTimestamp = new Date(wordReminder!.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: Number(wordReminderId1),
        user_id: Number(wordReminder1.user_id),
        reminder: wordReminder1.reminder,
        is_active: wordReminder1.is_active,
        has_reminder_onload: wordReminder1.has_reminder_onload,
        finish: wordReminder1.finish,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("deleteById", () => {
    it("deletes word reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await wordReminderQueries.create(wordReminder1);

      await wordReminderQueries.deleteById(wordReminderId1);

      const wordReminder = await wordReminderQueries.getById(wordReminderId1);
      expect(wordReminder).toBeUndefined();
    });

    it("does nothing if the word reminder does not exist", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const wordReminder = await wordReminderQueries.deleteById("2");

      expect(wordReminder).toBeUndefined();
    });
  });

  describe("deleteAllByUserId", () => {
    it("deletes all of the user's word reminders", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      const wordReminder = await wordReminderQueries.create(wordReminder1);

      const deletedWordReminders = await wordReminderQueries.deleteAllByUserId(
        sampleUser1.id
      );

      expect(deletedWordReminders).toEqual([wordReminder]);
    });
  });

  describe("getById", () => {
    it("gets the word reminder by ID", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await wordReminderQueries.create(wordReminder1);

      const wordReminder = await wordReminderQueries.getById(wordReminderId1);

      const createdAtTimestamp = new Date(wordReminder!.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: Number(wordReminderId1),
        user_id: Number(wordReminder1.user_id),
        reminder: wordReminder1.reminder,
        is_active: wordReminder1.is_active,
        has_reminder_onload: wordReminder1.has_reminder_onload,
        finish: wordReminder1.finish,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("returns undefined when the word reminder does not exist", async () => {
      const wordReminder = await wordReminderQueries.getById("2");

      expect(wordReminder).toBeUndefined();
    });
  });

  describe("update", () => {
    it("updates word reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await wordReminderQueries.create(wordReminder1);

      const wordReminder = await wordReminderQueries.update({
        id: wordReminderId1,
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        reminder: "every 2 hours",
        is_active: true,
        has_reminder_onload: true,
      });

      const createdAtTimestamp = new Date(wordReminder!.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: Number(wordReminderId1),
        user_id: Number(wordReminder1.user_id),
        finish: expect.any(Date),
        reminder: "every 2 hours",
        is_active: true,
        has_reminder_onload: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("does nothing if the word reminder does not exist", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const wordReminder = await wordReminderQueries.update({
        id: wordReminderId1,
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        reminder: "every 2 hours",
        is_active: true,
        has_reminder_onload: true,
      });

      expect(wordReminder).toBeUndefined();
    });
  });
});
