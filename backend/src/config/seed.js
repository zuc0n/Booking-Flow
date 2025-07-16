const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Load environment variables
dotenv.config();

// Connect to MongoDB
// Use MONGO_URI with fallback to local MongoDB URI for development
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bookflow';
mongoose.connect(mongoURI)
  .then(() => {
    console.log(`Connected to MongoDB: ${mongoURI.split('@')[1] ? '...' + mongoURI.split('@')[1] : mongoURI}`);
    seedData();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample room data
const rooms = [
  {
    title: 'Deluxe King Room',
    description: 'Spacious room with a king-sized bed, en-suite bathroom, and city views. Features include a flat-screen TV, mini-bar, and free Wi-Fi.',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    capacity: 2,
    amenities: ['King Bed', 'City View', 'En-suite Bathroom', 'Mini Bar', 'Free Wi-Fi', 'Flat-screen TV']
  },
  {
    title: 'Superior Twin Room',
    description: 'Comfortable room with two twin beds, perfect for friends or colleagues traveling together. Includes a work desk, TV, and tea/coffee making facilities.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    capacity: 2,
    amenities: ['Twin Beds', 'Work Desk', 'Tea/Coffee Maker', 'Free Wi-Fi', 'Flat-screen TV']
  },
  {
    title: 'Family Suite',
    description: 'Spacious suite with a king-sized bed and sofa bed, ideal for families. Features a separate living area, two TVs, and a large bathroom with bathtub.',
    price: 220,
    imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    capacity: 4,
    amenities: ['King Bed', 'Sofa Bed', 'Separate Living Area', 'Bathtub', 'Free Wi-Fi', 'Two Flat-screen TVs', 'Mini Bar']
  },
  {
    title: 'Executive Suite',
    description: 'Luxurious suite with a king-sized bed, separate living room, and executive benefits including lounge access. Features premium amenities and panoramic views.',
    price: 300,
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    capacity: 2,
    amenities: ['King Bed', 'Separate Living Room', 'Executive Lounge Access', 'Premium Toiletries', 'Free Wi-Fi', 'Flat-screen TV', 'Mini Bar', 'Espresso Machine']
  },
  {
    title: 'Budget Single Room',
    description: 'Cozy room with a single bed, perfect for solo travelers. Includes all essential amenities for a comfortable stay at an affordable price.',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    capacity: 1,
    amenities: ['Single Bed', 'Desk', 'Free Wi-Fi', 'TV']
  },
  {
    title: 'Honeymoon Suite',
    description: 'Romantic suite with a king-sized bed, champagne on arrival, and a private balcony with stunning views. Features include a jacuzzi tub and premium amenities.',
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1602002418082-dd4a8f7d63db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    capacity: 2,
    amenities: ['King Bed', 'Private Balcony', 'Jacuzzi Tub', 'Champagne on Arrival', 'Free Wi-Fi', 'Flat-screen TV', 'Mini Bar', 'Premium Toiletries']
  }
];

// Sample user data
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Password123!'
  }
];

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const user of users) {
      const passwordHash = await User.hashPassword(user.password);
      const createdUser = await User.create({
        name: user.name,
        email: user.email,
        passwordHash
      });
      createdUsers.push(createdUser);
    }

    console.log(`Created ${createdUsers.length} users`);

    // Create rooms
    const createdRooms = await Room.insertMany(rooms);
    console.log(`Created ${createdRooms.length} rooms`);

    // Create sample bookings
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 30);

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 30);

    const pastCheckOut = new Date(pastDate);
    pastCheckOut.setDate(pastDate.getDate() + 3);

    const futureCheckIn = new Date(futureDate);
    const futureCheckOut = new Date(futureDate);
    futureCheckOut.setDate(futureDate.getDate() + 3);

    // Past booking
    await Booking.create({
      userId: createdUsers[0]._id,
      roomId: createdRooms[0]._id,
      checkIn: pastDate,
      checkOut: pastCheckOut,
      guests: 2,
      contact: {
        title: 'Mr',
        name: createdUsers[0].name,
        email: createdUsers[0].email
      },
      status: 'past',
      total: createdRooms[0].price * 3
    });

    // Upcoming booking
    await Booking.create({
      userId: createdUsers[0]._id,
      roomId: createdRooms[1]._id,
      checkIn: futureCheckIn,
      checkOut: futureCheckOut,
      guests: 2,
      contact: {
        title: 'Mr',
        name: createdUsers[0].name,
        email: createdUsers[0].email
      },
      status: 'upcoming',
      total: createdRooms[1].price * 3
    });

    console.log('Created sample bookings');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};