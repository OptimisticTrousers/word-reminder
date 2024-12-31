import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

// catch 404 and forward to error handler
export const notFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(createHttpError(404));
};