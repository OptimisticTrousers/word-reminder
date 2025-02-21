import asyncHandler from "express-async-handler";

import { userQueries } from "../db/user_queries";
import { User } from "common";

export const validateUserId = asyncHandler(
  async (req, res, next): Promise<void> => {
    const userId: string = req.params.userId;
    if (isNaN(Number(userId))) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    const currentUser = req.user as User;

    if (userId !== String(currentUser.id)) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    const user: User | undefined = await userQueries.getById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    next();
  }
);
