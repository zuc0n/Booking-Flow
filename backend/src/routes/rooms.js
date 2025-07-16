const express = require('express');
const router = express.Router();
const { searchRooms, getRooms, getRoom } = require('../controllers/rooms');

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/search', searchRooms);

module.exports = router;