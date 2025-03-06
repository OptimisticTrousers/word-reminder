import { Router } from "express";

import { send_email } from "../controllers/email_controller";
import { createQueue } from "../middleware/create_queue";

export const emailRouter = Router({ caseSensitive: true });

createQueue("email-queue");
emailRouter.route("/").post(send_email);
