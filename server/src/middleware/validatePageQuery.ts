import { query } from "express-validator";

export const validatePageQuery = [
  // Validate and sanitize fields.
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
    const page = query?.page;
    const limit = query?.limit;
    const hasPaginationParams = page || limit;
    const allPaginationParamsProvided = page && limit;

    if (hasPaginationParams && !allPaginationParamsProvided) {
      return Promise.reject(
        "'page' and 'limit' must both be provided for pagination."
      );
    }

    return true;
  }),
];
