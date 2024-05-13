import { Router } from "express";
import {
  login_user,
  logout_user,
  register_user,
} from "../controllers/authController";

const router = Router();

router.post("/login", login_user);
router.get("/logout", logout_user);
router.post("/register", register_user);

export default router;
