const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const vendorController = require('../controllers/vendorController');
const vendorShippingController = require('../controllers/vendorShippingController');
const financeController = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

const { storage } = require('../config/cloudinary');

const upload = multer({ storage: storage });

// Unauthenticated routes for public vendor onboarding
router.post('/register-full', vendorController.registerFullVendor);
router.post('/upload-public', upload.single('document'), vendorController.uploadDocument);

// All vendor routes below should be protected
router.use(protect);

router.get('/onboarding', vendorController.getOnboardingProgress);
router.post('/onboarding', vendorController.saveOnboardingProgress);
router.post('/onboarding/upload', upload.single('document'), vendorController.uploadDocument);
router.post('/onboarding/submit', vendorController.submitApplication);
router.post('/simulate-payment', vendorController.simulatePayment);

// Store Profile Routes
router.get('/store-profile', vendorController.getStoreProfile);
router.put('/store-profile', vendorController.updateStoreProfile);

// Shipping Profile Routes
router.get('/shipping-profile', vendorShippingController.getShippingProfile);
router.put('/shipping-profile', vendorShippingController.updateShippingProfile);

// Financial / Wallet Routes
router.get('/wallet', financeController.getVendorWallet);

module.exports = router;
