import { User } from "common";
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

const { SALT } = variables;

// @desc Confirms a user's account
// @route POST /api/users/:userId&:token
// @access Private
export const confirm_account = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  const user = await userQueries.getById(userId);
  if (user!.confirmed === false) {
    await userQueries.updateById(userId, { confirmed: true });
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

    res.status(200).json({ user });
  }),
];

// @desc    Update user details
// @route   PUT /api/users/:userId
// @access  Private
export const update_user = [
  // Validate and sanitize fields
  body("confirmed")
    .optional()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("confirmed must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("confirmed must be a boolean."),
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
    })
    .custom((_, { req }) => {
      if (!req.body.oldPassword) {
        throw new CustomBadRequestError(
          "oldPassword is required when updating email."
        );
      }
      return true;
    }),
  body("oldPassword")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("oldPassword must be specified.")
    .custom((_, { req }) => {
      if (!req.user) {
        throw new CustomBadRequestError(
          "oldPassword is not required when the session user is not provided."
        );
      }
      if (
        !req.body.email &&
        !req.body.newPassword &&
        !req.body.newPasswordConfirmation
      ) {
        throw new CustomBadRequestError(
          "oldPassword requires email or newPassword and newPasswordConfirmation to be provided."
        );
      }
      return true;
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
      if (req.user && !req.body.oldPassword) {
        throw new CustomBadRequestError(
          "oldPassword is required when updating password."
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
    const userId = Number(req.params.userId);
    const token = req.params.token;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("pages/error", {
        errors: errors.array(),
      });
      return;
    }

    const sessionUser = req.user;

    const { confirmed, oldPassword, newPassword, email } = req.body;

    if (sessionUser) {
      if (confirmed) {
        await userQueries.updateById(userId, { confirmed });

        res.render("pages/success", {
          message: "You have successfully confirmed your account!",
        });
        return;
      }

      const oldHashedPassword = await bcrypt.hash(oldPassword, Number(SALT));

      const user = await userQueries.get({
        id: userId,
        password: oldHashedPassword,
      });

      const message = "You typed your old password incorrectly. Try again.";
      if (!user && newPassword) {
        res.render("pages/change_password", {
          userId,
          message,
          token,
        });
        return;
      }

      if (!user && email) {
        res.render("pages/change_email", {
          userId,
          message,
          token,
        });
        return;
      }

      if (email) {
        await userQueries.updateById(userId, { email });

        res.render("pages/success", {
          message: "You have successfully updated your email!",
        });
        return;
      }
    }

    const newHashedPassword = await bcrypt.hash(newPassword, Number(SALT));

    await userQueries.updateById(userId, {
      password: newHashedPassword,
    });

    res.render("pages/success", {
      message: "You have successfully updated your password!",
    });
  }),
];
