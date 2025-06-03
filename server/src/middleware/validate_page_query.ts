import { query } from "express-validator";

import { CustomBadRequestError } from "../errors/custom_bad_request_error";

export const validatePageQuery = [
  query("limit")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("'limit' must be a positive integer."),
  query("page")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("'page' must be a positive integer."),
  query().custom((_value, { req }) => {
    const query = req.query;
    const page = query?.page as string | undefined;
    const limit = query?.limit as string | undefined;
    const hasPaginationParams = page || limit;
    const allPaginationParamsProvided = page && limit;

    if (hasPaginationParams && !allPaginationParamsProvided) {
      throw new CustomBadRequestError(
        "'page' and 'limit' must both be provided for pagination."
      );
    }

    return true;
  }),
];
