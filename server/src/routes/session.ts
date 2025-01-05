import { Router } from "express";

import {
  current_user,
  login_user,
  logout_user,
} from "../controllers/session_controller";
import { isAuthenticated } from "../middleware/is_authenticated";

export const sessionRouter = Router();

sessionRouter
  .route("/")
  .post(login_user)
  .get(isAuthenticated, current_user)
  .delete(isAuthenticated, logout_user);
