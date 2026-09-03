const express = require('express');
const router = express.Router();
const { 
  registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, 
  deleteUserProfile, googleAuth, getReferralSummary, verifyEmail, 
  forgotPassword, resetPassword, getCustomerBankDetails, updateCustomerBankDetails,
  getCustomerCalendarActivities, testBirthdayEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.post('/logout', logoutUser);
router.post('/google', googleAuth);
router.get('/profile', protect, getUserProfile);
router.get('/referrals', protect, getReferralSummary);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserProfile);
router.get('/banking', protect, getCustomerBankDetails);
router.put('/banking', protect, updateCustomerBankDetails);
router.get('/calendar-activities', protect, getCustomerCalendarActivities);
router.post('/test-birthday-email', protect, testBirthdayEmail);

module.exports = router;
