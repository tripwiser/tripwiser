const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get trending destinations
router.get('/trending', authMiddleware, destinationController.getTrendingDestinations);

// Get personalized suggestion
router.get('/personalized', authMiddleware, destinationController.getPersonalizedSuggestion);

// Get swipeable destinations
router.get('/swipeable', authMiddleware, destinationController.getSwipeableDestinations);
// Post swipe result
router.post('/swipe-result', authMiddleware, destinationController.postSwipeResult);

// Post like/dislike feedback
router.post('/feedback', authMiddleware, destinationController.postDestinationFeedback);

module.exports = router; 