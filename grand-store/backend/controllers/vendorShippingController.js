const Vendor = require('../models/Vendor');

// @desc    Get Vendor Shipping Profile
// @route   GET /api/vendor/shipping-profile
// @access  Private (Vendor only)
const getShippingProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor.shippingProfile || {});
  } catch (error) {
    console.error('Get Shipping Profile Error:', error);
    res.status(500).json({ message: 'Server Error getting shipping profile' });
  }
};

// @desc    Update Vendor Shipping Profile
// @route   PUT /api/vendor/shipping-profile
// @access  Private (Vendor only)
const updateShippingProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.shippingProfile = req.body.shippingProfile;
    await vendor.save();

    res.json(vendor.shippingProfile);
  } catch (error) {
    console.error('Update Shipping Profile Error:', error);
    res.status(500).json({ message: 'Server Error updating shipping profile' });
  }
};

module.exports = {
  getShippingProfile,
  updateShippingProfile
};
