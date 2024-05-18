import { parse } from "csv-parse";
import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import upload from "../config/multer";
import UserWord from "../models/userWord";
import Word from "../models/word";
import { CustomError } from "../utils/types";

const createWord = async (userId: string, word: string) => {
  const callback = async (userId: string, word: string) => {
    const data = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    const json = await data.json();
    if (json.message) return null;
    return {
      word: json.word,
      origin: json.origin,
      meanings: json.meanings,
      audio: json.phonetics[0].audio,
    };
  };
  const options = { upsert: true, new: true };
  const wordData = await callback(userId, word);
  if (!wordData) return null;
  await Word.findOneAndUpdate({ word }, wordData, options);
  const userWord = await UserWord.findOneAndUpdate(
    { userId, word: wordData },
    { ...options, setDefaultsOnInsert: true }
  );
  return userWord;
};

// @desc Add new word
// @route POST /api/users/:userId/words
// @access Private
export const word_create = [
  upload.single("file"),
  // Check for either post text or image upload to allow a user to post image only or text only, but not a post with neither
  body("word")
    .trim()
    .escape()
    .custom((value, { req }) => {
      if ((!value || value.length === 0) && !req.file) {
        // neither text nor image has been provided
        const error = new Error("Word or CSV file is required");
        (error as CustomError).status = 400;
        throw error;
      }
      // User has included one of either text or image. Continue with request handling
      return true;
    }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
      return;
    }
    next();
  }),
  // @desc    Upload files in order to add them into the database
  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    // If a CSV file is not provided, then go to the next request handler
    if (!req.file) {
      next();
      return;
    }
    const words: string[] = [];
    let invalidWords = 0;
    const parser = parse({
      delimiter: ",",
      relax_column_count: true, // Relax column count to avoid errors with varying columns
      skip_empty_lines: true, // Skip any empty lines in the file
      trim: true, // Automatically trim values
    });

    // Use the readable stream api to consume records
    parser.on("readable", async () => {
      let record;
      while ((record = parser.read()) !== null) {
        // Assuming each record could have multiple columns but you want the first column
        let word;
        if (record.length > 1) {
          for (let i = 0; i < record.length; i++) {
            word = record[i];
            console.log(word);
            words.push(word);
            const newWord = await createWord(userId, word);
            if (newWord) {
              invalidWords++;
            }
          }
        } else {
          word = record[0];
          console.log(word);
          words.push(word); // Capture only the first column if there are multiple
          const newWord = await createWord(userId, word);
          if (newWord) {
            invalidWords++;
          }
        }
      }
    });

    // Catch any error
    parser.on("error", (err) => {
      console.error(err.message);
      res.status(500).json({ message: `Parsing error: ${err.message}` });
    });

    parser.on("end", async () => {
      const length = words.length;
      const validWords = length - invalidWords;
      res.status(200).json({ valid: validWords, invalid: invalidWords });
    });
    // Write buffer to parser and end
    parser.write(req.file.buffer.toString());
    parser.end();
  }),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { word } = req.body;
    const newWord = await createWord(userId, word);
    res.status(200).json(newWord);
  }),
];

// @desc    Delete single word
// @route   DELETE /api/users/:userId/words/:wordId
// @access  Private
export const word_delete = asyncHandler(async (req, res) => {
  const { wordId, userId } = req.params;
  const deletedWord = await UserWord.deleteOne({ userId, word: wordId }).exec();

  res.status(200).json(deletedWord);
});

// @desc    Get all words
// @route   GET /api/users/:userId/words
// @access  Private
export const word_list = [
  query("search").optional().trim().escape().isString(),
  query("sort").optional().trim().escape().isString(),
  query("learned").optional().isBoolean(),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { sort, search, learned } = req.query;
    if (search) {
      const words = await UserWord.aggregate([
        {
          $match: {
            userId,
          },
        },
        {
          $search: {
            index: "word_storer-userWords-static",
            text: {
              query: search,
              path: ["word", "origin", "meanings.definitions"],
            },
          },
        },
        {
          $set: {
            score: {
              $meta: "searchScore",
            },
          },
        },
      ]).exec();
      res.status(200).json(words);
      return;
    }
    let sortOptions = {};
    switch (sort) {
      case "alphabeticallyAscending":
        sortOptions = { word: 1 };
        break;
      case "alphabeticallyDescending":
        sortOptions = { word: -1 };
        break;
      case "ascending":
        sortOptions = { created_at: 1 };
        break;
      case "descending":
        sortOptions = { created_at: -1 };
        break;
      default:
        break;
    }
    let fields = {};
    if (learned) {
      fields = { learned };
    }
    const words = await UserWord.find({ userId, ...fields })
      .sort(sortOptions)
      .exec();
    res.status(200).json(words);
  }),
];
