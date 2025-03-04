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
import { validateWordReminder } from "../middleware/validate_word_reminder";
import { validateWordReminderId } from "../middleware/validate_word_reminder_id";
import { errorValidationHandler } from "../middleware/error_validation_handler";

export const wordReminderRouter = Router({
  caseSensitive: true,
  mergeParams: true,
});

wordReminderRouter
  .route("/")
  .get(
    validatePageQuery,
    validateSortQuery,
    errorValidationHandler,
    word_reminder_list
  )
  .post(validateWordReminder, errorValidationHandler, create_word_reminder)
  .delete(delete_word_reminders);

wordReminderRouter
  .route("/:wordReminderId")
  .get(validateWordReminderId, errorValidationHandler, get_word_reminder)
  .put(
    validateWordReminderId,
    validateWordReminder,
    errorValidationHandler,
    update_word_reminder
  )
  .delete(validateWordReminderId, errorValidationHandler, delete_word_reminder);
