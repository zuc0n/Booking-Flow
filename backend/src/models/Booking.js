const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least one guest is required'],
    max: [10, 'Maximum 10 guests allowed']
  },
  contact: {
    title: {
      type: String,
      required: [true, 'Title is required'],
      enum: ['Mr', 'Ms', 'Mrs', 'Dr', 'Other']
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['upcoming', 'cancelled', 'past'],
    default: 'upcoming'
  },
  total: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  reference: {
    type: String,
    unique: true,
    default: function() {
      // Generate a random reference number
      return 'BK' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual property for number of nights
bookingSchema.virtual('nights').get(function() {
  return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  return this.status === 'upcoming';
};

// Method to cancel booking
bookingSchema.methods.cancel = function() {
  if (this.canBeCancelled()) {
    this.status = 'cancelled';
    return true;
  }
  return false;
};

// Method to check if booking is past
bookingSchema.methods.checkIfPast = function() {
  const now = new Date();
  if (this.checkOut < now && this.status === 'upcoming') {
    this.status = 'past';
    return true;
  }
  return false;
};

// Set toJSON option to include virtuals
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;