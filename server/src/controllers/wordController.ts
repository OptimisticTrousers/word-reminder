import { parse } from "csv-parse";
import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import upload from "../config/multer";
import UserWord from "../models/userWord";
import Word from "../models/word";

const createWord = async (userId: string, word: string) => {
  const callback = async (word: string) => {
    const data = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    const json = await data.json();
    if (json.message) return null;
    return {
      phonetic: json[0].phonetics[0].text,
      word: json[0].word,
      origin: json[0].origin,
      meanings: json[0].meanings,
      audio: json[0].phonetics[0].audio,
    };
  };
  const wordData = await callback(word);
  if (!wordData) return null;
  const existingWord = await Word.exists({ word }).exec();
  let newUserWord = existingWord;
  if (!existingWord) {
    const newWord = new Word(wordData);
    await newWord.save();
    newUserWord = newWord;
  }
  const userWord = new UserWord({
    userId,
    word: newUserWord,
    learned: false,
  });
  await userWord.save();
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
        return Promise.reject("Word or CSV file is required");
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
            words.push(word);
            const newWord = await createWord(userId, word);
            if (newWord) {
              invalidWords++;
            }
          }
        } else {
          word = record[0];
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
    if (!newWord) {
      res
        .status(204)
        .json({ message: "Word does not exist. Please try again." });
    }
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
  query("page").optional().isNumeric(),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const perPage = 6;
    const { learned, page, search, sort } = req.query;
    if (search) {
      const userWords = await UserWord.aggregate([
        {
          $search: {
            index: "word_storer-userwords-dynamic",
            text: {
              query: search,
              path: "*",
            },
          },
        },
      ]);

      console.log(userWords);
      res.status(200).json(userWords);
      return;
    } else if (learned) {
      const words = await UserWord.find({ userId, learned }).exec();
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
        sortOptions = {};
        break;
    }
    let fields = {};
    if (learned) {
      fields = { learned };
    }
    const words = await UserWord.find({ userId, ...fields })
      .sort(sortOptions)
      .populate("word")
      .exec();
    res.status(200).json(words);
  }),
];
