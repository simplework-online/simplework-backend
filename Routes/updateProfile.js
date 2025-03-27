const express = require("express");
const router = express.Router();
const updateprofile = require("../Controllers/updateprofile");
const { updateProfile } = require("../Controllers/editProfile");
const upload = require("../Middlewares/upload");
const deleteProfile = require("../Controllers/deleteProfile");

router.put("/edit-profile", updateprofile.EditProfile);
router.put("/update-profile/:id", updateProfile);
router.get("/sigin-up", updateprofile.signupGet);
router.post("/delete-profile/:id", deleteProfile);

module.exports = router;
