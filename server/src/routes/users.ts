import { Router } from "express";

import { logout_user } from "../controllers/sessionController";
import { delete_user, signup_user } from "../controllers/userController";
import { validateUser } from "../middleware/validateUser";
import { validateUserId } from "../middleware/validateUserId";
import wordRouter from "./words";

const router = Router();

router.route("/").post(validateUser, signup_user);
router.route("/:userId").delete(validateUserId, delete_user, logout_user);
router.use("/:userId/words", wordRouter);
// router.use("/:userId/wordsByDurations", wordsByDurationRouter);

export default router;
