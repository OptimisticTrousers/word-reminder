import { Router } from "express";
import {
  user_delete,
  user_detail,
  user_update,
} from "../controllers/userController";

const router = Router();

router.route("/:userId").get(user_delete).put(user_detail).delete(user_update);

export default router;
