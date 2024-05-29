import { Router } from "express";
import {
  word_create,
  word_delete,
  word_list,
} from "../controllers/wordController";
const router = Router({ mergeParams: true });

router.route("/").get(word_list).post(word_create);
router.delete("/:wordId", word_delete);

export default router;
