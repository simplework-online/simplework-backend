const express = require('express')
const router = express.Router()
const sendOffer = require('../Controllers/sendOffer/sendOffer');

router.post('/sendoffer', sendOffer.sendOfferPost);
router.get('/sendoffer', sendOffer.sendOfferGet);

module.exports = router
