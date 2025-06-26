const express = require('express');
const router = express.Router();
const { generatePackingList } = require('../controllers/packingController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/packing/generate
// @desc    Generate a new packing list for a trip
// @access  Private
router.post('/generate', authMiddleware, generatePackingList);

module.exports = router;
