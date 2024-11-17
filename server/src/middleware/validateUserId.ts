import asyncHandler from "express-async-handler";

import { UserQueries } from "../db/userQueries";

const userQueries = new UserQueries();

export const validateUserId = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  if (isNaN(Number(userId))) {
    res.status(400).json({ message: "Invalid user ID." });
    return;
  }

  const user = await userQueries.userExistsById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  next();
});
