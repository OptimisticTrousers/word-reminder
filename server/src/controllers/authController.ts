import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import passport from "passport";
import User from "../models/user";

// @desc    Authenticate a user and return cookie
// @route   POST /api/auth/login
// @access  Public
export const login_user = passport.authenticate("local");

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
// @route   POST /api/auth/register
// @access  Public
export const register_user = [
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
    console.log("good");
  }),
  login_user,
];
