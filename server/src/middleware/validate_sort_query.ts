import { query } from "express-validator";

import { CustomBadRequestError } from "../errors/custom_bad_request_error";

export const validateSortQuery = [
  query("column")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .notEmpty()
    .withMessage("'column' must be a non-empty string."),
  query("direction")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isInt({ gt: 0 })
    .withMessage("'direction' must be a positive integer."),
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
