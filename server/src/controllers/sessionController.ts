import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import passport from "passport";

// @desc    Get the current user (public details)
// @route   GET /api/session
// @access  Private
export const current_user = asyncHandler(async (req, res): Promise<void> => {
  res.status(200).json({ user: req.user });
});

// @desc    Authenticate a user and return cookie
// @route   POST /api/session
// @access  Public
export const login_user = asyncHandler(
  // Process request after validation and sanitization.
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    passport.authenticate("local", (err: Error, user: Express.User) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ user: null });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.status(200).json({ user });
      });
    })(req, res, next);
  }
);

// @desc    Logout a user
// @route   DELETE /api/session
// @access  Public
export const logout_user = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.status(204).json({});
    });
  }
);
