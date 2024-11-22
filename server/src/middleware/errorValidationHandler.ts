import { NextFunction, Request, Response } from "express";
import { Result, ValidationError, validationResult } from "express-validator";

export const errorValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract validation errors from a request.
  const errors: Result<ValidationError> = validationResult(req);

  if (!errors.isEmpty()) {
    // There are errors. Send response with sanitized values/errors messages.
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};
