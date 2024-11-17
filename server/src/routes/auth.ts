import { Router } from "express";
import {
  current_user,
  login_user,
  logout_user,
  signup_user,
} from "../controllers/sessionController";

const router = Router();

router.route("/current").get(current_user);
router.route("/login").post(login_user);
router.route("/logout").get(logout_user);
router.route("/signup").post(signup_user);

export default router;
