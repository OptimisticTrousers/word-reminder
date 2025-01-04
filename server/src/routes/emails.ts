import { Router } from "express";

import { send_email, verify_email } from "../controllers/emailController";

const router = Router();

router.route("/emails").post(send_email);
router.route("/emails/:token").post(verify_email);

export default router;
