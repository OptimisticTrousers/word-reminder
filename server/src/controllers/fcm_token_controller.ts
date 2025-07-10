import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";

import { fcmTokenQueries } from "../db/fcm_token_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";

// @desc Create FCM token
// @route POST /api/users/:userId/fcmTokens
// @access Private
export const create_fcm_token = [
  // Validate and sanitize fields.
  body("token")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Token must be specified."),
  errorValidationHandler,
  asyncHandler(
    async (
      req: Request<{ userId: string }, unknown, { token: string }>,
      res: Response<{ data: { success: boolean } }>
    ) => {
      const userId = Number(req.params.userId);
      const token = req.body.token;

      await fcmTokenQueries.create({ token, userId });

      res.status(200).json({ data: { success: true } });
    }
  ),
];
