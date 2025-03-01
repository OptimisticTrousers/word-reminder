import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { body, check } from "express-validator";

import { variables } from "../config/variables";
import { EMAIL_MAX, PASSWORD_MAX, userQueries } from "../db/user_queries";
import { userWordQueries } from "../db/user_word_queries";
import { CustomBadRequestError } from "../errors/custom_bad_request_error";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { emailExists } from "../utils/email_exists";
import { User } from "common";

const { SALT } = variables;

// @desc    Delete single user
// @route   DELETE /api/users/:userId
// @access  Private
export const delete_user = asyncHandler(
  async (req, _res, next): Promise<void> => {
    const userId: string = req.params.userId;
    await userWordQueries.deleteAllByUserId(userId);
    await userQueries.deleteById(userId);
    next();
  }
);

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
    .custom(emailExists),
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
  // Process request after validation and sanitization.
  asyncHandler(async (req, res): Promise<void> => {
    const hashedPassword: string = await bcrypt.hash(
      req.body.password,
      Number(SALT)
    );

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
    .withMessage("'confirmed' must be specified.")
    .bail()
    .isBoolean()
    .toBoolean()
    .withMessage("'confirmed' must be a boolean."),
  body("email")
    .optional()
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
    .custom(emailExists)
    .custom((_, { req }) => {
      if (!req.body.oldPassword) {
        throw new CustomBadRequestError(
          "'oldPassword' is required when updating 'email'."
        );
      }
      return true;
    }),
  body("oldPassword")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'oldPassword' must be specified.")
    .custom((_, { req }) => {
      if (!req.user) {
        throw new CustomBadRequestError(
          "'oldPassword' is not required when the session user is not provided."
        );
      }
      if (
        !req.body.email &&
        !req.body.newPassword &&
        !req.body.newPasswordConfirmation
      ) {
        throw new CustomBadRequestError(
          "'oldPassword' requires 'email' or 'newPassword' and 'newPasswordConfirmation' to be provided."
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
      `'newPassword' cannot be greater than ${PASSWORD_MAX} characters.`
    )
    .custom((value, { req }) => {
      if (value && !req.body.newPasswordConfirmation) {
        throw new CustomBadRequestError(
          "'newPassword' requires 'newPasswordConfirmation' to be provided."
        );
      }
      if (value !== req.body.newPasswordConfirmation) {
        throw new CustomBadRequestError(
          "'newPassword' and 'newPasswordConfirmation' must be equal."
        );
      }
      if (req.user && !req.body.oldPassword) {
        throw new CustomBadRequestError(
          "'oldPassword' is required when updating 'password'."
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
      `'newPasswordConfirmation' cannot be greater than ${PASSWORD_MAX} characters.`
    )
    .bail()
    .custom((value, { req }) => {
      if (value && !req.body.newPassword) {
        throw new CustomBadRequestError(
          "'newPasswordConfirmation' requires 'newPassword' to be provided."
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
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const sessionUser = req.user;

    const { confirmed, oldPassword, newPassword, email } = req.body;

    if (sessionUser) {
      if (confirmed) {
        const updatedUser = await userQueries.updateById(userId, { confirmed });

        res.status(200).json({ user: updatedUser });
        return;
      }

      const oldHashedPassword = await bcrypt.hash(oldPassword, Number(SALT));

      const user = await userQueries.get({
        id: userId,
        password: oldHashedPassword,
      });

      if (!user) {
        res
          .status(400)
          .json({ message: "You typed your old password incorrectly." });
        return;
      }

      if (email) {
        const updatedUser = await userQueries.updateById(userId, { email });

        res.status(200).json({ user: updatedUser });
        return;
      }
    }

    const newHashedPassword = await bcrypt.hash(newPassword, Number(SALT));

    // Get the user to be updated
    const updatedUser = await userQueries.updateById(userId, {
      password: newHashedPassword,
    });

    res.status(200).json({ user: updatedUser });
  }),
];
