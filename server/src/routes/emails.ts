import { Router } from "express";

import { send_email } from "../controllers/email_controller";
import { createQueue } from "../middleware/create_queue";

export const emailRouter = Router({ caseSensitive: true, mergeParams: true });

emailRouter.route("/").post(createQueue("email-queue"), send_email);
