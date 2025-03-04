import { Router } from "express";

import {
  create_user_word,
  delete_user_word,
  user_word_list,
} from "../controllers/user_word_controller";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { validatePageQuery } from "../middleware/validate_page_query";
import { validateSortQuery } from "../middleware/validate_sort_query";
import { validateUserWordId } from "../middleware/validate_user_word_id";

export const userWordRouter = Router({
  caseSensitive: true,
  mergeParams: true,
});

userWordRouter
  .route("/")
  .get(
    validatePageQuery,
    validateSortQuery,
    errorValidationHandler,
    user_word_list
  )
  .post(create_user_word);

userWordRouter.delete(
  "/:userWordId",
  validateUserWordId,
  errorValidationHandler,
  delete_user_word
);
