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

// Bank Transfer Routes
const { uploadProofOfPayment, approvePayment, rejectPayment } = require('../controllers/bankTransferController');
router.route('/:orderId/bank-transfer/upload').post(protect, uploadProofOfPayment);
router.route('/:orderId/bank-transfer/approve').post(protect, approvePayment); // In real world, add admin protect
router.route('/:orderId/bank-transfer/reject').post(protect, rejectPayment); // In real world, add admin protect

module.exports = router;
