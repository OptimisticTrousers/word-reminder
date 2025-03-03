import { Router } from "express";

import { isAuthenticated } from "../middleware/is_authenticated";
import { sessionRouter } from "./session";
import { subscriptionRouter } from "./subscriptions";
import { userRouter } from "./users";

export const apiRouter = Router({ caseSensitive: true });

apiRouter.use("/sessions", sessionRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/subscriptions", isAuthenticated, subscriptionRouter);
