const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, contactInfo } = req.body;

    // Validate input
    if (!roomId || !checkIn || !checkOut || !guests || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Parse dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date must be in the future'
      });
    }

    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is available for the requested dates
    const isAvailable = await room.isAvailableForBooking(checkInDate, checkOutDate, guests);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the requested dates or guest count'
      });
    }

    // Check for existing bookings that overlap with the requested dates
    const existingBooking = await Booking.findOne({
      roomId,
      status: 'upcoming',
      $or: [
        // Check-in date falls within an existing booking
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for the requested dates'
      });
    }

    // Calculate number of nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Calculate total price
    const total = room.price * nights;

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      contact: {
        title: contactInfo.title,
        name: contactInfo.name,
        email: contactInfo.email
      },
      total,
      status: 'upcoming'
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all bookings for the current user
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user._id };

    // Filter by status if provided
    if (status && ['upcoming', 'past', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Update booking statuses based on current date
    await updateBookingStatuses(req.user._id);

    // Find bookings
    const bookings = await Booking.find(query)
      .populate('roomId', 'title description price imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('roomId', 'title description price imageUrl');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to the current user
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    // Update booking status if needed
    booking.checkIfPast();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error getting booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to the current user
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }

    // Cancel booking
    booking.cancel();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to update booking statuses based on current date
 */
const updateBookingStatuses = async (userId) => {
  const now = new Date();
  
  // Find upcoming bookings with check-out date in the past
  const bookings = await Booking.find({
    userId,
    status: 'upcoming',
    checkOut: { $lt: now }
  });

  // Update status to 'past'
  for (const booking of bookings) {
    booking.status = 'past';
    await booking.save();
  }
};