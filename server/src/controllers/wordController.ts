import asyncHandler from "express-async-handler";
import { body, query } from "express-validator";

import { upload } from "../config/multer";
import { errorValidationHandler } from "../middleware/errorValidationHandler";
import { UserWordQueries } from "../db/userWordQueries";
import { Csv } from "../utils/csv";
import { Http } from "../utils/http";
import { WordQueries } from "../db/wordQueries";

const userWordQueries = new UserWordQueries();
const wordQueries = new WordQueries();
const http = new Http();

// @desc Add new word and user word
// @route POST /api/users/:userId/words
// @access Private
export const create_word = [
  upload.single("csv"),
  // Check for the user to create a word with either text or csv upload, but with neither
  body("word")
    .trim()
    .escape()
    .toLowerCase()
    .custom((value: string, { req }): Promise<string> | boolean => {
      if ((!value || value.length === 0) && !req.file) {
        // neither word nor csv has been provided
        return Promise.reject("Word or CSV file is required.");
      }
      // User has included one of either word or csv file. Continue with request handling
      return true;
    }),
  errorValidationHandler,
  // @desc    Upload files in order to add them into the database
  asyncHandler(async (req, res, next): Promise<void> => {
    const { userId } = req.params;
    // If a CSV file is not provided, then go to the next request handler
    if (!req.file) {
      next();
      return;
    }
    const csv = new Csv();
    const {
      records,
      error,
      count,
    }: { records: string[][]; error: unknown; count: number } = await csv.read(
      req.file.buffer
    );

    if (error) {
      res.status(400).json({ message: error });
      return;
    }

    if (records.length == 0) {
      res.status(400).json({
        message: "0 words have been created because the CSV file is empty.",
      });
      return;
    }

    const invalidWords = [];
    let wordCount = 0;

    for (let i = 0; i < records.length; i++) {
      for (let j = 0; j < records[i].length; j++) {
        const word = records[i][j];
        const existingWord = await wordQueries.getWordByWord(word);
        let newWord = null;

        if (!existingWord) {
          const { json } = await http.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          /* If the word is invalid, add it to the `invalidWords` array and continue processing. There is no reason to create a word or a user word if the word is invalid. */
          if (json.message) {
            invalidWords.push(word);
            continue;
          }

          // If the word is valid, create it in the database.
          newWord = await wordQueries.createWord(json);
        }

        const userWord = await userWordQueries.createUserWord(
          userId,
          newWord ? newWord.id : existingWord!.id
        );

        /* Increment the word count only if a new user word was successfully created. From the perspective of the user, they only care if a user word was created for their own dictionary, not if a word was created. */
        if (userWord) {
          wordCount++;
        }
      }
    }

    /* Invalid Words Response:
    - Collect all invalid words in one go to avoid multiple server requests.

    - Example: If a CSV file contains 100 words and 10 are invalid, sending all 10 invalid words in one response allows the user to fix them all at once, rather than resubmitting the file repeatedly for each invalid word.

    - Without this approach, the user would have to fix the first invalid word, resubmit, and repeat the process 10 times, significantly increasing the server load and user frustration. */
    if (invalidWords.length > 0) {
      const formatter = new Intl.ListFormat("en", {
        style: "long",
        type: "conjunction",
      });

      res.status(400).json({
        message: `You have value(s) in your CSV file that are not words. Please change them to valid word(s) and re-import your words: ${formatter.format(
          invalidWords
        )}`,
      });
      return;
    }

    /* Existing User Words Response:
    - Process all words in the CSV file, creating new user words for valid entries and skipping duplicates.

    - Example: If the user imports a CSV file with 50 words and 10 already exist in their dictionary, the server creates 40 new entries and informs the user that 10 words were already added previously.

    - This avoids stopping at the first duplicate and provides a summary for the user. */
    if (wordCount < count) {
      res.status(200).json({
        message: `You have already added ${
          count - wordCount
        } of these words in your dictionary. New words have been created if they were not already in your dictionary.`,
      });
      return;
    }

    res.status(200).json({ message: `${wordCount} words have been created.` });
  }),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { word } = req.body;
    const existingWord = await wordQueries.getWordByWord(word);
    let newWord = null;

    if (!existingWord) {
      const { json } = await http.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      if (json.message) {
        res.status(400).json({ message: json.message });
        return;
      }

      newWord = await wordQueries.createWord(json);
    }

    await userWordQueries.createUserWord(
      userId,
      newWord ? newWord.id : existingWord!.id
    );

    res.status(200).json({ word: newWord || existingWord });
  }),
];

// @desc    Delete single user word
// @route   DELETE /api/users/:userId/words/:wordId
// @access  Private
export const delete_user_word = asyncHandler(async (req, res) => {
  const userId: string = req.params.userId;
  const wordId: string = req.params.wordId;
  const userWord = await userWordQueries.deleteUserWord(userId, wordId);

  res.status(200).json({ userWord });
});

// @desc    Get all words
// @route   GET /api/users/:userId/words
// @access  Private
export const word_list = [
  query("column")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("'column' must be a non-empty string."),
  query("direction")
    .optional()
    .trim()
    .escape()
    .isInt()
    .withMessage("'direction' must be an integer."),
  query("table")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("'table' must be a non-empty string."),
  query().custom((_, { req }) => {
    const query = req.query;
    const column = query?.column;
    const direction = query?.direction;
    const table = query?.table;
    const hasSortingParams = column || direction || table;
    const allSortingParamsProvided = column && direction && table;

    if (hasSortingParams && !allSortingParamsProvided) {
      return Promise.reject(
        "'column', 'direction', and 'table' must all be provided together for sorting."
      );
    }

    return true;
  }),
  query("learned")
    .optional()
    .isBoolean()
    .withMessage("'learned' must be a boolean."),
  query("limit").optional().isInt().withMessage("'limit' must be an integer."),
  query("page").optional().isInt().withMessage("'page' must be an integer."),
  query().custom((_, { req }) => {
    const query = req.query;
    const page = query?.page;
    const limit = query?.limit;
    const hasPaginationParams = page || limit;
    const allPaginationParamsProvided = page && limit;

    if (hasPaginationParams && !allPaginationParamsProvided) {
      return Promise.reject(
        "'page' and 'limit' must both be provided for pagination."
      );
    }

    return true;
  }),
  query("search")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("'search' must be a non-empty string."),
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { column, direction, table, learned, limit, page, search } =
      req.query;

    const options = {
      ...(column &&
        direction &&
        table && {
          sort: {
            column: String(column),
            direction: Number(direction),
            table: String(table),
          },
        }),
      ...(learned !== undefined && { learned: Boolean(learned) }),
      ...(limit && page && { limit: Number(limit), page: Number(page) }),
      ...(search && { search: String(search) }),
    };

    const result = await userWordQueries.getUserWordsByUserId(userId, options);

    res.status(200).json(result);
  }),
];
