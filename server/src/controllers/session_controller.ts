import { User } from "common";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { body } from "express-validator";
import passport from "passport";

import { EMAIL_MAX, PASSWORD_MAX } from "../db/user_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";

// @desc    Get the current user (public details)
// @route   GET /api/sessions
// @access  Private
export const current_user = (req: Request, res: Response) => {
  const user = req.user as User & { password?: string };
  delete user.password;
  res.status(200).json({ user });
};

// @desc    Authenticate a user and return cookie
// @route   POST /api/sessions
// @access  Public
export const login_user = [
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
    .withMessage(`'email' must be a valid email.`),
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
  (req: Request, res: Response, next: NextFunction) => {
    (
      passport.authenticate(
        "local",
        (
          err: Error,
          user: Express.User & { id: number },
          info: { message: string }
        ) => {
          if (err) {
            return next(err);
          }

          if (!user) {
            return res.status(401).json({ user: null, message: info.message });
          }

          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
            res.status(200).json({ user });
          });
        }
      ) as RequestHandler
    )(req, res, next);
  },
];

// @desc    Logout a user
// @route   DELETE /api/sessions
// @access  Public
export const logout_user = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(204).json({});
  });
};
