const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const VendorCoupon = require('../models/VendorCoupon');

// @desc    Get all vendor coupons
// @route   GET /api/coupons/vendor
// @access  Private/Admin
router.get('/vendor', protect, admin, async (req, res) => {
  try {
    const coupons = await VendorCoupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
});

// @desc    Create a vendor coupon
// @route   POST /api/coupons/vendor
// @access  Private/Admin
router.post('/vendor', protect, admin, async (req, res) => {
  try {
    const { code, freeMonths, usageLimit } = req.body;
    
    const couponExists = await VendorCoupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await VendorCoupon.create({
      code: code.toUpperCase(),
      freeMonths,
      usageLimit
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
});

// @desc    Update a vendor coupon
// @route   PUT /api/coupons/vendor/:id
// @access  Private/Admin
router.put('/vendor/:id', protect, admin, async (req, res) => {
  try {
    const { isActive, freeMonths, usageLimit } = req.body;
    const coupon = await VendorCoupon.findById(req.params.id);

    if (coupon) {
      if (isActive !== undefined) coupon.isActive = isActive;
      if (freeMonths !== undefined) coupon.freeMonths = freeMonths;
      if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
      
      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update coupon', error: error.message });
  }
});

// @desc    Delete a vendor coupon
// @route   DELETE /api/coupons/vendor/:id
// @access  Private/Admin
router.delete('/vendor/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await VendorCoupon.findById(req.params.id);
    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
});

module.exports = router;
