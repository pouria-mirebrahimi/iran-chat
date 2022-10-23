const multer = require("multer");

const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|pdf|doc|docx|txt)$/)) {
      return cb(new Error("باید فایل با پسوند مناسب آپلود شود"));
    }

    cb(undefined, true);
  },
});

module.exports = upload;
