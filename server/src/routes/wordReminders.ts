import { Router } from "express";
import {
  create_word_reminder,
  delete_word_reminder,
  delete_word_reminders,
  update_word_reminder,
  word_reminder_list,
} from "../controllers/word_reminder_controller";
import { validatePageQuery } from "../middleware/validate_page_query";
import { validateSortQuery } from "../middleware/validate_sort_query";
import {
  validateAuto,
  validateAutoWordReminder,
  validateWordReminder,
} from "../middleware/validate_word_reminder";

export const wordReminderRouter = Router();

wordReminderRouter
  .route("/")
  .get(validatePageQuery, validateSortQuery, word_reminder_list)
  .post(
    validateAuto,
    validateAutoWordReminder,
    validateWordReminder,
    create_word_reminder
  )
  .delete(delete_word_reminders);

wordReminderRouter
  .route("/:wordReminders")
  .put(validateWordReminder, update_word_reminder)
  .delete(delete_word_reminder);
