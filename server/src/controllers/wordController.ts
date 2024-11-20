import { parse } from "csv-parse";
import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import { upload } from "../config/multer";
import { Http } from "../utils/http";
// import UserWord from "../models/userWord";
// import Word from "../models/word";

import { UserWordQueries } from "../db/userWordQueries";
import { errorValidationHandler } from "../middleware/errorValidationHandler";
import { Word, WordQueries } from "../db/wordQueries";
import { Csv } from "../utils/csv";

const userWordQueries = new UserWordQueries();
const wordQueries = new WordQueries();
const http = new Http();
const csv = new Csv();

// @desc Add new word and user word
// @route POST /api/users/:userId/words
// @access Private
export const create_word = [
  upload.single("csv"),
  // Check for the user to create a word with either text or csv upload, but with neither
  body("word")
    .trim()
    .escape()
    .custom((value, { req }) => {
      if ((!value || value.length === 0) && !req.file) {
        // neither word nor csv has been provided
        return Promise.reject("Word or CSV file is required.");
      }
      // User has included one of either word or csv file. Continue with request handling
      return true;
    }),
  errorValidationHandler,
  // @desc    Upload files in order to add them into the database
  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    // If a CSV file is not provided, then go to the next request handler
    if (!req.file) {
      next();
      return;
    }
    const { records, error, count } = await csv.read(req.file.buffer);

    if (error) {
      res.status(400).json({ message: error });
    }

    if (records.length == 0) {
      res.status(400).json({
        message: "0 words have been created because the CSV file is empty.",
      });
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

          if (json.message) {
            invalidWords.push(word);
            continue;
          }

          newWord = await wordQueries.createWord(json);
        }

        const { userWord } = await userWordQueries.createUserWord(
          userId,
          newWord ? newWord.id : existingWord.id
        );

        if (userWord) {
          wordCount++;
        }
      }
    }

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

    if (wordCount < count) {
      res.status(200).json({
        message: `You have already added ${
          count - wordCount
        } of these words in your dictionary.`,
      });
    }

    res.status(200).json({ message: `${wordCount} words have been created.` });
    return;
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

    const { userWord, message } = await userWordQueries.createUserWord(
      userId,
      newWord ? newWord.id : existingWord.id
    );

    if (!userWord) {
      res.status(409).json({ word: null, message });
    }

    res.status(200).json({ word: newWord || existingWord, message });
  }),
];

// @desc    Delete single user word
// @route   DELETE /api/users/:userId/words/:wordId
// @access  Private
export const delete_user_word = asyncHandler(async (req, res) => {
  const { wordId, userId } = req.params;
  const deletedUserWord = await userWordQueries.deleteUserWord(userId, wordId);

  res.status(200).json({ userWord: deletedUserWord });
});

// @desc    Get all words
// @route   GET /api/users/:userId/words
// @access  Private
// export const word_list = [
//   query("search").optional().trim().escape().isString(),
//   query("sort").optional().trim().escape().isString(),
//   query("learned").optional().isBoolean(),
//   query("page").optional().isNumeric(),
//   asyncHandler(async (req, res) => {
//     const { userId } = req.params;
//     const perPage = 6;
//     const { learned, page, search, sort } = req.query;
//     if (search) {
//       const userWords = await UserWord.aggregate([
//         {
//           $search: {
//             index: "word_storer-userwords-dynamic",
//             text: {
//               query: search,
//               path: "*",
//             },
//           },
//         },
//       ]);

//       console.log(userWords);
//       res.status(200).json(userWords);
//       return;
//     } else if (learned) {
//       const words = await UserWord.find({ userId, learned }).exec();
//       res.status(200).json(words);
//       return;
//     }
//     let sortOptions = {};
//     switch (sort) {
//       case "alphabeticallyAscending":
//         sortOptions = { word: 1 };
//         break;
//       case "alphabeticallyDescending":
//         sortOptions = { word: -1 };
//         break;
//       case "ascending":
//         sortOptions = { created_at: 1 };
//         break;
//       case "descending":
//         sortOptions = { created_at: -1 };
//         break;
//       default:
//         sortOptions = {};
//         break;
//     }
//     let fields = {};
//     if (learned) {
//       fields = { learned };
//     }
//     const words = await UserWord.find({ userId, ...fields })
//       .sort(sortOptions)
//       .populate("word")
//       .exec();
//     res.status(200).json(words);
//   }),
// ];
