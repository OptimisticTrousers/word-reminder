import { NextFunction, Request, Response } from "express";
import webpush from "web-push";

import { variables } from "../config/variables";

const { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, WORD_REMINDER_EMAIL } = variables;

const vapidKeys = {
  publicKey: VAPID_PUBLIC_KEY,
  privateKey: VAPID_PRIVATE_KEY,
};

export const webPush = (req: Request, res: Response, next: NextFunction) => {
  webpush.setVapidDetails(
    `mailto:${WORD_REMINDER_EMAIL}`,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  next();
};
