import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isUnauthenticated()) {
    res.status(401).json({ message: "User is unauthenticated." });
    return;
  }
  next();
};
