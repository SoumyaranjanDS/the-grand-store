const express = require('express');
const router = express.Router();
const { subscribeNewsletter, getSubscribers, sendBulkNewsletter } = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/authMiddleware');
const Newsletter = require('../models/Newsletter');

router.get('/patch-legacy-subs', async (req, res) => {
  try {
    const result = await Newsletter.updateMany(
      { $or: [{ country: 'Unknown' }, { country: { $exists: false } }, { country: null }] },
      { $set: { country: 'India', ipAddress: 'Legacy User' } }
    );
    res.json({ message: 'Patch successful!', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', protect, admin, getSubscribers);
router.post('/send', protect, admin, sendBulkNewsletter);

module.exports = router;
