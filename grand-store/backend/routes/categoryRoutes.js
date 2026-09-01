const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, superAdmin, productStaff } = require('../middleware/authMiddleware');

router.route('/')
  .get(categoryController.getCategories)
  .post(protect, productStaff, categoryController.createCategory);

router.route('/admin')
  .get(protect, productStaff, categoryController.getAdminCategories);

router.route('/:id')
  .put(protect, productStaff, categoryController.updateCategory)
  .delete(protect, superAdmin, categoryController.deleteCategory);

module.exports = router;
