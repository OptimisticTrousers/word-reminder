import { Router } from "express";

import { isAuthenticated } from "../middleware/isAuthenticated";
import sessionRouter from "./session";
import subscriptionRouter from "./subscriptions";
import userRouter from "./users";

const router: Router = Router();

router.use("/sessions", sessionRouter);
router.use("/users", userRouter);
router.use("/subscriptions", isAuthenticated, subscriptionRouter);

export default router;
