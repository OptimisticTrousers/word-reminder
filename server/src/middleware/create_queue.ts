import asyncHandler from "express-async-handler";

import { boss } from "../db/boss";

export const createQueue = (queuePostfix: string) => {
  return asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const queueName = `${userId}-${queuePostfix}`;
    res.locals.queueName = queueName;
    await boss.createQueue(queueName);

    next();
  });
};
