import { Router } from "express";
import { user_delete, user_update } from "../controllers/userController";
import wordRouter from "./words";
import wordsByDurationRouter from "./wordsByDuration";

const router = Router();

router.route("/:userId").get(user_delete).delete(user_update);
router.use("/:userId/words", wordRouter);
router.use("/:userId/wordsByDuration", wordsByDurationRouter);

export default router;
