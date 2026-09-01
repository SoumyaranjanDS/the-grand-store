const express = require('express');
const router = express.Router();
const { subscribeNewsletter, getSubscribers, sendBulkNewsletter } = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', protect, admin, getSubscribers);
router.post('/send', protect, admin, sendBulkNewsletter);

module.exports = router;
