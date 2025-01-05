import asyncHandler from "express-async-handler";
import { body } from "express-validator";

import { SubscriptionQueries } from "../db/subscription_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";

const subscriptionQueries = new SubscriptionQueries();

// @desc Create new subscription
// @route POST /api/subscriptions
// @access Private
export const create_subscription = [
  // Validate and sanitize fields.
  body("endpoint")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Endpoint must be specified."),
  body("keys.auth")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Auth must be specified."),
  body("keys.p256dh")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("P256dh must be specified."),
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const subscription = req.body;
    await subscriptionQueries.create(subscription);

    res.status(200).json({ data: { success: true } });
  }),
];
