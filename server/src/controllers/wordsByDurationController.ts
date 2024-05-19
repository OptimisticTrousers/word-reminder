import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import agenda from "../app";
import WordsByDuration from "../models/wordsByDuration";
import activateWordsByDuration from "../utils/activateWordsByDuration";
import createRandomWordsByDuration from "../utils/createRandomWordsByDuration";
import { CustomError } from "../utils/types";

// @desc Create a new current words by duration
// @route POST /api/users/:userId/wordsByDuration?random
// @access Private
export const words_by_duration_create = [
  body("from", "'From' date is required.").trim().isDate().isAfter(),
  body("to", "'To' date is required.")
    .trim()
    .isDate()
    .custom((to, { req }) => {
      return to > req.body.from;
    }),
  body("active", "'Active' boolean is required.").isBoolean(),
  body("words", "'words' array is required.").optional().isArray(),
  body("recurring").optional().isBoolean(),
  body("interval").optional().isString().if(body("recurring").notEmpty()),
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
  query("duplicateWords").optional().isBoolean(),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { duplicateWords } = req.query;
    const {
      active,
      from,
      to,
      words,
      wordsByDurationLength,
      recurring,
      interval,
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
      return;
    }

    if (!words) {
      // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
      createRandomWordsByDuration(
        from,
        to,
        userId,
        wordsByDurationLength,
        active,
        Boolean(duplicateWords),
        recurring,
        (randomWordsLength) => {
          res.status(405).json({
            message: `Not enough unique words available. You need ${wordsByDurationLength} words, but only ${randomWordsLength} unique words are available.`,
          });
        },
        (wordsByDuration) => {
          res.status(200).json(wordsByDuration);
        },
        async (wordsByDurationId) => {
          // make sure to add the interval to the dates so that the 'from' and 'to' date changes are reflected
          const newFrom = from.setHours(from.getHours() + interval);
          const newTo = to.setHours(to.getHours() + interval);
          if (recurring) {
            agenda.every(interval, "create_agenda", {
              ...req.body,
              from: newFrom,
              to: newTo,
            });
          }
          await activateWordsByDuration(from, wordsByDurationId);
        }
      );
    }
    const wordsByDuration = new WordsByDuration({
      userId,
      words,
      from,
      to,
      active,
    });
    await wordsByDuration.save();
    res.status(200).json(wordsByDuration);
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
  body("recurring").optional().isBoolean(),
  body("interval").optional().isString().if(body("recurring").notEmpty()),
  asyncHandler(async (req, res) => {
    const { active, from, to, words, recurring } = req.body;
    const { wordsByDurationId } = req.params;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
      return;
    }
    const updatedWordsByDuration = await WordsByDuration.findByIdAndUpdate(
      wordsByDurationId,
      {
        words,
        from,
        to,
        active,
        recurring,
      },
      { new: true }
    ).exec();

    await activateWordsByDuration(from, wordsByDurationId);

    res.status(200).json(updatedWordsByDuration);
  }),
];
