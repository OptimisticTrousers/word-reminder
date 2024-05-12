const User = require("../models/user");
const { body } = require("express-validator");
const asyncHandler = require("express-async-handler");
const passport = require("passport");

// @desc    Authenticate a user and return JWT token
// @route   POST /api/auth/login
// @access  Public
export const login_user = passport.authenticate("local");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// Handle register on POST
export const register_user = [
    // Validate and sanitize fields.
    body("username", "Username is required")
        .trim()
        .escape(),
    body("password", "Password is required")
        .trim()
        .escape(),
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
            words: []
        });

        await user.save();
    }), passport.authenticate("local")
];

// @desc    Logout a user
// @route   GET /api/auth/logout
// @access  Public
export const logout_user = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.send("Logged out!")
    })
};
