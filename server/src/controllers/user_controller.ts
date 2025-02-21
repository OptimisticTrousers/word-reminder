import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";

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
    await userQueries.deleteById(userId);
    await userWordQueries.deleteAllByUserId(userId);
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
  body("oldPassword")
    .escape()
    .isLength({ min: 1 })
    .withMessage("'oldPassword' must be specified."),
  body("newPassword")
    .optional()
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
      return true;
    })
    .trim()
    .escape(),
  body("newPasswordConfirmation")
    .optional()
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
      if (value !== req.body.newPassword) {
        throw new CustomBadRequestError(
          "'newPassword' and 'newPasswordConfirmation' must be equal."
        );
      }
      return true;
    })
    .trim()
    .escape(),
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const { oldPassword, newPassword, newPasswordConfirmation, email } =
      req.body;

    const oldHashedPassword = await bcrypt.hash(oldPassword, Number(SALT));

    const user = await userQueries.get({ email, password: oldHashedPassword });

    if (!user) {
      res
        .status(400)
        .json({ message: "You typed your old password incorrectly." });
      return;
    }

    if (!newPassword && !newPasswordConfirmation) {
      const updatedUser = await userQueries.updateById(userId, { email });

      res.status(200).json({ user: updatedUser });
      return;
    }

    const newHashedPassword = await bcrypt.hash(newPassword, Number(SALT));

    // Get the user to be updated
    const updatedUser = await userQueries.updateById(userId, {
      password: newHashedPassword,
    });

    res.status(200).json({ user: updatedUser });
  }),
];
