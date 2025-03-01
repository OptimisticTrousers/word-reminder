import { userQueries } from "../db/user_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("wordReminderQueries", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminderId1 = "1";
  const wordReminder1 = {
    user_id: sampleUser1.id,
    finish: new Date(Date.now() + 1000),
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

      const wordReminder2 = {
        id: wordReminderId1,
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
      const wordReminder = await wordReminderQueries.update(wordReminder2);

      const createdAtTimestamp = new Date(wordReminder!.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: Number(wordReminderId1),
        user_id: Number(wordReminder1.user_id),
        finish: wordReminder2.finish,
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
        finish: new Date(Date.now() + 1000),
        is_active: true,
        has_reminder_onload: true,
      });

      expect(wordReminder).toBeUndefined();
    });
  });
});
