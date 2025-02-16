import { Router } from "express";

import { send_email, verify_email } from "../controllers/email_controller";

export const emailRouter = Router({ caseSensitive: true });

emailRouter.route("/emails").post(send_email);
emailRouter.route("/emails/:token").post(verify_email);
