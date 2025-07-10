import { Router } from "express";

import { autoWordReminderRouter } from "./auto_word_reminders";
import { logout_user } from "../controllers/session_controller";
import {
  confirm_account,
  delete_user,
  signup_user,
  update_user,
} from "../controllers/user_controller";
import { emailRouter } from "./emails";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { isAuthenticated } from "../middleware/is_authenticated";
import { validateUserId } from "../middleware/validate_user_id";
import { userWordRouter } from "./user_words";
import { wordReminderRouter } from "./word_reminders";
import { subscriptionRouter } from "./subscriptions";
import { validateToken } from "../middleware/validate_token";
import { fcmTokenRouter } from "./fcmTokens";

export const userRouter = Router({ caseSensitive: true });

userRouter.route("/").post(signup_user);

userRouter
  .route("/:userId")
  .delete(
    isAuthenticated,
    validateUserId,
    errorValidationHandler,
    delete_user,
    logout_user
  );

userRouter
  .route("/:userId&:token")
  .post(validateUserId, errorValidationHandler, update_user);

userRouter
  .route("/verify/:userId&:token")
  .post(validateUserId, validateToken, errorValidationHandler, confirm_account);

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
  wordReminderRouter
);

userRouter.use(
  "/:userId/autoWordReminders",
  isAuthenticated,
  validateUserId,
  errorValidationHandler,
  autoWordReminderRouter
);

userRouter.use("/:userId/emails", emailRouter);

userRouter.use(
  "/:userId/subscriptions",
  validateUserId,
  errorValidationHandler,
  subscriptionRouter
);

userRouter.use(
  "/:userId/fcmTokens",
  validateUserId,
  errorValidationHandler,
  fcmTokenRouter
);
