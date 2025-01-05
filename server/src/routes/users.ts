import { Router } from "express";

import { logout_user } from "../controllers/sessionController";
import {
  delete_user,
  signup_user,
  update_user,
} from "../controllers/userController";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { validateUser } from "../middleware/validateUser";
import { validateUserId } from "../middleware/validateUserId";
import emailRouter from "./emails";
import wordReminderRouter from "./wordReminders";
import wordRouter from "./words";

const router: Router = Router();

router.route("/").post(validateUser, signup_user);
router.route("/:userId").put(update_user);
router
  .route("/:userId")
  .delete(isAuthenticated, validateUserId, delete_user, logout_user);
router.use("/:userId/words", isAuthenticated, wordRouter);
router.use("/:userId/wordReminders", isAuthenticated, wordReminderRouter);
router.use("/:userId/emails", isAuthenticated, emailRouter);

export default router;
