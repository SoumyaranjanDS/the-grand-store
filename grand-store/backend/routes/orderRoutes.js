const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getVendorOrders,
  getMyOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/vendor/sales').get(protect, getVendorOrders);
router.route('/:id').get(protect, getOrderById);

module.exports = router;
