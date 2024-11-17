import { body } from "express-validator";

import { errorValidationHandler } from "./errorValidationHandler";

const usernameMax = 255;
const passwordMax = 72;

export const validateUser = [
  // Validate and sanitize fields.
  body("username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Username must be specified.")
    .isLength({ max: usernameMax })
    .withMessage(`Username cannot be greater than ${usernameMax} characters.`),
  body("password")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Password must be specified.")
    .isLength({ max: passwordMax })
    .withMessage(`Password cannot be greater than ${passwordMax} characters.`),
  errorValidationHandler,
];
