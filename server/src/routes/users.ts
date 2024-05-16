import { Router } from "express";
import {
  user_delete,
  user_detail,
  user_update,
} from "../controllers/userController";
import wordRouter from "./words";

const router = Router();

router.route("/:userId").get(user_delete).put(user_detail).delete(user_update);
router.use("/:userId/words", wordRouter);

export default router;
