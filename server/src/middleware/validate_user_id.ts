import asyncHandler from "express-async-handler";

import { userQueries } from "../db/user_queries";

export const validateUserId = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (isNaN(Number(userId))) {
    res.status(400).json({ message: "Invalid user ID." });
    return;
  }

  const user = await userQueries.getById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  next();
});
