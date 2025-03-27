const express = require('express')
const {getProfile} = require('../Controllers/Profile/Profile')
const router = express.Router()


router.get('/get-profile', getProfile)

module.exports = router