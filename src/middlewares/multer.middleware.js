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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

export const upload = multer({ storage: storage });
