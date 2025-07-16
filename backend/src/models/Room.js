const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Room title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    required: [true, 'Room image URL is required']
  },
  // Additional fields that might be useful
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    default: 2
  },
  amenities: {
    type: [String],
    default: []
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if room is available for given dates and guest count
roomSchema.methods.isAvailableForBooking = async function(checkIn, checkOut, guestCount) {
  // This is a placeholder for actual availability logic
  // In a real application, you would check against existing bookings
  if (!this.isAvailable) {
    return false;
  }
  
  if (guestCount > this.capacity) {
    return false;
  }
  
  // Here you would check if there are any overlapping bookings
  // This would require querying the Booking model
  
  return true;
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;