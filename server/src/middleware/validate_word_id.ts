import asyncHandler from "express-async-handler";

import { wordQueries } from "../db/word_queries";

export const validateWordId = asyncHandler(async (req, res, next) => {
  const { wordId } = req.params;
  if (isNaN(Number(wordId))) {
    res.status(400).json({ message: "Invalid word ID." });
    return;
  }

  const word = await wordQueries.getById(wordId);
  if (!word) {
    res.status(404).json({ message: "Word not found." });
    return;
  }

  next();
});
