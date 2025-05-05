import { query } from "express-validator";

import { CustomBadRequestError } from "../errors/custom_bad_request_error";
import { Column } from "common";

export const validateSortQuery = [
  query("column")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .notEmpty()
    .withMessage("'column' must be a non-empty string.")
    .bail()
    .custom((value) => Object.values<string>(Column).includes(value))
    .withMessage(
      `'column' must be a value in this enum: ${Object.values(Column)}.`
    ),
  query("direction")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isInt({ min: -1, max: 1 })
    .withMessage("'direction' must be an integer between -1 and 1."),
  query().custom((_value, { req }) => {
    const query = req.query;
    const column = query?.column;
    const direction = query?.direction;
    const hasSortingParams = column || direction;
    const allSortingParamsProvided = column && direction;

    if (hasSortingParams && !allSortingParamsProvided) {
      throw new CustomBadRequestError(
        "'column' and 'direction' must be provided together for sorting."
      );
    }

    return true;
  }),
];
