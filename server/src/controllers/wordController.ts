import { parse } from "csv-parse";
import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import upload from "../config/multer";
import { Http } from "../utils/http";
// import UserWord from "../models/userWord";
// import Word from "../models/word";

import { UserWordQueries } from "../db/userWordQueries";
import { errorValidationHandler } from "../middleware/errorValidationHandler";
import { Word, WordQueries } from "../db/wordQueries";

const userWordQueries = new UserWordQueries();
const wordQueries = new WordQueries();
const http = new Http();

// @desc Add new word and user word
// @route POST /api/users/:userId/words
// @access Private
export const create_word = [
  upload.single("file"),
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
  // asyncHandler(async (req, res, next) => {
  //   const { userId } = req.params;
  //   // If a CSV file is not provided, then go to the next request handler
  //   if (!req.file) {
  //     next();
  //     return;
  //   }
  //   const words: string[] = [];
  //   let invalidWords = 0;
  //   const parser = parse({
  //     delimiter: ",",
  //     relax_column_count: true, // Relax column count to avoid errors with varying columns
  //     skip_empty_lines: true, // Skip any empty lines in the file
  //     trim: true, // Automatically trim values
  //   });

  //   // Use the readable stream api to consume records
  //   parser.on("readable", async () => {
  //     let record;
  //     while ((record = parser.read()) !== null) {
  //       // Assuming each record could have multiple columns but you want the first column
  //       let word;
  //       if (record.length > 1) {
  //         for (let i = 0; i < record.length; i++) {
  //           word = record[i];
  //           words.push(word);
  //           const newWord = await createWord(userId, word);
  //           if (newWord) {
  //             invalidWords++;
  //           }
  //         }
  //       } else {
  //         word = record[0];
  //         words.push(word); // Capture only the first column if there are multiple
  //         const newWord = await createWord(userId, word);
  //         if (newWord) {
  //           invalidWords++;
  //         }
  //       }
  //     }
  //   });

  //   // Catch any error
  //   parser.on("error", (err) => {
  //     console.error(err.message);
  //     res.status(500).json({ message: `Parsing error: ${err.message}` });
  //   });

  //   parser.on("end", async () => {
  //     const length = words.length;
  //     const validWords = length - invalidWords;
  //     res.status(200).json({ valid: validWords, invalid: invalidWords });
  //   });
  //   // Write buffer to parser and end
  //   parser.write(req.file.buffer.toString());
  //   parser.end();
  // }),
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
      newWord ? newWord.id : existingWord.id
    );

    res.status(200).json({ word: newWord || existingWord });
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
