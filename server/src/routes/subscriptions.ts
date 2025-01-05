import { Router } from "express";

import { create_subscription } from "../controllers/subscription_controller";

export const subscriptionRouter = Router();

subscriptionRouter.route("/").post(create_subscription);
