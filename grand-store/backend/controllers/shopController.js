const Vendor = require('../models/Vendor');
const Product = require('../models/Product');

// @desc    Fetch store details and products
// @route   GET /api/shop/stores/:id
// @access  Public
const getStoreById = async (req, res) => {
  try {
    const storeId = req.params.id;
    
    // Find Vendor by either userId or its own _id to be robust
    const vendor = await Vendor.findOne({ 
      $or: [
        { userId: storeId },
        { _id: storeId }
      ]
    }).populate('userId', 'name email');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Fetch products using the vendor's userId, since product.vendorId points to User
    const products = await Product.find({ vendorId: vendor.userId._id || vendor.userId, approvalStatus: 'approved' });
    
    // Map data
    const storeData = {
      _id: storeId,
      businessName: vendor.businessInfo?.tradingName || vendor.businessInfo?.legalName || (vendor.userId && vendor.userId.name) || 'Unknown Store',
      country: vendor.shippingProfile?.pickupAddress?.country || 'South Africa',
      type: vendor.vendorType,
      bannerUrl: vendor.businessInfo?.bannerUrl || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop',
      logoUrl: vendor.businessInfo?.logoUrl || 'https://images.unsplash.com/photo-1559564109-ce879bd2925b?q=80&w=200&auto=format&fit=crop',
      story: vendor.businessInfo?.story || vendor.storyInfo?.brandStory || vendor.storyInfo?.winemakerBio || 'Welcome to our store.',
      isVerified: vendor.status === 'approved'
    };

    res.json({ storeData, products });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Server error fetching store' });
  }
};

module.exports = {
  getStoreById
};
