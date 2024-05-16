import { Router } from "express";
import multer, { FileFilterCallback } from "multer";
import {
  word_create,
  word_delete,
  word_list,
  word_search,
  word_upload,
} from "../controllers/wordController";

const csvFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  console.log("Reading file in middleware: ", file.originalname);
  if (file.mimetype.includes("csv")) {
    cb(null, true);
  } else {
    return cb(null, false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: csvFilter,
});
const router = Router();

router.route("/").get(word_list).post(word_create);
router.post("/upload", upload.single("file"), word_upload);
router.delete("/:wordId", word_delete);
router.get("/:query", word_search);

export default router;
