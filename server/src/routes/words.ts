import { Router } from "express";

import {
  create_word,
  delete_user_word,
  word_list,
} from "../controllers/word_controller";
import { validatePageQuery } from "../middleware/validate_page_query";
import { validateSortQuery } from "../middleware/validate_sort_query";
import { validateUserId } from "../middleware/validate_user_id";

export const wordRouter = Router({ mergeParams: true });

wordRouter
  .route("/")
  .get(validateUserId, validatePageQuery, validateSortQuery, word_list)
  .post(validateUserId, create_word);

wordRouter.delete("/:wordId", validateUserId, delete_user_word);
