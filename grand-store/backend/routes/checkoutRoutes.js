const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

router.post('/quote', protect, checkoutController.generateQuote);

module.exports = router;
