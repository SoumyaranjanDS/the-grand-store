const express = require('express');
const router = express.Router();
const { 
  createEnquiry, 
  getAdminEnquiries, 
  updateEnquiryStatus 
} = require('../controllers/tradeEnquiryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route for form submission
router.post('/', createEnquiry);

// Protected Admin routes
router.get('/', protect, admin, getAdminEnquiries);
router.put('/:id/status', protect, admin, updateEnquiryStatus);

module.exports = router;
