import { Router } from "express";
import {
  create_word_reminder,
  delete_word_reminder,
  delete_word_reminders,
  get_word_reminder,
  word_reminder_list,
  update_word_reminder,
} from "../controllers/wordReminderController";

const router = Router();

router
  .route("/")
  .get(word_reminder_list)
  .post(create_word_reminder)
  .delete(delete_word_reminders);

router
  .route("/:wordReminders")
  .get(get_word_reminder)
  .put(update_word_reminder)
  .delete(delete_word_reminder);

export default router;
