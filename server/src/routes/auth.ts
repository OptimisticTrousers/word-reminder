import { Router } from "express";
import {
  current_user,
  login_user,
  logout_user,
  signup_user,
} from "../controllers/authController";

const router = Router();

router.get("/current", current_user);
router.post("/login", login_user);
router.get("/logout", logout_user);
router.post("/signup", signup_user);

export default router;
