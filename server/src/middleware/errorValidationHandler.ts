import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

export const errorValidationHandler = asyncHandler(async (req, res, next) => {
  // Extract validation errors from a request.
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // There are errors. Send response with sanitized values/errors messages.
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
});
