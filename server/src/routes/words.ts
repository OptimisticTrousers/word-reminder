import { Router } from "express";
import {
  delete_user_word,
  // word_create,
  // word_list,
} from "../controllers/wordController";

const router = Router({ mergeParams: true });

// router.route("/").get(word_list).post(word_create);
router.delete("/:wordId", delete_user_word);

export default router;
