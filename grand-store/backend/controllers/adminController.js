const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const AuctionLot = require('../models/AuctionLot');
const Booking = require('../models/Booking');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalVendors = await Vendor.countDocuments({ status: 'approved' });
    const pendingVendors = await Vendor.countDocuments({ status: 'pending_approval' });
    
    // Revenue calculations could be complex, doing a simple sum of completed orders
    const orders = await Order.find({ isPaid: true });
    const totalOrderRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalOrderCommission = orders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0);

    const bookings = await Booking.find({ paymentStatus: 'Paid' });
    const totalBookingRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalBookingCommission = bookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);

    const auctions = await AuctionLot.find({ status: 'sold', paymentStatus: 'Paid' });
    const totalAuctionRevenue = auctions.reduce((sum, a) => sum + (a.totalPaidByBuyer || 0), 0);
    const totalAuctionCommission = auctions.reduce((sum, a) => sum + (a.commissionAmount || 0), 0);

    const totalRevenue = totalOrderRevenue + totalBookingRevenue + totalAuctionRevenue;
    const totalCommission = totalOrderCommission + totalBookingCommission + totalAuctionCommission;

    res.json({
      totalUsers,
      totalVendors,
      pendingVendors,
      totalRevenue,
      totalCommission,
      breakdown: {
        shop: { revenue: totalOrderRevenue, commission: totalOrderCommission },
        events: { revenue: totalBookingRevenue, commission: totalBookingCommission },
        auctions: { revenue: totalAuctionRevenue, commission: totalAuctionCommission }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update vendor status (Approve / Reject)
// @route   PUT /api/admin/vendors/:id/status
// @access  Private/Admin
const updateVendorStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    vendor.status = status;
    // We could store the rejection reason in the vendor model if we add a field for it
    await vendor.save();

    // Update user role based on status
    const user = await User.findById(vendor.userId);
    if (user) {
      if (status === 'approved') {
        user.role = 'vendor_approved_unpaid';
      } else if (status === 'rejected') {
        user.role = 'vendor_rejected'; 
      } else if (status === 'suspended') {
        user.role = 'customer';
      }
      await user.save();
    }

    res.json({ message: `Vendor marked as ${status}`, vendor });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllVendors,
  updateVendorStatus
};
