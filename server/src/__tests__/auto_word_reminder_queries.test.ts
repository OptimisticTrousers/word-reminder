import { userQueries } from "../db/user_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";
import { Order } from "common";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { addToDateQueries } from "../db/add_to_date_queries";
import { addToDatesAutoWordRemindersQueries } from "../db/add_to_dates_auto_word_reminders_queries";

describe("autoWordReminderQueries", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const reminderId = "1";
  const durationId = "2";

  const autoWordReminderId1 = "1";
  const autoWordReminder1 = {
    user_id: sampleUser1.id,
    finish: new Date(Date.now() + 1000),
    is_active: true,
    has_reminder_onload: true,
    has_learned_words: true,
    order: Order.Newest,
    word_count: 7,
  };

  // option for including duplicate words in the auto create
  describe("create", () => {
    it("creates auto word reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });

      const autoWordReminder = await autoWordReminderQueries.create(
        autoWordReminder1
      );

      const createdAtTimestamp = new Date(
        autoWordReminder!.created_at
      ).getTime();
      const updatedAtTimestamp = new Date(
        autoWordReminder!.updated_at
      ).getTime();
      const nowTimestamp = Date.now();
      expect(autoWordReminder).toEqual({
        id: Number(autoWordReminderId1),
        user_id: Number(autoWordReminder1.user_id),
        is_active: autoWordReminder1.is_active,
        has_reminder_onload: autoWordReminder1.has_reminder_onload,
        has_learned_words: autoWordReminder1.has_learned_words,
        order: autoWordReminder1.order,
        word_count: autoWordReminder1.word_count,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("getByUserId", () => {
    it("gets auto word reminders by user id", async () => {
      const reminder1 = {
        minutes: 0,
        hours: 0,
        days: 0,
        weeks: 0,
        months: 0,
      };
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await addToDateQueries.create(reminder1);
      await addToDateQueries.create(reminder1);
      const autoWordReminder = await autoWordReminderQueries.create(
        autoWordReminder1
      );
      await addToDatesAutoWordRemindersQueries.create({
        auto_word_reminder_id: autoWordReminderId1,
        reminder_id: reminderId,
        duration_id: durationId,
      });

      const addToDatesAutoWordReminders =
        await autoWordReminderQueries.getByUserId(sampleUser1.id);

      expect(addToDatesAutoWordReminders).toEqual([autoWordReminder]);
    });
  });

  describe("deleteById", () => {
    it("deletes word reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await wordReminderQueries.create(autoWordReminder1);

      await wordReminderQueries.deleteById(autoWordReminderId1);

      const wordReminder = await wordReminderQueries.getById(
        autoWordReminderId1
      );
      expect(wordReminder).toBeUndefined();
    });
  });

  describe("getById", () => {
    it("gets the auto word reminder by ID", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await autoWordReminderQueries.create(autoWordReminder1);

      const wordReminder = await autoWordReminderQueries.getById(
        autoWordReminderId1
      );

      const createdAtTimestamp = new Date(wordReminder!.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: Number(autoWordReminderId1),
        user_id: Number(autoWordReminder1.user_id),
        is_active: autoWordReminder1.is_active,
        has_reminder_onload: autoWordReminder1.has_reminder_onload,
        has_learned_words: autoWordReminder1.has_learned_words,
        word_count: autoWordReminder1.word_count,
        order: autoWordReminder1.order,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("update", () => {
    it("updates word reminder", async () => {
      await userQueries.create({
        email: sampleUser1.email,
        password: sampleUser1.password,
      });
      await wordReminderQueries.create(autoWordReminder1);

      const wordReminder2 = {
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
      const wordReminder = await wordReminderQueries.updateById(
        autoWordReminderId1,
        wordReminder2
      );

      const createdAtTimestamp = new Date(wordReminder!.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder!.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: Number(autoWordReminderId1),
        user_id: Number(autoWordReminder1.user_id),
        finish: wordReminder2.finish,
        is_active: true,
        has_reminder_onload: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });
});
