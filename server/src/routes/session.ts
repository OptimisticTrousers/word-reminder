import { Router } from "express";

import {
  current_user,
  login_user,
  logout_user,
} from "../controllers/sessionController";
import { validateUser } from "../middleware/validateUser";

const router = Router();

router
  .route("/")
  .post(validateUser, login_user)
  .get(current_user)
  .delete(logout_user);

export default router;
