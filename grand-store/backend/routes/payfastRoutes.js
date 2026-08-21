const express = require('express');
const router = express.Router();
const payfastController = require('../controllers/payfastController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-shop', protect, payfastController.generateShopPayment);
router.post('/generate-auction', protect, payfastController.generateAuctionPayment);
router.post('/generate-event', protect, payfastController.generateEventPayment);
router.post('/itn', payfastController.itnWebhook);

module.exports = router;
