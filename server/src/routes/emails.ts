import { Router } from "express";

import { send_email } from "../controllers/email_controller";

export const emailRouter = Router({ caseSensitive: true, mergeParams: true });

emailRouter.route("/").post(send_email);
