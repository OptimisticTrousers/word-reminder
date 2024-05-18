import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { logout_user } from "./authController";
import User from "../models/user";
import UserWord from "../models/userWord";
import WordsByDuration from "../models/wordsByDuration";
import { CustomError } from "../utils/types";

// @desc    Delete single user
// @route   DELETE /api/user/:userId
// @access  Private
export const user_delete = [
  asyncHandler(async (req) => {
    const { userId } = req.params;
    // User found, continue with deletion operations
    await UserWord.deleteMany({ userId }).exec();
    await WordsByDuration.deleteMany({ userId }).exec();
    await User.findByIdAndDelete(userId).exec();
    // Log the user out
  }),
  logout_user,
];

// @desc    Get a user (public details)
// @route   GET /api/users/:userId
// @access  Private
export const user_detail = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = User.findById(userId).exec();
  res.status(200).json(user);
});

// @desc    Update user details
// @route   PUT /api/users/:userId
// @access  Private
export const user_update = [
  // Validate and sanitize fields
  body("username")
    .trim()
    .escape()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ username: value }).exec();
        if (user) {
          return Promise.reject("Username already in use");
        }
      } catch (error) {
        return Promise.reject("Server Error");
      }
    }),
  body("theme").trim().escape(),
  body("oldPassword")
    // Only validate if the old password has been provided
    .if(body("newPassword").notEmpty())
    .if(body("newPasswordConfirmation").notEmpty()),
  body("newPassword")
    // Only validate if the old password has been provided
    .if(body("oldPassword").notEmpty())
    .if(body("newPasswordConfirmation").notEmpty()),
  body("newPasswordConfirmation")
    // Only validate if the old password has been provided
    .if(body("oldPassword").notEmpty())
    .if(body("newPassword").notEmpty())
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        const error = new Error(
          "'New Password' and 'Confirm New Password' are not equal"
        );
        (error as CustomError).status = 400;
        throw error;
      }
    }),
  asyncHandler(async (req, res) => {
    // Extract the validation errors from a request.
    const { userId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
      return;
    }

    const { oldPassword, newPassword, username, theme } = req.body;

    if (theme) {
      // Get the user to be updated
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { theme },
        { new: true }
      ).exec();

      res.status(200).json(updatedUser);
      return;
    } else if (username) {
      // Get the user to be updated
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username },
        { new: true }
      ).exec();

      res.status(200).json(updatedUser);
      return;
    }

    const oldHashedPassword = await bcrypt.hash(oldPassword, 10);

    const user = await User.exists({
      _id: userId,
      username,
      password: oldHashedPassword,
    }).exec();

    if (!user) {
      res
        .status(400)
        .json({ message: "You typed your old password incorrectly" });
      return;
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Get the user to be updated
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: newHashedPassword },
      { new: true }
    ).exec();

    res.status(200).json(updatedUser);
  }),
];
