const express = require('express');
const router = express.Router();
const { getNearestStores } = require('../controllers/postnetController');
const { protect } = require('../middleware/authMiddleware');

// Get nearest postnet stores based on address
router.get('/locator', protect, getNearestStores);

module.exports = router;
