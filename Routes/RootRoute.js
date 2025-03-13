const express = require("express");
const router = express.Router();

router.use("/", require("./Login"));
router.use("/", require("./Talent"));
router.use("/guest", require("./Guest"));
router.use("/buyer", require("./Buyer"));
router.use("/", require("./Review"));
router.use("/", require("./Chat"));
router.use("/", require("./Category"));
router.use("/", require("./notification"));
router.use("/", require("./JobPost"));
module.exports = router;
