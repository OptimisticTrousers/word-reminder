const { Router } = require("express");
const wordRouter = require("./words");
const userRouter = require("./users");

const router = Router();

router.use("/words", wordRouter);
router.use("/users", userRouter);

module.exports = router;