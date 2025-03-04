import { Router } from "express";

import {
  confirm_account,
  change_email,
  change_password,
  index,
  failed_verification,
  forgot_password,
} from "../controllers/views_controller";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { validateToken } from "../middleware/validate_token";
import { validateUserId } from "../middleware/validate_user_id";

export const viewRouter = Router({ caseSensitive: true });

viewRouter.get(
  "/confirmAccount/:userId&:token",
  validateUserId,
  validateToken,
  errorValidationHandler,
  confirm_account
);

viewRouter.get(
  "/changePassword/:userId&:token",
  validateUserId,
  validateToken,
  errorValidationHandler,
  change_password
);

viewRouter.get(
  "/changeEmail/:userId&:token",
  validateUserId,
  validateToken,
  errorValidationHandler,
  change_email
);

viewRouter.get("/", index);

viewRouter.get("/failedVerification", failed_verification);

viewRouter.get(
  "/forgotPassword/:userId&:token",
  validateUserId,
  validateToken,
  errorValidationHandler,
  forgot_password
);
