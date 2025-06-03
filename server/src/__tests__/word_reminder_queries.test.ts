/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { userQueries } from "../db/user_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

const userId = 1;
const userParams = {
  id: 1,
  email: "email@protonmail.com",
  password: "password",
};

const wordReminderId = 1;
const wordReminderParams = {
  user_id: userId,
  finish: new Date(Date.now() + 1000),
  is_active: true,
  has_reminder_onload: true,
  reminder: "* * * * *",
};

describe("wordReminderQueries", () => {
  describe("create", () => {
    it("creates word reminder", async () => {
      await userQueries.create(userParams);

      const wordReminder = await wordReminderQueries.create(wordReminderParams);

      const createdAtTimestamp = new Date(wordReminder.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: wordReminderId,
        user_id: wordReminderParams.user_id,
        is_active: wordReminderParams.is_active,
        reminder: wordReminderParams.reminder,
        has_reminder_onload: wordReminderParams.has_reminder_onload,
        finish: wordReminderParams.finish,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("does not allow the user to create an active word reminder when one is already active", async () => {
      await userQueries.create(userParams);

      await wordReminderQueries.create(wordReminderParams);

      await expect(async () => {
        await wordReminderQueries.create(wordReminderParams);
      }).rejects.toThrow(
        'duplicate key value violates unique constraint "word_reminders_is_active_idx"'
      );
    });
  });

  describe("deleteByUserId", () => {
    it("deletes all of the user's word reminders", async () => {
      await userQueries.create(userParams);
      const wordReminder = await wordReminderQueries.create(wordReminderParams);

      const deletedWordReminders = await wordReminderQueries.deleteByUserId(
        userId
      );

      expect(deletedWordReminders).toEqual([wordReminder]);
    });
  });

  describe("updateById", () => {
    it("updates word reminder", async () => {
      await userQueries.create(userParams);
      await wordReminderQueries.create(wordReminderParams);

      const newWordReminderParams = {
        finish: new Date(Date.now() + 1000),
        reminder: "* * * * *",
        is_active: true,
        has_reminder_onload: true,
      };
      const wordReminder = await wordReminderQueries.updateById(
        wordReminderId,
        newWordReminderParams
      );

      const createdAtTimestamp = new Date(wordReminder.created_at).getTime();
      const updatedAtTimestamp = new Date(wordReminder.updated_at).getTime();
      const nowTimestamp = Date.now();
      expect(wordReminder).toEqual({
        id: wordReminderId,
        user_id: wordReminderParams.user_id,
        reminder: wordReminderParams.reminder,
        finish: newWordReminderParams.finish,
        is_active: newWordReminderParams.is_active,
        has_reminder_onload: newWordReminderParams.has_reminder_onload,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(Math.abs(createdAtTimestamp - nowTimestamp)).toBeLessThan(1000);
      expect(Math.abs(updatedAtTimestamp - nowTimestamp)).toBeLessThan(1000);
    });

    it("does not allow the user to update a word reminder to active when one is already active", async () => {
      await userQueries.create(userParams);

      const newWordReminderParams = {
        finish: new Date(Date.now() + 1000),
        reminder: "* * * * *",
        is_active: true,
        has_reminder_onload: true,
      };
      await wordReminderQueries.create({
        ...wordReminderParams,
        is_active: false,
      });
      await wordReminderQueries.create(wordReminderParams);

      await expect(async () => {
        await wordReminderQueries.updateById(
          wordReminderId,
          newWordReminderParams
        );
      }).rejects.toThrow(
        'duplicate key value violates unique constraint "word_reminders_is_active_idx"'
      );
    });
  });
});
