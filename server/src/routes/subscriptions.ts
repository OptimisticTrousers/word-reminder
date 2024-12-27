import { Router } from "express";

import { create_subscription } from "../controllers/subscriptionController";

const router: Router = Router();

router.route("/").post(create_subscription);

export default router;
