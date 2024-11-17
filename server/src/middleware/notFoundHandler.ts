import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

// catch 404 and forward to error handler
const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(createHttpError(404));
};

export default notFoundHandler;
