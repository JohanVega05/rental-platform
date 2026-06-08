const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const {
  createBooking,
  getMyBookings,
  getPropertyBookings,
  updateBookingStatus,
  cancelBooking,
  getOwnerBookings
} = require('../controllers/bookings.controller')

router.post('/', auth, createBooking)
router.get('/my-bookings', auth, getMyBookings)
router.get('/property/:propertyId', auth, getPropertyBookings)
router.get('/owner-bookings', auth, getOwnerBookings)
router.put('/:id/status', auth, updateBookingStatus)
router.put('/:id/cancel', auth, cancelBooking)

module.exports = router