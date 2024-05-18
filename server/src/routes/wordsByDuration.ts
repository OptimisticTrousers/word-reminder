import { Router } from "express";
import {
  words_by_duration_create,
  words_by_duration_delete,
  words_by_duration_get,
  words_by_duration_list,
  words_by_duration_update,
} from "../controllers/wordsByDurationController";

const router = Router();

router.route("/").get(words_by_duration_list).post(words_by_duration_create);

router
  .route("/:wordsByDurationId")
  .get(words_by_duration_get)
  .put(words_by_duration_update)
  .delete(words_by_duration_delete);

export default router;
