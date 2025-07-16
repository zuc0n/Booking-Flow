const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getBookings, 
  getBooking, 
  cancelBooking 
} = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

// All booking routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(getBookings)
  .post(createBooking);

router.route('/:id')
  .get(getBooking)
  .delete(cancelBooking);

module.exports = router;