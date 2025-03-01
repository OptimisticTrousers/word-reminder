import { body } from "express-validator";

import { errorValidationHandler } from "./error_validation_handler";
import { Order } from "common";

const validateAddToDate = (name: string, property: string) => {
  return body(`${name}.${property}`)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(`'${name}.${property}' must be specified.`)
    .bail()
    .isInt({ gt: -1 })
    .toInt()
    .withMessage(`'${name}.${property}' must be a non-negative integer.`);
};

const validateOptions = [
  errorValidationHandler, // stop here if 'random' is not provided
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
  validateAddToDate("reminder", "minutes"),
  validateAddToDate("reminder", "hours"),
  validateAddToDate("reminder", "days"),
  validateAddToDate("reminder", "weeks"),
  validateAddToDate("reminder", "months"),
];

const validateManualWordReminder = [
  body("finish")
    .if((_value, { req }) => {
      return req.body.auto === false;
    })
    .bail()
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
    .if((_value, { req }) => {
      return req.body.auto === false;
    })
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'user_words' must be specified.")
    .bail()
    .isArray()
    .toArray()
    .withMessage("'user_words' must be an array."),
];

export const validateAuto = [
  body("auto")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'auto' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'auto' must be a boolean."),
];

export const validateAutoWordReminder = [
  body("duration")
    .if((_value, { req }) => {
      return req.body.auto === true;
    })
    .bail(),
  validateAddToDate("duration", "minutes"),
  validateAddToDate("duration", "hours"),
  validateAddToDate("duration", "days"),
  validateAddToDate("duration", "weeks"),
  validateAddToDate("duration", "months"),
  body("has_learned_words")
    .if((_value, { req }) => {
      return req.body.auto === true;
    })
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'has_learned_words' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'has_learned_words' must be a boolean."),
  body("order")
    .if((_value, { req }) => {
      return req.body.auto === true;
    })
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'order' must be specified.")
    .bail()
    .custom((value) => Object.values<string>(Order).includes(value))
    .withMessage(
      `'order' must be a value in this enum: ${Object.values(Order).filter(
        (value) => typeof value === "string"
      )}.`
    ),
  body("word_count")
    .if((_value, { req }) => {
      return req.body.auto === true;
    })
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'word_count' must be specified.")
    .bail()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("'word_count' must be a positive integer."),
];

export const validateWordReminder = [
  ...validateOptions,
  ...validateManualWordReminder,
];
