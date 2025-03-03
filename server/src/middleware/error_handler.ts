import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

// error handler
export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error.",
    stack: err.stack,
  });
};
