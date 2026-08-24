const express = require('express');
const router = express.Router();
const { subscribeNewsletter, getSubscribers } = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', protect, admin, getSubscribers);

module.exports = router;
