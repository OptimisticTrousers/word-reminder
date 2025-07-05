import { Router } from "express";

import {
  change_email,
  change_password,
  index,
  about,
  privacy,
  failed_verification,
  confirm_account,
} from "../controllers/views_controller";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { validateToken } from "../middleware/validate_token";
import { validateUserId } from "../middleware/validate_user_id";

export const viewRouter = Router({ caseSensitive: true });

viewRouter.get("/", index);

viewRouter.get(
  `/changePassword/:userId&:token`,
  validateUserId,
  validateToken,
  errorValidationHandler,
  change_password
);

viewRouter.get(
  `/confirmAccount/:userId&:token`,
  validateUserId,
  validateToken,
  errorValidationHandler,
  confirm_account
);

viewRouter.get(
  `/changeEmail/:userId&:token`,
  validateUserId,
  validateToken,
  errorValidationHandler,
  change_email
);

viewRouter.get("/failedVerification", failed_verification);

viewRouter.get("/home", index);

viewRouter.get("/about", about);

viewRouter.get("/privacy", privacy);
