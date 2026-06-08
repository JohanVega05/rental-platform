const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const { createReview, getPropertyReviews } = require('../controllers/reviews.controller')

router.post('/', auth, createReview)
router.get('/property/:propertyId', getPropertyReviews)

module.exports = router