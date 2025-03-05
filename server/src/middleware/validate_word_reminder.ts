import { SortMode } from "common";
import { validateCronExpression } from "cron";
import { body } from "express-validator";

export const validateOptions = [
  body("has_reminder_onload")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'has_reminder_onload' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'has_reminder_onload' must be a boolean."),
  body("is_active")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'is_active' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'is_active' must be a boolean."),
  body("reminder")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'reminder' must be specified.")
    .bail()
    .custom((value) => {
      const validation = validateCronExpression(value);
      if (validation.valid) {
        return true;
      }
      throw new Error(validation.error?.message);
    }),
];

export const validateWordReminder = [
  body("finish")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'finish' must be specified.")
    .bail()
    .isISO8601()
    .toDate()
    .withMessage("'finish' must be a date.")
    .bail()
    .isAfter()
    .withMessage("'finish' must come after the current date."),
  body("user_words")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'user_words' must be specified.")
    .bail()
    .isArray()
    .toArray()
    .withMessage("'user_words' must be an array."),
];

export const validateAutoWordReminder = [
  body("create_now")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'create_now' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'create_now' must be a boolean."),
  body("duration")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'duration' must be specified.")
    .bail()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("'duration' must be a positive integer."),
  body("has_learned_words")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'has_learned_words' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'has_learned_words' must be a boolean."),
  body("sort_mode")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'sort_mode' must be specified.")
    .bail()
    .custom((value) => Object.values<string>(SortMode).includes(value))
    .withMessage(
      `'sort_mode' must be a value in this enum: ${Object.values(SortMode)}.`
    ),
  body("word_count")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'word_count' must be specified.")
    .bail()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("'word_count' must be a positive integer."),
];
