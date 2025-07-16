const Room = require('../models/Room');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

/**
 * @desc    Search for available rooms
 * @route   POST /api/rooms/search
 * @access  Public
 */
exports.searchRooms = async (req, res) => {
  try {
    const { guests, checkIn, checkOut } = req.body;

    // Validate input
    if (!guests || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide guests count, check-in and check-out dates'
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

    // Find rooms that can accommodate the number of guests
    const rooms = await Room.find({
      capacity: { $gte: guests },
      isAvailable: true
    });

    // Find bookings that overlap with the requested dates
    const overlappingBookings = await Booking.find({
      status: 'upcoming',
      $or: [
        // Check-in date falls within an existing booking
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate }
        }
      ]
    }).select('roomId');

    // Extract room IDs that are already booked
    const bookedRoomIds = overlappingBookings.map(booking => 
      booking.roomId.toString()
    );

    // Filter out rooms that are already booked
    const availableRooms = rooms.filter(room => 
      !bookedRoomIds.includes(room._id.toString())
    );

    // Calculate number of nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Add total price for the stay to each room
    const roomsWithPrice = availableRooms.map(room => {
      const roomObj = room.toObject();
      roomObj.totalPrice = room.price * nights;
      roomObj.nights = nights;
      return roomObj;
    });

    res.status(200).json({
      success: true,
      count: roomsWithPrice.length,
      data: roomsWithPrice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching for rooms',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all rooms
 * @route   GET /api/rooms
 * @access  Public
 */
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting rooms',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single room
 * @route   GET /api/rooms/:id
 * @access  Public
 */
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error getting room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};