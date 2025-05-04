import { body } from "express-validator";

export const validateUserWord = [
  body("learned")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'learned' must be specified.")
    .bail()
    .isBoolean({ loose: false })
    .toBoolean()
    .withMessage("'learned' must be a boolean."),
];
