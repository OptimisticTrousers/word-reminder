/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SortMode } from "common";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { userQueries } from "../db/user_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

const userId = 1;
const userParams = {
  email: "email@protonmail.com",
  password: "password",
};

const autoWordReminderId = 1;
const autoWordReminderParams = {
  user_id: userId,
  is_active: true,
  has_reminder_onload: true,
  has_learned_words: true,
  sort_mode: SortMode.Newest,
  word_count: 7,
  reminder: "* * * * * ",
  duration: 3600000,
};

describe("autoWordReminderQueries", () => {
  describe("create", () => {
    it("creates auto word reminder", async () => {
      await userQueries.create(userParams);

      const autoWordReminder = await autoWordReminderQueries.create(
        autoWordReminderParams
      );

      const createdAtTimestamp = new Date(
        autoWordReminder.created_at
      ).getTime();
      const updatedAtTimestamp = new Date(
        autoWordReminder.updated_at
      ).getTime();
      const nowTimestamp = Date.now();
      expect(autoWordReminder).toEqual({
        id: autoWordReminderId,
        user_id: autoWordReminderParams.user_id,
        is_active: autoWordReminderParams.is_active,
        has_reminder_onload: autoWordReminderParams.has_reminder_onload,
        has_learned_words: autoWordReminderParams.has_learned_words,
        duration: autoWordReminderParams.duration,
        reminder: autoWordReminderParams.reminder,
        sort_mode: autoWordReminderParams.sort_mode,
        word_count: autoWordReminderParams.word_count,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });

  describe("deleteByUserId", () => {
    it("deletes auto word reminders by user id", async () => {
      await userQueries.create(userParams);
      const newAutoWordReminder = await autoWordReminderQueries.create(
        autoWordReminderParams
      );

      const deletedAutoWordReminder =
        await autoWordReminderQueries.deleteByUserId(userId);
      const autoWordReminder = await autoWordReminderQueries.getById(
        deletedAutoWordReminder.id
      );

      expect(deletedAutoWordReminder).toEqual(newAutoWordReminder);
      expect(autoWordReminder).toBeUndefined();
    });
  });

  describe("getByUserId", () => {
    it("gets auto word reminders by user id", async () => {
      await userQueries.create(userParams);
      const autoWordReminder = await autoWordReminderQueries.create(
        autoWordReminderParams
      );

      const addToDatesAutoWordReminders =
        await autoWordReminderQueries.getByUserId(userId);

      expect(addToDatesAutoWordReminders).toEqual([autoWordReminder]);
    });
  });

  describe("updateById", () => {
    it("updates word reminder", async () => {
      await userQueries.create(userParams);
      await autoWordReminderQueries.create(autoWordReminderParams);

      const newAutoWordReminderParams = {
        is_active: false,
        has_reminder_onload: false,
        has_learned_words: false,
        sort_mode: SortMode.Random,
        word_count: 5,
        reminder: "0 * * * * ",
        duration: 1800000,
      };
      const wordReminder = await autoWordReminderQueries.updateById(
        autoWordReminderId,
        newAutoWordReminderParams
      );

      const createdAtTimestamp = new Date(wordReminder.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: autoWordReminderId,
        user_id: autoWordReminderParams.user_id,
        is_active: newAutoWordReminderParams.is_active,
        has_reminder_onload: newAutoWordReminderParams.has_reminder_onload,
        has_learned_words: newAutoWordReminderParams.has_learned_words,
        sort_mode: newAutoWordReminderParams.sort_mode,
        word_count: newAutoWordReminderParams.word_count,
        reminder: newAutoWordReminderParams.reminder,
        duration: newAutoWordReminderParams.duration,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });
  });
});
