import asyncHandler from "express-async-handler";

import { WordQueries } from "../db/wordQueries";

const wordQueries = new WordQueries();

export const validateWordId = asyncHandler(async (req, res, next) => {
  const wordId = req.params.wordId;
  if (isNaN(Number(wordId))) {
    res.status(400).json({ message: "Invalid word ID." });
    return;
  }

  const word = await wordQueries.wordExistsById(wordId);
  if (!word) {
    res.status(404).json({ message: "Word not found." });
    return;
  }

  next();
});
