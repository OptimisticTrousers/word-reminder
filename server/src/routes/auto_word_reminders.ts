import { Router } from "express";

import {
  create_auto_word_reminder,
  delete_auto_word_reminder,
  get_auto_word_reminder,
  update_auto_word_reminder,
} from "../controllers/auto_word_reminder_controller";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { validateAutoWordReminderId } from "../middleware/validate_auto_word_reminder_id";
import { validateAutoWordReminder, validateOptions } from "../middleware/validate_word_reminder";

export const autoWordReminderRouter = Router({
  caseSensitive: true,
  mergeParams: true,
});

autoWordReminderRouter
  .route("/")
  .get(get_auto_word_reminder)
  .post(
    validateAutoWordReminder,
    validateOptions,
    errorValidationHandler,
    create_auto_word_reminder
  );
autoWordReminderRouter
  .route("/:autoWordReminderId")
  .put(
    validateAutoWordReminderId,
    validateAutoWordReminder,
    validateOptions,
    errorValidationHandler,
    update_auto_word_reminder
  )
  .delete(
    validateAutoWordReminderId,
    errorValidationHandler,
    delete_auto_word_reminder
  );
