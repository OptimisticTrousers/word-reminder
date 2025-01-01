import { body } from "express-validator";

import { errorValidationHandler } from "./errorValidationHandler";

const emailMax = 255;
const passwordMax = 72;

export const validateUser = [
  // Validate and sanitize fields.
  body("email")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'email' must be specified.")
    .bail()
    .isLength({ max: emailMax })
    .withMessage(`'email' cannot be greater than ${emailMax} characters.`)
    .bail()
    .isEmail()
    .withMessage(`'email' must be a valid email.`),
  body("password")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'password' must be specified.")
    .bail()
    .isLength({ max: passwordMax })
    .withMessage(
      `'password' cannot be greater than ${passwordMax} characters.`
    ),
  errorValidationHandler,
];
