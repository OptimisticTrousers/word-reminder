import { Router } from "express";

import { isAuthenticated } from "../middleware/is_authenticated";
import { sessionRouter } from "./session";
import { subscriptionRouter } from "./subscriptions";
import { userRouter } from "./users";

export const router = Router({ caseSensitive: true });

router.use("/sessions", sessionRouter);
router.use("/users", userRouter);
router.use("/subscriptions", isAuthenticated, subscriptionRouter);
