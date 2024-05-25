import { Router } from "express";
import {
  login_user,
  logout_user,
  register_user,
} from "../controllers/authController";
import { user_detail } from "../controllers/userController";

const router = Router();

router.post("/login", login_user);
router.get("/logout", logout_user);
router.post("/register", register_user);
router.get("/current", user_detail);

export default router;
