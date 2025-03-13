const multer = require("multer");

const storage = multer.diskStorage({
  destination: "upload",
  filename: (req, file, cb) => {
    return cb(null, `img_${Date.now()}.${file.mimetype.split("/")[1]}`);
  },
});

const isImage = (req, file, CallB) => {
  if (file.mimetype.startsWith("image")) {
    CallB(null, true);
  } else {
    console.log("only images are allowed");
  }
};
const upload = multer({
  storage: storage,
  fileFilter: isImage,
  limits: {
    fileSize: 10000000,
  },
});

module.exports = upload;