const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const financeController = require('../controllers/financeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/vendors', adminController.getAllVendors);
router.put('/vendors/:id/status', adminController.updateVendorStatus);

router.get('/finance', financeController.getAdminFinanceOverview);

module.exports = router;
