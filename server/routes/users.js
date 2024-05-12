const { Router } = require("express");
const { user_detail, user_update } = require("../controllers/userController");

const router = Router();

router.route("/:userId").get(user_detail).put(user_update).delete(user_delete);

module.exports = router;