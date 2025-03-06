import { Router } from "express";

import { autoWordReminderRouter } from "./auto_word_reminders";
import { logout_user } from "../controllers/session_controller";
import {
  delete_user,
  signup_user,
  update_user,
} from "../controllers/user_controller";
import { emailRouter } from "./emails";
import { createQueue } from "../middleware/create_queue";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { isAuthenticated } from "../middleware/is_authenticated";
import { validateUserId } from "../middleware/validate_user_id";
import { userWordRouter } from "./user_words";
import { wordReminderRouter } from "./word_reminders";

export const userRouter = Router({ caseSensitive: true });

userRouter.route("/").post(signup_user);

userRouter
  .route("/:userId")
  .put(isAuthenticated, validateUserId, errorValidationHandler, update_user)
  .delete(
    isAuthenticated,
    validateUserId,
    errorValidationHandler,
    delete_user,
    logout_user
  );

userRouter.use(
  "/:userId/userWords",
  isAuthenticated,
  validateUserId,
  errorValidationHandler,
  userWordRouter
);

userRouter.use(
  "/:userId/wordReminders",
  isAuthenticated,
  validateUserId,
  errorValidationHandler,
  createQueue("word-reminder-queue"),
  wordReminderRouter
);

userRouter.use(
  "/:userId/autoWordReminders",
  isAuthenticated,
  validateUserId,
  errorValidationHandler,
  createQueue("auto-word-reminder-queue"),
  autoWordReminderRouter
);

userRouter.use("/:userId/emails", emailRouter);
