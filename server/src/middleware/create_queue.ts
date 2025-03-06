import { User } from "common";
import asyncHandler from "express-async-handler";

import { boss } from "../db/boss";

export const createQueue = (queueName: string) => {
  return asyncHandler(async (req, res, next) => {
    await boss.createQueue(queueName);

    next();
  });
};
