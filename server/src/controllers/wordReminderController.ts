import asyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";

import {
  Result,
  UserWordsWordRemindersQueries,
} from "../db/userWordsWordRemindersQueries";
import { WordReminderQueries } from "../db/wordReminderQueries";

const userWordsWordRemindersQueries = new UserWordsWordRemindersQueries();
const wordReminderQueries = new WordReminderQueries();

// // @desc Create a new current words by duration
// // @route POST /api/users/:userId/wordReminders
// // @access Private
// export const create_word_reminder = [
//   body("from", "'From' date is required.").trim().isDate().isAfter(),
//   body("to", "'To' date is required.")
//     .trim()
//     .isDate()
//     .custom((to, { req }) => {
//       return to > req.body.from;
//     }),
//   body("words", "'words' array is required.").optional().isArray(),
//   body("options.isActive").optional().isBoolean(),
//   query("options.hasReminderOnLoad").optional().isBoolean(),
//   query("options.hasDuplicateWords").optional().isBoolean(),
//   body("options.recurring.isRecurring").optional().isBoolean(),
//   body("options.recurring.interval")
//     .optional()
//     .isString()
//     .if(body("options.recurring.isRecurring").notEmpty()),
//   body("options.reminder").optional().isString(),
//   asyncHandler(async (req, res) => {
//     const { userId } = req.params;
//     const {
//       from,
//       to,
//       words,
//       wordsByDurationLength,
//       options: {
//         isActive,
//         hasReminderOnLoad,
//         hasDuplicateWords,
//         recurring: { isRecurring, interval },
//         reminder,
//       },
//     } = req.body;

//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       res.status(400).json(errors.array());
//       return;
//     }

//     if (!words) {
//       // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
//       createRandomWordsByDuration(
//         userId,
//         from,
//         to,
//         wordsByDurationLength,
//         {
//           isActive,
//           hasReminderOnLoad,
//           hasDuplicateWords,
//           recurring: { isRecurring, interval },
//           reminder,
//         },
//         (randomWordsLength) => {
//           res.status(405).json({
//             message: `Not enough unique words available. You need ${wordsByDurationLength} words, but only ${randomWordsLength} unique words are available.`,
//           });
//         },
//         (wordsByDuration) => {
//           res.status(200).json(wordsByDuration);
//         },
//         async (wordsByDurationId) => {
//           // make sure to add the interval to the dates so that the 'from' and 'to' date changes are reflected
//           const newFrom = from.setHours(from.getHours() + interval);
//           const newTo = to.setHours(to.getHours() + interval);
//           if (isRecurring) {
//             agenda.every(interval, "create_agenda", {
//               ...req.body,
//               from: newFrom,
//               to: newTo,
//             });
//           }
//           agenda.schedule(to, "learned_words", { wordsByDurationId });
//           await activateWordsByDuration(from, wordsByDurationId);
//         }
//       );
//     }
//     const wordsByDuration = new WordsByDuration({
//       userId,
//       from,
//       to,
//       words,
//       options: {
//         isActive,
//         hasReminderOnLoad,
//         hasDuplicateWords,
//         recurring: { isRecurring, interval },
//         reminder,
//       },
//     });
//     await wordsByDuration.save();
//     res.status(200).json(wordsByDuration);
//   }),
// ];

// @desc    Delete all of the user's word reminders
// @route   DELETE /api/users/:userId/wordReminders
// @access  Private
export const delete_word_reminders = asyncHandler(async (req, res) => {
  const userId: string = req.params.userId;
  const deletedUserWordsWordReminders =
    await userWordsWordRemindersQueries.deleteAllByUserId(userId);
  const deletedWordReminders = await wordReminderQueries.deleteAllByUserId(
    userId
  );
  res.status(200).json({
    userWordsWordReminders: deletedUserWordsWordReminders,
    wordReminders: deletedWordReminders,
  });
});

// @desc    Delete single word reminder
// @route   DELETE /api/users/:userId/wordReminders/:wordReminderId
// @access  Private
export const delete_word_reminder = asyncHandler(async (req, res) => {
  const wordReminderId: string = req.params.wordReminderId;
  const deletedUserWordsWordReminders =
    await userWordsWordRemindersQueries.deleteAllByWordReminderId(
      wordReminderId
    );
  res.status(200).json({
    userWordsWordReminders: deletedUserWordsWordReminders,
  });
});

// @desc  Get all word reminders
// @route GET /api/users/:userId/wordReminders
// @query column, direction, table, page, limit
// @access Private
export const word_reminder_list = [
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const userId: string = req.params.userId;
    const { column, direction, table, page, limit } = req.query;

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
      ...(limit && page && { limit: Number(limit), page: Number(page) }),
    };

    const result: Result = await userWordsWordRemindersQueries.getByUserId(
      userId,
      options
    );

    res.status(200).json(result);
  }),
];

// // @desc Update a current words by duration
// // @route PUT /api/users/:userId/wordsByDuration/:wordsByDurationId
// // @access Private
// export const update_word_reminder = [
//   body("from", "'From' date is required.").trim().isDate().isAfter(),
//   body("to", "'To' date is required.")
//     .trim()
//     .isDate()
//     .custom((to, { req }) => {
//       return to > req.body.from;
//     }),
//   body("words", "'words' array is required.").optional().isArray(),
//   body("options.isActive").optional().isBoolean(),
//   query("options.hasReminderOnLoad").optional().isBoolean(),
//   query("options.hasDuplicateWords").optional().isBoolean(),
//   body("options.recurring.isRecurring").optional().isBoolean(),
//   body("options.recurring.interval")
//     .optional()
//     .isString()
//     .if(body("options.recurring.isRecurring").notEmpty()),
//   body("options.reminder").optional().isString(),
//   asyncHandler(async (req, res) => {
//     const {
//       from,
//       to,
//       words,
//       options: {
//         isActive,
//         hasReminderOnLoad,
//         hasDuplicateWords,
//         recurring: { isRecurring, interval },
//         reminder,
//       },
//     } = req.body;
//     const { wordsByDurationId } = req.params;

//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       res.status(400).json(errors.array());
//       return;
//     }
//     const updatedWordsByDuration = await WordsByDuration.findByIdAndUpdate(
//       wordsByDurationId,
//       {
//         from,
//         to,
//         words,
//         options: {
//           isActive,
//           hasReminderOnLoad,
//           hasDuplicateWords,
//           recurring: { isRecurring, interval },
//           reminder,
//         },
//       },
//       { new: true }
//     ).exec();

//     await activateWordsByDuration(from, wordsByDurationId);

//     res.status(200).json(updatedWordsByDuration);
//   }),
// ];
