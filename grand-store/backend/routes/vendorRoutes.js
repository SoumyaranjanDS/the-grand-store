const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const vendorController = require('../controllers/vendorController');
const vendorShippingController = require('../controllers/vendorShippingController');
const { protect } = require('../middleware/authMiddleware');

// Set up Multer for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Shipping Profile Routes
router.get('/shipping-profile', vendorShippingController.getShippingProfile);
router.put('/shipping-profile', vendorShippingController.updateShippingProfile);

module.exports = router;
