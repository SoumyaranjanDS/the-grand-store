const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const vendorController = require('../controllers/vendorController');
const vendorShippingController = require('../controllers/vendorShippingController');
const financeController = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

const { storage } = require('../config/cloudinary');

const allowedDocumentExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.heif', '.doc', '.docx']);
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (!allowedDocumentExtensions.has(extension)) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'document'));
    }
    return callback(null, true);
  },
});

const uploadSingleDocument = (req, res, next) => {
  upload.single('document')(req, res, (error) => {
    if (!error) return next();
    console.error('Vendor document upload error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'The selected file is larger than 10 MB.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unsupported file type. Upload an image, PDF, DOC or DOCX file.' });
    }
    return res.status(400).json({ message: 'The document could not be uploaded.', error: error.message || String(error) });
  });
};

// Unauthenticated routes for public vendor onboarding
router.post('/register-full', vendorController.registerFullVendor);
router.post('/upload-public', uploadSingleDocument, vendorController.uploadDocument);

// All vendor routes below should be protected
router.use(protect);

router.get('/onboarding', vendorController.getOnboardingProgress);
router.post('/onboarding', vendorController.saveOnboardingProgress);
router.post('/onboarding/upload', uploadSingleDocument, vendorController.uploadDocument);
router.post('/onboarding/submit', vendorController.submitApplication);
router.post('/apply-coupon', vendorController.applyCoupon);

// Store Profile Routes
router.get('/store-profile', vendorController.getStoreProfile);
router.put('/store-profile', vendorController.updateStoreProfile);

// Shipping Profile Routes
router.get('/shipping-profile', vendorShippingController.getShippingProfile);
router.put('/shipping-profile', vendorShippingController.updateShippingProfile);

// Financial / Wallet Routes
router.get('/wallet', financeController.getVendorWallet);

module.exports = router;
