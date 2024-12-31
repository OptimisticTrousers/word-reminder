import { query } from "express-validator";

export const validateSortQuery = [
  // Validate and sanitize fields.
  query("column")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("'column' must be a non-empty string."),
  query("direction")
    .optional()
    .trim()
    .escape()
    .isInt()
    .withMessage("'direction' must be a positive integer."),
  query("table")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("'table' must be a non-empty string."),
  query().custom((_value, { req }) => {
    const query = req.query;
    const column = query?.column;
    const direction = query?.direction;
    const table = query?.table;
    const hasSortingParams = column || direction || table;
    const allSortingParamsProvided = column && direction && table;

    if (hasSortingParams && !allSortingParamsProvided) {
      return Promise.reject(
        "'column', 'direction', and 'table' must all be provided together for sorting."
      );
    }

    return true;
  }),
];
