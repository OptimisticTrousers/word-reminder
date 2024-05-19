import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import agenda from "../app";
import WordsByDuration from "../models/wordsByDuration";
import activateWordsByDuration from "../utils/activateWordsByDuration";
import createRandomWordsByDuration from "../utils/createRandomWordsByDuration";

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
  body("words", "'words' array is required.").optional().isArray(),
  body("options.isActive").optional().isBoolean(),
  query("options.hasReminderOnLoad").optional().isBoolean(),
  query("options.hasDuplicateWords").optional().isBoolean(),
  body("options.recurring.isRecurring").optional().isBoolean(),
  body("options.recurring.interval")
    .optional()
    .isString()
    .if(body("options.recurring.isRecurring").notEmpty()),
  body("options.reminder").optional().isString(),
  body("wordsByDurationLength")
    .optional()
    .isInt()
    .custom((value, { req }) => {
      if ((!value || value.length === 0) && !req.body.words) {
        // neither a list of words nor a number providing the length of a words by duration has been provided
        return Promise.reject(
          "List of words or number expressing the length of a words by duration must be provided"
        );
      }
      // User has included one of either text or image. Continue with request handling
      return true;
    }),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const {
      from,
      to,
      words,
      wordsByDurationLength,
      options: {
        isActive,
        hasReminderOnLoad,
        hasDuplicateWords,
        recurring: { isRecurring, interval },
        reminder,
      },
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
      return;
    }

    if (!words) {
      // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
      createRandomWordsByDuration(
        userId,
        from,
        to,
        wordsByDurationLength,
        {
          isActive,
          hasReminderOnLoad,
          hasDuplicateWords,
          recurring: { isRecurring, interval },
          reminder,
        },
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
          if (isRecurring) {
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
      from,
      to,
      words,
      options: {
        isActive,
        hasReminderOnLoad,
        hasDuplicateWords,
        recurring: { isRecurring, interval },
        reminder,
      },
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
  body("from", "'From' date is required.").trim().isDate().isAfter(),
  body("to", "'To' date is required.")
    .trim()
    .isDate()
    .custom((to, { req }) => {
      return to > req.body.from;
    }),
  body("words", "'words' array is required.").optional().isArray(),
  body("options.isActive").optional().isBoolean(),
  query("options.hasReminderOnLoad").optional().isBoolean(),
  query("options.hasDuplicateWords").optional().isBoolean(),
  body("options.recurring.isRecurring").optional().isBoolean(),
  body("options.recurring.interval")
    .optional()
    .isString()
    .if(body("options.recurring.isRecurring").notEmpty()),
  body("options.reminder").optional().isString(),
  asyncHandler(async (req, res) => {
    const {
      from,
      to,
      words,
      options: {
        isActive,
        hasReminderOnLoad,
        hasDuplicateWords,
        recurring: { isRecurring, interval },
        reminder,
      },
    } = req.body;
    const { wordsByDurationId } = req.params;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
      return;
    }
    const updatedWordsByDuration = await WordsByDuration.findByIdAndUpdate(
      wordsByDurationId,
      {
        from,
        to,
        words,
        options: {
          isActive,
          hasReminderOnLoad,
          hasDuplicateWords,
          recurring: { isRecurring, interval },
          reminder,
        },
      },
      { new: true }
    ).exec();

    await activateWordsByDuration(from, wordsByDurationId);

    res.status(200).json(updatedWordsByDuration);
  }),
];
