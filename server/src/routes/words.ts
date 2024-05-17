import { Router } from "express";
import { words_by_duration_get_random } from "../controllers/wordsByDurationController";
import {
  word_create,
  word_delete,
  word_list,
} from "../controllers/wordController";
const router = Router();

router.route("/").get(word_list).post(word_create);
router.delete("/:wordId", word_delete);
router.get("/random", words_by_duration_get_random);

export default router;
