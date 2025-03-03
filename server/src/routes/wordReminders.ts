import { Router } from "express";
import {
  create_word_reminder,
  delete_word_reminder,
  delete_word_reminders,
  get_word_reminder,
  update_word_reminder,
  word_reminder_list,
} from "../controllers/word_reminder_controller";
import { validatePageQuery } from "../middleware/validate_page_query";
import { validateSortQuery } from "../middleware/validate_sort_query";
import {
  validateAutoWordReminder,
  validateWordReminder,
} from "../middleware/validate_word_reminder";
import { validateWordReminderId } from "../middleware/validate_word_reminder_id";

export const wordReminderRouter = Router({ caseSensitive: true });

wordReminderRouter
  .route("/")
  .get(validatePageQuery, validateSortQuery, word_reminder_list)
  .post(validateAutoWordReminder, validateWordReminder, create_word_reminder)
  .delete(delete_word_reminders);

wordReminderRouter
  .route("/:wordReminderId")
  .get(validateWordReminderId, get_word_reminder)
  .put(validateWordReminderId, validateWordReminder, update_word_reminder)
  .delete(validateWordReminderId, delete_word_reminder);
