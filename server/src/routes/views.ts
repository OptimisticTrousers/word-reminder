import { Router } from "express";

import {
  change_email,
  change_password,
  failed_verification,
  forgot_password,
  index,
} from "../controllers/views_controller";
import { validateUserId } from "../middleware/validate_user_id";
import { validateToken } from "../middleware/validate_token";

export const viewRouter = Router({ caseSensitive: true });

viewRouter.get(
  "/change-email/:userId&:token",
  validateUserId,
  validateToken,
  change_email
);
viewRouter.get(
  "/change-password/:userId&:token",
  validateUserId,
  validateToken,
  change_password
);
viewRouter.get("/failed-verification", failed_verification);
viewRouter.get(
  "/forgot-password/:userId&:token",
  validateUserId,
  validateToken,
  forgot_password
);
viewRouter.get("/", index);
