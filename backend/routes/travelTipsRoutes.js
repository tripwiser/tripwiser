const express = require('express');
const router = express.Router();
const { generateDailyTip, generateMultipleTips, TIP_CATEGORIES } = require('../services/travelTipsAIService');

// GET /api/travel-tips/daily
// Get the daily tip (generates a new one each day)
router.get('/daily', async (req, res) => {
  console.log('GET /api/travel-tips/daily called');
  console.log('Headers:', req.headers);
  console.log('Origin:', req.headers.origin);
  
  try {
    const { category, destination } = req.query;
    
    console.log('Generating daily tip with params:', { category, destination });
    
    const tip = await generateDailyTip(category, destination);
    
    console.log('Generated daily tip:', tip);
    
    res.json({
      success: true,
      tip,
      message: 'Daily travel tip generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating daily tip:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate daily travel tip'
    });
  }
});

// GET /api/travel-tips/multiple
// Generate multiple tips for different categories
router.get('/multiple', async (req, res) => {
  console.log('GET /api/travel-tips/multiple called');
  try {
    const { count = 5 } = req.query;
    
    console.log('Generating multiple tips, count:', count);
    
    const tips = await generateMultipleTips(parseInt(count));
    
    console.log('Generated tips count:', tips.length);
    
    res.json({
      success: true,
      tips,
      count: tips.length,
      message: 'Multiple travel tips generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating multiple tips:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate multiple travel tips'
    });
  }
});

// GET /api/travel-tips/categories
// Get available tip categories
router.get('/categories', async (req, res) => {
  console.log('GET /api/travel-tips/categories called');
  try {
    res.json({
      success: true,
      categories: TIP_CATEGORIES,
      message: 'Tip categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to get tip categories'
    });
  }
});

// POST /api/travel-tips/generate
// Generate a specific tip with custom parameters
router.post('/generate', async (req, res) => {
  console.log('POST /api/travel-tips/generate called. Body:', req.body);
  try {
    const { category, destination } = req.body;
    
    if (!category || !TIP_CATEGORIES[category]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be one of: ' + Object.keys(TIP_CATEGORIES).join(', ')
      });
    }
    
    console.log('Generating custom tip with params:', { category, destination });
    
    const tip = await generateDailyTip(category, destination);
    
    console.log('Generated custom tip:', tip);
    
    res.json({
      success: true,
      tip,
      message: 'Custom travel tip generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating custom tip:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate custom travel tip'
    });
  }
});

module.exports = router; 