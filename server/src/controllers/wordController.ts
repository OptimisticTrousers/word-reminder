import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import { parse } from "csv-parse";
import fs from "fs";
import User from "../models/user";
import Word from "../models/word";
import wordsByDuration from "../models/wordsByDuration";
import upload from "../config/multer";
import { CustomError } from "../utils/models";

const createWord = async (word: string) => {
  const callback = async (word: string) => {
    const data = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    const json = await data.json();
    return {
      word: json.word,
      origin: json.origin,
      meanings: json.meanings,
      audio: json.phonetics[0].audio,
    };
  };
  const newWord = new Word(await callback(word));
  await newWord.save();
  return newWord;
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
  // @desc    Upload files in order to add them into the database
  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    // If a CSV file is not provided, then go to the next request handler
    if (!req.file) {
      next();
      return;
    }
    const words: string[] = [];
    const parser = parse({
      delimiter: ",",
      relax_column_count: true, // Relax column count to avoid errors with varying columns
      skip_empty_lines: true, // Skip any empty lines in the file
      trim: true, // Automatically trim values
    });

    // Use the readable stream api to consume records
    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        // Assuming each record could have multiple columns but you want the first column
        if (record.length > 1) {
          for (let i = 0; i < record.length; i++) {
            console.log(record[i]);
            words.push(record[i]);
          }
        } else {
          console.log(record[0]);
          words.push(record[0]); // Capture only the first column if there are multiple
        }
      }
    });

    // Catch any error
    parser.on("error", (err) => {
      console.error(err.message);
      res.status(500).json({ message: `Parsing error: ${err.message}` });
    });

    parser.on("end", async () => {
      const wordDocuments = [];
      for (let i = 0; i < words.length; i++) {
        const wordDocument = await createWord(words[i]);
        wordDocuments.push(wordDocument);
      }
      await User.findByIdAndUpdate(userId, {
        $push: { words: { $each: wordDocuments } },
      }).exec();
      res.status(200).json(wordDocuments);
    });
    // Write buffer to parser and end
    parser.write(req.file.buffer.toString());
    parser.end();
  }),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { word } = req.body;
    let existingWord = await Word.exists({ word }).exec();
    if (!existingWord) {
      await createWord(word);
    }
    await User.findByIdAndUpdate(userId, { $push: { words: existingWord } });
    res.status(200).json(word);
  }),
];

// @desc    Delete single word
// @route   DELETE /api/users/:userId/words/:wordId
// @access  Private
export const word_delete = asyncHandler(async (req, res) => {
  const { wordId } = req.params;
  const deletedWord = await Word.findByIdAndDelete(wordId).exec();

  res.status(200).json(deletedWord);
});

// @desc    Get all words
// @route   GET /api/users/:userId/words
// @access  Private
export const word_list = [
  query("search").optional().trim().escape().isString(),
  query("filter").optional().trim().escape().isString(),
  query("learned").optional().isBoolean(),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { filter, search, learned } = req.query;
    if (search) {
      const words = await User.aggregate([
        {
          $search: {
            index: "word_storer-users-dynamic",
            text: {
              query: search,
              path: "words"
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
    else if (learned) {
      const { words } = await User.find({ _id: userId, "words.learned": learned }, { words: 1 }).exec();
      res.status(200).json(words);
      return;
    }
    let sortOptions = {};
    switch (filter) {
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
        sortOptions = {};
        break;
    }
    const { words } = await User.findById(userId, { words: 1 }).sort(sortOptions).exec();
    res.status(200).json(words);
  }),
];
