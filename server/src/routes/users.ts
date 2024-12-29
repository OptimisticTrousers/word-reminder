import { Router } from "express";

import { logout_user } from "../controllers/sessionController";
import { delete_user, signup_user } from "../controllers/userController";
import { validateUser } from "../middleware/validateUser";
import { validateUserId } from "../middleware/validateUserId";
import wordReminderRouter from "./wordReminders";
import wordRouter from "./words";

const router: Router = Router();

router.route("/").post(validateUser, signup_user);
router.route("/:userId").delete(validateUserId, delete_user, logout_user);
router.use("/:userId/words", wordRouter);
router.use("/:userId/wordReminders", wordReminderRouter);

export default router;
