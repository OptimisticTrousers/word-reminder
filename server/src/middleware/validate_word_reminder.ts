import { body } from "express-validator";

import { Order } from "../db/user_word_queries";
import { errorValidationHandler } from "./error_validation_handler";

const validateOptions = [
  errorValidationHandler, // stop here if 'random' is not provided
  body("hasReminderOnload")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'hasReminderOnload' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'hasReminderOnload' must be a boolean."),
  body("isActive")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'isActive' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'isActive' must be a boolean."),
  body("reminder")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'reminder' must be specified.")
    .bail()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("'reminder' must be a positive integer."),
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
  body("words")
    .if((_value, { req }) => {
      return req.body.auto === false;
    })
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'words' must be specified.")
    .bail()
    .isArray()
    .toArray()
    .withMessage("'words' must be an array."),
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
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'duration' must be specified.")
    .bail()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("'duration' must be a positive integer."),
  body("hasLearnedWords")
    .if((_value, { req }) => {
      return req.body.auto === true;
    })
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'hasLearnedWords' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'hasLearnedWords' must be a boolean."),
  body("order")
    .if((_value, { req }) => {
      return req.body.auto === true;
    })
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'order' must be specified.")
    .bail()
    .custom((value) => value in Order)
    .withMessage(
      `'order' must be a value in this enum: ${Object.values(Order).filter(
        (value) => typeof value === "string"
      )}.`
    ),
  body("wordCount")
    .if((_value, { req }) => {
      return req.body.auto === true;
    })
    .bail()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'wordCount' must be specified.")
    .bail()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("'wordCount' must be a positive integer."),
];

export const validateWordReminder = [
  ...validateOptions,
  ...validateManualWordReminder,
];
