import { query } from "express-validator";

import { CustomBadRequestError } from "../errors/custom_bad_request_error";

export const validatePageQuery = [
  query("limit")
    .optional()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("'limit' must be a positive integer."),
  query("page")
    .optional()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("'page' must be a positive integer."),
  query().custom((_value, { req }) => {
    const query = req.query;
    if (!query) {
      return true;
    }
    const hasPage = "page" in query;
    const hasLimit = "limit" in query;
    const hasPaginationParams = hasPage || hasLimit;
    const allPaginationParamsProvided = hasPage && hasLimit;

    if (hasPaginationParams && !allPaginationParamsProvided) {
      throw new CustomBadRequestError(
        "'page' and 'limit' must both be provided for pagination."
      );
    }

    return true;
  }),
];
