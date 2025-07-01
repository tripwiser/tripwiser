const express = require('express');
const router = express.Router();
const { generatePackingList, generateTravelTip } = require('../controllers/packingController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/packing/generate
// @desc    Generate a new packing list for a trip
// @access  Private
router.post('/generate', authMiddleware, generatePackingList);

// @route   POST api/packing/generate-tip
// @desc    Generate a travel tip
// @access  Public
router.post('/generate-tip', generateTravelTip);

module.exports = router;
