const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, superAdmin, productStaff } = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.route('/')
  .get(categoryController.getCategories)
  .post(protect, productStaff, categoryController.createCategory);

router.route('/admin')
  .get(protect, productStaff, categoryController.getAdminCategories);

router.route('/:id')
  .put(protect, productStaff, categoryController.updateCategory)
  .delete(protect, superAdmin, categoryController.deleteCategory);

router.post('/upload', protect, productStaff, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(200).json({ url: req.file.path, public_id: req.file.filename });
});

module.exports = router;
