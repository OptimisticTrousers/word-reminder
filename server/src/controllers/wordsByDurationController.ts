import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import Word from "../models/word";
import WordsByDuration from "../models/wordsByDuration";
import User from "../models/user";
import validateDates from "../utils/validateDates";
import { CustomError } from "../utils/models";

// @desc Create a new current words by duration
// @route POST /api/users/:userId/wordsByDuration?random
// @access Private
export const words_by_duration_create = [
  body("from", "'From' date is required.").trim().isDate(),
  body("to", "'To' date is required.").trim().isDate(),
  body("active", "'Active' boolean is required.").isBoolean(),
  body("words", "'words' array is required.").optional().isArray(),
  body("wordsByDurationLength")
    .optional()
    .isInt()
    .custom((value, { req }) => {
      if ((!value || value.length === 0) && !req.body.words) {
        // neither a list of words nor a number providing the length of a words by duration has been provided
        const error = new Error(
          "List of words or number expressing the length of a words by duration must be provided"
        );
        (error as CustomError).status = 400;
        throw error;
      }
      // User has included one of either text or image. Continue with request handling
      return true;
    }),
  query("duplicate").optional().isBoolean(),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { duplicate } = req.query;
    const user = await User.findById(userId).exec();
    const { active, from, to, words, wordsByDurationLength } = req.body;
    if (!words && wordsByDurationLength) {
      // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
      const length = user.wordCount;
      if (wordsByDurationLength - length < 0) {
        res.status(405).send({
          message: `You must have at least ${wordsByDurationLength} word(s) in order to create a words by duration.`,
        });
      } else {
        const randomWords = Word.aggregate([
          {
            $lookup: {
              from: "wordsByDuration",
              localField: "_id",
              foreignField: "words",
              as: "join",
            },
          },
        ]);
        const wordsByDuration = new WordsByDuration({});
      }
    } else {
      validateDates(from, to);
      const wordsByDuration = new WordsByDuration({
        userId,
        words,
        from,
        to,
        active,
      });
      await wordsByDuration.save();
      res.status(200).json(wordsByDuration);
    }
  }),
];

// @desc    Delete the current words by duration
// @route   DELETE /api/users/:userId/wordsByDuration/:wordsByDurationId
// @access  Private
export const words_by_duration_delete = asyncHandler(async (req, res) => {
  const { wordByDurationId } = req.params;

  const deletedWordsByDuration = await WordsByDuration.findByIdAndDelete(
    wordByDurationId
  ).exec();
  res.status(200).json(deletedWordsByDuration);
});

// @desc    Get the current words by duration
// @route   GET /api/users/:userId/wordsByDuration/:wordsByDurationId
// @access  Private
export const words_by_duration_get = asyncHandler(async (req, res) => {
  const { wordByDurationId } = req.params;

  const wordsByDuration = await WordsByDuration.findById(
    wordByDurationId
  ).exec();
  res.status(200).json(wordsByDuration);
});

// @desc Get all wordsbyDuration
// @route POST /api/users/:userId/wordsByDuration
// @access Private
export const words_by_duration_list = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const activeWordsByDuration = await WordsByDuration.find({
    userId,
    active: true,
  }).exec();

  const inactiveWordsByDuration = await WordsByDuration.find({
    userId,
    active: false,
  }).exec();

  res
    .status(200)
    .json({ active: activeWordsByDuration, inactive: inactiveWordsByDuration });
});

// @desc Update a current words by duration
// @route PUT /api/users/:userId/wordsByDuration/:wordsByDurationId
// @access Private
export const words_by_duration_update = [
  body("from").trim().isDate(),
  body("to").trim().isDate(),
  body("active").isBoolean(),
  body("words").optional().isArray(),
  asyncHandler(async (req, res) => {
    const { active, from, to, words } = req.body;
    validateDates(from, to);
    const { wordByDurationId } = req.params;
    const updatedWordsByDuration = await WordsByDuration.findByIdAndUpdate(
      wordByDurationId,
      {
        words,
        from,
        to,
        active,
      },
      { new: true }
    ).exec();

    res.status(200).json(updatedWordsByDuration);
  }),
];

// @desc Fetch a random wordsByDuration
// @route GET /api/users/:userId/wordsByDuration/random
// @access Private
export const words_by_duration_get_random = asyncHandler(async (_req, res) => {
  const randomActiveWordsByDuration = await WordsByDuration.findOne({
    active: true,
  }).exec();

  if (!randomActiveWordsByDuration) {
    res.status(404).json({ message: "No active WordsByDuration found" });
    return;
  }

  res.status(200).json(randomActiveWordsByDuration);
});
