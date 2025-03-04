import asyncHandler from "express-async-handler";

import { userWordQueries } from "../db/user_word_queries";

export const validateUserWordId = asyncHandler(async (req, res, next) => {
  const userWordId = Number(req.params.userWordId);

  if (isNaN(userWordId)) {
    res.status(400).json({ message: "Invalid user word ID." });
    return;
  }

  const userWord = await userWordQueries.getById(userWordId);

  if (!userWord) {
    res.status(404).json({ message: "User word not found." });
    return;
  }

  next();
});
