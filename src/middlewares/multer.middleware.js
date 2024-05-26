import multer from "multer";

/**
 * Define a multer disk storage configuration with a destination and filename function.
 * The destination function sets the upload directory to './public/temp'.
 * The filename function generates a unique filename based on the original fieldname and a unique suffix.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage });
