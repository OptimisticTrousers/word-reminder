const { Router } = require("express");
const { word_list, word_create, word_delete, word_search } = require("../controllers/wordController");

const router = Router();

router.route("/").get(word_list).post(word_create);
router.route("/:wordId").delete(word_delete);
router.route("/:query").get(word_search);

export default router;