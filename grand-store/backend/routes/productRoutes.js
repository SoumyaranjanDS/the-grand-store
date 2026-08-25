const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, getVendorProducts, updateProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.route('/')
  .get(getProducts)
  .post(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'factSheetPdf', maxCount: 1 }]), createProduct);

router.route('/vendor/me').get(protect, getVendorProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'factSheetPdf', maxCount: 1 }]), updateProduct);

module.exports = router;
