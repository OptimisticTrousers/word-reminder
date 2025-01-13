import asyncHandler from "express-async-handler";
import { body, query } from "express-validator";

import { upload } from "../config/multer";
import { Result, UserWord, userWordQueries } from "../db/user_word_queries";
import { Word, wordQueries } from "../db/word_queries";
import { CustomBadRequestError } from "../errors/custom_bad_request_error";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { csv } from "../utils/csv";
import { http } from "../utils/http";

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
        throw new CustomBadRequestError("Word or CSV file is required.");
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
    const {
      records,
      error,
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

    const invalidWords: string[] = [];
    let wordCount = 0;

    for (const record of records) {
      for (const word of record) {
        // Check if the word already exists in the database
        const existingWord: Word | undefined = await wordQueries.getByWord(
          word
        );
        if (existingWord) {
          // Create user word and increment count if successful
          const userWord: UserWord | undefined = await userWordQueries.create({
            user_id: userId,
            word_id: existingWord.id,
            learned: false,
          });

          /* Increment the word count only if a new user word was successfully created. From the perspective of the user, they only care if a user word was created for their own dictionary, not if a word was created. */
          if (userWord) wordCount++;

          continue;
        }

        const { json } = await http.get(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );

        /* If the word is invalid, add it to the `invalidWords` array and continue processing. There is no reason to create a word or a user word if the word is invalid. */
        if (json.message) {
          invalidWords.push(word);
          continue;
        }

        const newWord: Word = await wordQueries.create({ json });

        const userWord: UserWord = await userWordQueries.create({
          user_id: userId,
          word_id: newWord.id,
          learned: false,
        });

        /* Increment the word count only if a new user word was successfully created. From the perspective of the user, they only care if a user word was created for their own dictionary, not if a word was created. */
        if (userWord) wordCount++;
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

    res.status(200).json({ message: `${wordCount} words have been created.` });
  }),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { word } = req.body;

    const existingWord: Word | undefined = await wordQueries.getByWord(word);

    if (existingWord) {
      await userWordQueries.create({
        user_id: userId,
        word_id: existingWord.id,
        learned: false,
      });

      res.status(200).json({ word: existingWord });
      return;
    }

    const { json } = await http.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    // Handle API error response
    if (json.message) {
      res.status(400).json({ message: json.message });
      return;
    }

    const newWord: Word = await wordQueries.create({ json });

    // Associate the new word with the user
    await userWordQueries.create({
      user_id: userId,
      word_id: newWord.id,
      learned: false,
    });

    res.status(200).json({ word: newWord });
  }),
];

// @desc    Delete single user word
// @route   DELETE /api/users/:userId/words/:wordId
// @access  Private
export const delete_user_word = asyncHandler(async (req, res) => {
  const userId: string = req.params.userId;
  const wordId: string = req.params.wordId;
  const userWord: UserWord = await userWordQueries.delete({
    user_id: userId,
    word_id: wordId,
  });

  res.status(200).json({ userWord });
});

// @desc    Get all words
// @route   GET /api/users/:userId/words
// @query   column, direction, table, learned, limit, page, search
// @access  Private
export const word_list = [
  query("learned")
    .optional()
    .isBoolean()
    .withMessage("'learned' must be a boolean."),
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

    const result: Result = await userWordQueries.getByUserId(userId, options);

    res.status(200).json(result);
  }),
];
