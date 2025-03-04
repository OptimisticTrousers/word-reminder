import { Request, Response, NextFunction } from "express";

import { CustomNotFoundError } from "../errors/custom_not_found_error";

export const notFoundHandler = (
  _req: Request,
  _res: Response,
  _next: NextFunction
) => {
  throw new CustomNotFoundError("Not found");
};
