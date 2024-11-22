import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

import { OmitPassword, UserQueries } from "../db/userQueries";
import { UserWordQueries } from "../db/userWordQueries";
import { variables } from "../utils/variables";

const userQueries = new UserQueries();
const userWordQueries = new UserWordQueries();

// @desc    Delete single user
// @route   DELETE /api/users/:userId
// @access  Private
export const delete_user = asyncHandler(
  async (req, _res, next): Promise<void> => {
    const userId: string = req.params.userId;
    await userQueries.deleteUserById(userId);
    await userWordQueries.deleteAllUserWords(userId);
    next();
  }
);

// // @desc    Update user details
// // @route   PUT /api/users/:userId
// // @access  Private
// export const user_update = [
//   // Validate and sanitize fields
//   body("username")
//     .trim()
//     .escape()
//     .custom(async (value) => {
//       try {
//         const user = await User.findOne({ username: value }).exec();
//         if (user) {
//           return Promise.reject("Username already in use");
//         }
//       } catch (error) {
//         return Promise.reject("Server Error");
//       }
//     }),
//   body("theme").trim().escape(),
//   body("oldPassword")
//     // Only validate if the old password has been provided
//     .if(body("newPassword").notEmpty())
//     .if(body("newPasswordConfirmation").notEmpty()),
//   body("newPassword")
//     // Only validate if the old password has been provided
//     .if(body("oldPassword").notEmpty())
//     .if(body("newPasswordConfirmation").notEmpty()),
//   body("newPasswordConfirmation")
//     // Only validate if the old password has been provided
//     .if(body("oldPassword").notEmpty())
//     .if(body("newPassword").notEmpty())
//     .custom((value, { req }) => {
//       if (value !== req.body.newPassword) {
//         return Promise.reject(
//           "'New Password' and 'Confirm New Password' are not equal"
//         );
//       }
//     }),
//   asyncHandler(async (req, res) => {
//     // Extract the validation errors from a request.
//     const { userId } = req.params;
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       res.status(400).json(errors.array());
//       return;
//     }

//     const { oldPassword, newPassword, username, theme } = req.body;

//     if (theme) {
//       // Get the user to be updated
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { theme },
//         { new: true }
//       ).exec();

//       res.status(200).json(updatedUser);
//       return;
//     } else if (username) {
//       // Get the user to be updated
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { username },
//         { new: true }
//       ).exec();

//       res.status(200).json(updatedUser);
//       return;
//     }

//     const oldHashedPassword = await bcrypt.hash(oldPassword, 10);

//     const user = await User.exists({
//       _id: userId,
//       username,
//       password: oldHashedPassword,
//     }).exec();

//     if (!user) {
//       res
//         .status(400)
//         .json({ message: "You typed your old password incorrectly" });
//       return;
//     }

//     const newHashedPassword = await bcrypt.hash(newPassword, 10);

//     // Get the user to be updated
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { password: newHashedPassword },
//       { new: true }
//     ).exec();

//     res.status(200).json(updatedUser);
//   }),
// ];

// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const signup_user =
  // Process request after validation and sanitization.
  asyncHandler(async (req, res): Promise<void> => {
    const hashedPassword: string = await bcrypt.hash(
      req.body.password,
      Number(variables.SALT)
    );

    const user: OmitPassword | null = await userQueries.createUser(
      req.body.username,
      hashedPassword
    );

    res.status(200).json({ user });
  });
