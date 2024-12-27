import { Router } from "express";

import sessionRouter from "./session";
import userRouter from "./users";
import subscriptionRouter from "./subscriptions";

const router: Router = Router();

router.use("/sessions", sessionRouter);
router.use("/users", userRouter);
router.use("/subscriptions", subscriptionRouter);

export default router;
