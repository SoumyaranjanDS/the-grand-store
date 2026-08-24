const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const financeController = require('../controllers/financeController');
const testimonialController = require('../controllers/testimonialController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/vendors', adminController.getAllVendors);
router.put('/vendors/:id/status', adminController.updateVendorStatus);

router.get('/finance', financeController.getAdminFinanceOverview);
router.get('/bank-transfers', adminController.getPendingBankTransfers);

router.route('/testimonials')
  .get(testimonialController.getAdminTestimonials)
  .post(testimonialController.createTestimonial);

router.route('/testimonials/:id')
  .put(testimonialController.updateTestimonial)
  .delete(testimonialController.deleteTestimonial);

module.exports = router;
