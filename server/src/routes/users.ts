import { Router } from "express";

import { logout_user } from "../controllers/session_controller";
import {
  delete_user,
  signup_user,
  update_user,
} from "../controllers/user_controller";
import { emailRouter } from "./emails";
import { isAuthenticated } from "../middleware/is_authenticated";
import { validateUserId } from "../middleware/validate_user_id";
import { wordReminderRouter } from "./wordReminders";
import { wordRouter } from "./words";

export const userRouter = Router();

userRouter.route("/").post(signup_user);

userRouter.route("/:userId").put(update_user);

userRouter
  .route("/:userId")
  .delete(isAuthenticated, validateUserId, delete_user, logout_user);

userRouter.use("/:userId/words", isAuthenticated, wordRouter);

userRouter.use("/:userId/wordReminders", isAuthenticated, wordReminderRouter);

userRouter.use("/:userId/emails", isAuthenticated, emailRouter);
