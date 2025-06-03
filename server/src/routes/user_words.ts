import { Router } from "express";

import {
  create_user_word,
  delete_user_word,
  get_user_word,
  update_user_word,
  user_word_list,
} from "../controllers/user_word_controller";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { validatePageQuery } from "../middleware/validate_page_query";
import { validateSortQuery } from "../middleware/validate_sort_query";
import { validateUserWordId } from "../middleware/validate_user_word_id";
import { validateUserWord } from "../middleware/validate_user_word";

export const userWordRouter = Router({
  caseSensitive: true,
  mergeParams: true,
});

userWordRouter
  .route("/")
  .get(validatePageQuery, validateSortQuery, user_word_list)
  .post(create_user_word);

userWordRouter
  .route("/:userWordId")
  .delete(validateUserWordId, errorValidationHandler, delete_user_word)
  .get(validateUserWordId, errorValidationHandler, get_user_word)
  .put(
    validateUserWordId,
    validateUserWord,
    errorValidationHandler,
    update_user_word
  );
