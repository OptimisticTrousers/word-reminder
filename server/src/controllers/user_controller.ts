import { Template, User } from "common";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";

import { variables } from "../config/variables";
import { autoWordReminderQueries } from "../db/auto_word_reminder_queries";
import { EMAIL_MAX, PASSWORD_MAX, userQueries } from "../db/user_queries";
import { userWordQueries } from "../db/user_word_queries";
import { wordReminderQueries } from "../db/word_reminder_queries";
import { CustomBadRequestError } from "../errors/custom_bad_request_error";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { emailDoesNotExist } from "../utils/email_does_not_exist";
import { subscriptionQueries } from "../db/subscription_queries";
import { boss } from "../db/boss";
import { createQueue } from "../utils/create_queue";
import { Locals } from "express";

const { SALT } = variables;

// @desc Confirms a user's account
// @route POST /api/users/verify/:userId&:token
// @access Private
export const confirm_account = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  const user = await userQueries.getById(userId);
  if (user!.confirmed === false) {
    try {
      await userQueries.updateById(userId, {
        confirmed: true,
      });
    } catch (error) {
      res.render("pages/error", {
        errors: [
          {
            msg: "Server Error. Unable to confirm your account. Please log into WordReminder and try again.",
          },
        ],
      });
      return;
    }
  }

  res.render("pages/success", {
    message: "You have successfully confirmed your account!",
  });
});

// @desc    Delete single user
// @route   DELETE /api/users/:userId
// @access  Private
export const delete_user = asyncHandler(async (req, _res, next) => {
  const userId = Number(req.params.userId);
  await subscriptionQueries.deleteByUserId(userId);
  await userWordQueries.deleteByUserId(userId);
  await wordReminderQueries.deleteByUserId(userId);
  await autoWordReminderQueries.deleteByUserId(userId);
  await userQueries.deleteById(userId);
  await boss.offWork(`${userId}-word-reminder-queue`);
  await boss.offWork(`${userId}-auto-word-reminder-queue`);
  next();
});

// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const signup_user = [
  // Validate and sanitize fields
  body("email")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'email' must be specified.")
    .bail()
    .isLength({ max: EMAIL_MAX })
    .withMessage(`'email' cannot be greater than ${EMAIL_MAX} characters.`)
    .bail()
    .isEmail()
    .withMessage(`'email' must be a valid email.`)
    .bail()
    .custom((value) => {
      return emailDoesNotExist(value);
    }),
  body("password")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'password' must be specified.")
    .bail()
    .isLength({ max: PASSWORD_MAX })
    .withMessage(
      `'password' cannot be greater than ${PASSWORD_MAX} characters.`
    ),
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, Number(SALT));

    const user: User | null = await userQueries.create({
      email: req.body.email,
      password: hashedPassword,
    });
    await createQueue(
      res.locals as Locals & { queueName: string },
      user!.id,
      "auto-word-reminder-queue"
    );
    await createQueue(
      res.locals as Locals & { queueName: string },
      user!.id,
      "word-reminder-queue"
    );
    await createQueue(
      res.locals as Locals & { queueName: string },
      user!.id,
      "email-queue"
    );

    res.status(200).json({ user });
  }),
];

// @desc    Update user details
// @route   POST /api/users/:userId
// @access  Private
export const update_user = [
  // Validate and sanitize fields
  body("email")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("email must be specified.")
    .bail()
    .isLength({ max: EMAIL_MAX })
    .withMessage(`email cannot be greater than ${EMAIL_MAX} characters.`)
    .bail()
    .isEmail()
    .withMessage(`email must be a valid email.`)
    .bail()
    .custom((value) => {
      return emailDoesNotExist(value);
    }),
  body("newPassword")
    .optional()
    .trim()
    .escape()
    .isLength({ max: PASSWORD_MAX })
    .withMessage(
      `newPassword cannot be greater than ${PASSWORD_MAX} characters.`
    )
    .custom((value, { req }) => {
      if (value && !req.body.newPasswordConfirmation) {
        throw new CustomBadRequestError(
          "newPassword requires newPasswordConfirmation to be provided."
        );
      }
      if (value !== req.body.newPasswordConfirmation) {
        throw new CustomBadRequestError(
          "newPassword and newPasswordConfirmation must be equal."
        );
      }
      return true;
    }),
  body("newPasswordConfirmation")
    .optional()
    .trim()
    .escape()
    .isLength({ max: PASSWORD_MAX })
    .withMessage(
      `newPasswordConfirmation cannot be greater than ${PASSWORD_MAX} characters.`
    )
    .bail()
    .custom((value, { req }) => {
      if (value && !req.body.newPassword) {
        throw new CustomBadRequestError(
          "newPasswordConfirmation requires newPassword to be provided."
        );
      }
      return true;
    }),
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new CustomBadRequestError("Request body should not be empty.");
    }
    return true;
  }),
  asyncHandler(async (req, res) => {
    const token = req.params.token;
    const userId = Number(req.params.userId);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("pages/error", {
        errors: errors.array(),
      });
      return;
    }

    const { newPassword, email } = req.body;

    if (newPassword) {
      const newHashedPassword = await bcrypt.hash(newPassword, Number(SALT));

      try {
        await userQueries.updateById(userId, {
          password: newHashedPassword,
        });
      } catch (error) {
        res.render("pages/change_password", {
          userId,
          token,
          message: `Unable to change your password. ${error}. Please try again.`,
        });
      }

      res.render("pages/success", {
        message: "You have successfully updated your password!",
      });
      return;
    }

    try {
      await userQueries.updateById(userId, { email });
    } catch (error) {
      res.render("pages/change_email", {
        userId,
        token,
        message: `Unable to change your email. ${error}. Please try again.`,
      });
    }

    res.render("pages/success", {
      message: "You have successfully updated your email!",
    });
  }),
];
