import { Router } from "express";

import { isAuthenticated } from "../middleware/isAuthenticated";
import {
  current_user,
  login_user,
  logout_user,
} from "../controllers/sessionController";
import { validateUser } from "../middleware/validateUser";

const router: Router = Router();

router
  .route("/")
  .post(validateUser, login_user)
  .get(isAuthenticated, current_user)
  .delete(isAuthenticated, logout_user);

export default router;
