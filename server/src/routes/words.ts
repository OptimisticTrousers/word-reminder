import { Router } from "express";

import {
  delete_user_word,
  create_word,
  word_list,
} from "../controllers/wordController";
import { validatePageQuery } from "../middleware/validatePageQuery";
import { validateSortQuery } from "../middleware/validateSortQuery";
import { validateUserId } from "../middleware/validateUserId";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(validateUserId, validatePageQuery, validateSortQuery, word_list)
  .post(validateUserId, create_word);
router.delete("/:wordId", validateUserId, delete_user_word);

export default router;
