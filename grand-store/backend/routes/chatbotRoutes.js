const express = require('express');
const router = express.Router();
const {
  getAnswer,
  getPublicFAQs,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} = require('../controllers/chatbotController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/message', getAnswer);
router.get('/faqs', getPublicFAQs);

// Admin routes
router.get('/admin/faqs', protect, admin, getAllFAQs);
router.post('/admin/faqs', protect, admin, createFAQ);
router.put('/admin/faqs/:id', protect, admin, updateFAQ);
router.delete('/admin/faqs/:id', protect, admin, deleteFAQ);

module.exports = router;
