import { Router } from "express";
import authRouter from "./auth";
import userRouter from "./users";
import wordRouter from "./words";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/words", wordRouter);

export default router;
