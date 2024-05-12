const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const bcrypt = require("bcryptjs");

// @desc    Get a user (public details)
// @route   GET /api/users/:userId
// @access  Private 
export const user_detail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    res.status(200).json(user);
});

// @desc    Update user details
// @route   PUT /api/users/:userId
// @access  Private
export const user_update = [
    // Validate and sanitize fields
    body("username").trim().escape().custom(async (value) => {
        try {
            const user = await User.findOne({ username: value });
            if (user) {
                return Promise.reject("Username already in use");
            }
        } catch (error) {
            return Promise.reject("Server Error");
        }
    }),
    body("oldPassword")
        .custom((value, { req }) => {
            if (value && !req.body.newPassword && !req.body.newPasswordConfirmation) {
                throw new Error(
                    "At least one of oldPassword, newPassword, or newPasswordConfirmation is required"
                );
            }
            return true;
        }),
    body("newPassword")
        .custom((value, { req }) => {
            if (value && !req.body.oldPassword && !req.body.newPasswordConfirmation) {
                throw new Error(
                    "At least one of oldPassword, newPassword, or newPasswordConfirmation is required"
                );
            }
            return true;
        }),
    body("newPasswordConfirmation")
        .custom((value, { req }) => {
            if (value && !req.body.oldPassword && !req.body.newPassword) {
                throw new Error(
                    "At least one of oldPassword, newPassword, or newPasswordConfirmation is required"
                );
            }
            return true;
        }),
    asyncHandler(async (req, res) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json(errors.array());
            return;
        }

        const { oldPassword, newPassword, newPasswordConfirmation } = req.body;

        const hashedPassword = await bcrypt.hash(oldPassword, 10);

        const user = await User.find({ _id: req.params.userId, password: hashedPassword }).exec();

        if (!user) {
            res.status(400).json({ message: "You typed your old password incorrectly" });
            return;
        }

        if (newPassword !== newPasswordConfirmation) {
            res.status(400).json({ message: "'New Password' and 'Confirm New Password' are not equal" })
            return;
        }

        const newHashedPassword = await bcrypt.hash(netPassword, 10);

        // Get the user to be updated
        const updatedUser = await User.findByIdAndUpdate(req.params.userId, { password: newHashedPassword }, { new: true }).exec();

        res.json(updatedUser);
    })
]

// @desc    Delete single user
// @route   DELETE /api/user/:userId
// @access  Private
export const user_delete = asyncHandler(async (req, res, next) => {
    // User found, continue with deletion operations
    const user = await User.findOneAndDelete({ _id: req.params.userId })
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
    })
})