const express = require('express')
const router = express.Router()
const updateprofile = require('../Controllers/updateprofile');
const { updateProfile} = require('../Controllers/editProfile');
const upload = require('../Middlewares/upload');

router.put('/edit-profile', updateprofile.EditProfile);
router.put('/update-profile/:id', updateProfile);
router.get('/sigin-up', updateprofile.signupGet);

module.exports = router
