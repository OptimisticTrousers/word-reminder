import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import { CustomNotFoundError } from "../errors/custom_not_found_error";

// catch 404 and forward to error handler
export const notFoundHandler = asyncHandler(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    throw new CustomNotFoundError("Not found");
  }
);
