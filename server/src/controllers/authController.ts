import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import passport from "passport";
import User from "../models/user";

// @desc    Get the current user (public details)
// @route   GET /api/auth/current
// @access  Private
export const current_user = asyncHandler(async (req, res) => {
  res.status(200).json(req.user ? req.user : null);
});

// @desc    Authenticate a user and return cookie
// @route   POST /api/auth/login
// @access  Public
export const login_user = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { failWithError: false },
    (err: Error, user: Express.User) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "No such user exists." });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.status(200).json(user);
      });
    }
  )(req, res, next);
};

// @desc    Logout a user
// @route   GET /api/auth/logout
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
    res.status(200).json({ message: "User successfully logged out." });
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup_user = [
  // Validate and sanitize fields.
  body("username", "'Username' is required.").trim().escape(),
  body("password", "'Password' is required.").trim().escape(),
  // Process request after validation and sanitization.
  asyncHandler(async (req, res) => {
    // Extract validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      res.status(400).json(errors.array());
      return;
    }

    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
  }),
  login_user,
];
