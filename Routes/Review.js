const express = require('express')
const { PostReview, getReview, deleteReview, getReviewAll } = require('../Controllers/Review/Review')
const { auth } = require('../Middlewares/auth')
const router = express.Router()

router.post('/post-review', auth, PostReview)
router.get('/get-review/:orderId', auth, getReview)
router.get('/get-review-all', auth, getReviewAll)
router.delete('/delete-review/:orderId', auth, deleteReview)
module.exports = router

