import { ImageJson, http, WORD_MAX, UserWord } from "common";
import asyncHandler from "express-async-handler";
import { body, query } from "express-validator";

import { upload } from "../config/multer";
import { imageQueries } from "../db/image_queries";
import { Result, userWordQueries } from "../db/user_word_queries";
import { wordQueries } from "../db/word_queries";
import { CustomBadRequestError } from "../errors/custom_bad_request_error";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { API_ENDPOINTS } from "../utils/api";
import { csv } from "../utils/csv";

// @desc Add new word and user word
// @route POST /api/users/:userId/userWords
// @access Private
export const create_user_word = [
  upload.single("csv"),
  // Check for the user to create a word with an exclusive or with text or csv upload
  body("word")
    .trim()
    .escape()
    .toLowerCase()
    .isLength({ max: WORD_MAX })
    .withMessage(`'word' cannot be greater than ${WORD_MAX} characters.`)
    .bail()
    .custom((value: string, { req }) => {
      if ((!value || value.length === 0) && !req.file) {
        throw new CustomBadRequestError("Word or CSV file is required.");
      }
      return true;
    }),
  errorValidationHandler,
  // @desc    Upload files in order to add them into the database
  asyncHandler(async (req, res, next) => {
    const userId = Number(req.params.userId);
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
    let word_count = 0;

    for (const record of records) {
      for (const word of record) {
        const existingWord = await wordQueries.getByWord(word);
        if (existingWord) {
          const userWord = await userWordQueries.create({
            user_id: userId,
            word_id: existingWord.id,
            learned: false,
          });

          if (userWord) word_count++;

          continue;
        }

        const { json: wordJson } = await http.get({
          url: API_ENDPOINTS.dictionary(word),
        });

        // Handle API error response
        if (wordJson.message) {
          invalidWords.push(word);
          continue;
        }

        const newWord = await wordQueries.create({ json: wordJson });

        const { json: imagesJson }: { json: ImageJson } = await http.get({
          url: API_ENDPOINTS.images(word),
        });

        if (imagesJson.query) {
          // 4 images maximum for each word
          const pages = Object.values(imagesJson.query.pages);
          const maximum = Math.min(pages.length, 4);
          for (let i = 0; i < maximum; i++) {
            const page = pages[i];
            const image = {
              url: page.imageinfo[0].url,
              descriptionurl: page.imageinfo[0].descriptionurl,
              comment: page.imageinfo[0].comment ?? page.title,
              word_id: newWord.id,
            };
            await imageQueries.create(image);
          }
        }

        const userWord: UserWord = await userWordQueries.create({
          user_id: userId,
          word_id: newWord.id,
          learned: false,
        });

        if (userWord) word_count++;
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

    res.status(200).json({ message: `${word_count} words have been created.` });
  }),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const { word } = req.body;

    const existingWord = await wordQueries.getByWord(word);

    if (existingWord) {
      await userWordQueries.create({
        user_id: userId,
        word_id: existingWord.id,
        learned: false,
      });

      res.status(200).json({ word: existingWord });
      return;
    }

    const { json: wordJson } = await http.get({
      url: API_ENDPOINTS.dictionary(word),
    });

    // Handle API error response
    if (wordJson.message) {
      res.status(400).json({ message: wordJson.message });
      return;
    }

    const newWord = await wordQueries.create({ json: wordJson });

    const { json: imagesJson }: { json: ImageJson } = await http.get({
      url: API_ENDPOINTS.images(word),
    });

    // 4 images maximum for each word
    if (imagesJson.query) {
      const pages = Object.values(imagesJson.query.pages);
      const maximum = Math.min(pages.length, 4);
      for (let i = 0; i < maximum; i++) {
        const page = pages[i];
        const image = {
          url: page.imageinfo[0].url,
          descriptionurl: page.imageinfo[0].descriptionurl,
          comment: page.imageinfo[0].comment ?? page.title,
          word_id: newWord.id,
        };
        await imageQueries.create(image);
      }
    }

    await userWordQueries.create({
      user_id: userId,
      word_id: newWord.id,
      learned: false,
    });

    res.status(200).json({ word: newWord });
  }),
];

// @desc    Delete single user word
// @route   DELETE /api/users/:userId/userWords/:userWordId
// @access  Private
export const delete_user_word = asyncHandler(async (req, res) => {
  const userWordId = Number(req.params.userWordId);

  const userWord = await userWordQueries.deleteById(userWordId);

  res.status(200).json({ userWord });
});

// @desc    Get single user word
// @route   GET /api/users/:userId/userWords/:userWordId
// @access  Private
export const get_user_word = asyncHandler(async (req, res) => {
  const userWordId = Number(req.params.userWordId);

  const userWord = await userWordQueries.getById(userWordId);
  const word = await wordQueries.getById(userWord!.word_id);
  const images = await imageQueries.getByWordId(userWord!.word_id);

  res.status(200).json({ userWord: { ...userWord, word, images } });
});

// @desc    Get all words
// @route   GET /api/users/:userId/words
// @query   column, direction, table, learned, limit, page, search
// @access  Private
export const user_word_list = [
  query("learned")
    .optional({ values: "falsy" })
    .isBoolean()
    .withMessage("'learned' must be a boolean."),
  query("search")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .notEmpty()
    .withMessage("'search' must be a non-empty string."),
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const { column, direction, learned, limit, page, search } = req.query;

    const options = {
      ...(column &&
        direction && {
          sort: {
            column: String(column),
            direction: Number(direction),
            table: "user_words",
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
