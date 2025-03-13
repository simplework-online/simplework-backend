const express = require('express')
const { createNotification, getNotifications } = require('../Controllers/Notification/notification')
const router = express.Router()

router.post('/notification', createNotification)
router.get('/notification', getNotifications)

module.exports = router
