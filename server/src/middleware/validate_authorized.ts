import { User } from "common";
import { NextFunction, Request, Response } from "express";

export const validateAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.params.userId);
  const user = req.user as User;

  if (userId !== user.id) {
    res.status(401).json({
      message: "You are not allowed to change another user's data.",
    });
    return;
  }

  next();
};
