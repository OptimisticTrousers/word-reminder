import multer, { FileFilterCallback } from "multer";
const csvFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  console.log("Reading file in middleware: ", file.originalname);
  if (file.mimetype.includes("csv")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: csvFilter,
});

export default upload;
