import { Router } from "express";
import {
  word_create,
  word_delete,
  word_list,
  word_search,
  word_update,
} from "../controllers/wordController";

const router = Router();

router.route("/").get(word_list).post(word_create);
router.route("/:wordId").put(word_update).delete(word_delete);
router.get("/:query", word_search);

export default router;
