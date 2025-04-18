import { Router } from "express";

import { create_subscription } from "../controllers/subscription_controller";

export const subscriptionRouter = Router({
  caseSensitive: true,
  mergeParams: true,
});

subscriptionRouter.route("/").post(create_subscription);
