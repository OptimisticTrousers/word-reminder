import { Router } from "express";
import {
  create_word_reminder,
  delete_word_reminder,
  delete_word_reminders,
  word_reminder_list,
  update_word_reminder,
} from "../controllers/wordReminderController";
import { validatePageQuery } from "../middleware/validatePageQuery";
import { validateSortQuery } from "../middleware/validateSortQuery";
import {
  validateAuto,
  validateAutoWordReminder,
  validateWordReminder,
} from "../middleware/validateWordReminder";

const router = Router();

router
  .route("/")
  .get(validatePageQuery, validateSortQuery, word_reminder_list)
  .post(
    validateAuto,
    validateWordReminder,
    validateAutoWordReminder,
    create_word_reminder
  )
  .delete(delete_word_reminders);

router
  .route("/:wordReminders")
  .put(validateWordReminder, update_word_reminder)
  .delete(delete_word_reminder);

export default router;
