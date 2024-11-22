import asyncHandler from "express-async-handler";

import { WordQueries } from "../db/wordQueries";

export const validateWordId = asyncHandler(
  async (req, res, next): Promise<void> => {
    const wordId: string = req.params.wordId;
    if (isNaN(Number(wordId))) {
      res.status(400).json({ message: "Invalid word ID." });
      return;
    }

    const wordQueries = new WordQueries();
    const wordExists = await wordQueries.wordExistsById(wordId);
    if (!wordExists) {
      res.status(404).json({ message: "Word not found." });
      return;
    }

    next();
  }
);
