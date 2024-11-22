import { Router } from "express";

import sessionRouter from "./session";
import userRouter from "./users";

const router: Router = Router();

router.use("/sessions", sessionRouter);
router.use("/users", userRouter);

export default router;
