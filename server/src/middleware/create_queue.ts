import asyncHandler from "express-async-handler";
import { User } from "common";

import { boss } from "../db/boss";

export const createQueue = (queueName: string) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user as User;
    const userId = user.id;
    await boss.createQueue(`${userId}-${queueName}`);
    next();
  });
};
