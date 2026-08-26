const express = require('express');
const router = express.Router();
const payfastController = require('../controllers/payfastController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-shop', protect, payfastController.generateShopPayment);
router.post('/generate-auction', protect, payfastController.generateAuctionPayment);
router.post('/generate-event', protect, payfastController.generateEventPayment);
router.post('/generate-vendor', protect, payfastController.generateVendorPayment);
// PayFast posts ITNs as application/x-www-form-urlencoded form data, not JSON.
// Keep this parser on the public callback route so req.body contains the
// payment_status, m_payment_id, and signature fields sent by PayFast.
router.post('/itn', express.urlencoded({ extended: true, type: '*/*' }), payfastController.itnWebhook);

module.exports = router;
