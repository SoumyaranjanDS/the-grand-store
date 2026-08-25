const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, getVendorProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.route('/')
  .get(getProducts)
  .post(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'factSheetPdf', maxCount: 1 }]), createProduct);

router.route('/vendor/me').get(protect, getVendorProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'factSheetPdf', maxCount: 1 }]), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
