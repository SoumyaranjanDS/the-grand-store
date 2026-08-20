const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment'); // Required so Mongoose registers the model before populate() is called
const Booking = require('../models/Booking');

// @desc    Get Admin Finance Overview
// @route   GET /api/admin/finance
// @access  Private/Admin
const getAdminFinanceOverview = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    const shopOrders = await Order.find({ transactionId: { $regex: /SHP/ } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name email')
      .populate('shipments');
    const auctionOrders = await Order.find({ transactionId: { $regex: /AUC/ } }).sort({ createdAt: -1 }).limit(50).populate('user', 'name email');
    const eventBookings = await Booking.find().sort({ createdAt: -1 }).limit(50).populate('user', 'name email');

    let totalProcessed = 0;
    let totalPlatformRevenue = 0;
    let totalPendingPayables = 0;
    let totalVatCollected = 0;

    transactions.forEach(txn => {
      if (txn.type === 'payment' && txn.status === 'cleared') {
        totalProcessed += txn.amount;
      }
      if (txn.type === 'commission' && txn.status === 'cleared') {
        totalPlatformRevenue += txn.amount;
      }
      if (txn.type === 'vat' && txn.status === 'cleared') {
        totalVatCollected += txn.amount;
      }
      if (txn.type === 'payout' && txn.status === 'pending') {
        totalPendingPayables += txn.amount;
      }
    });

    res.json({
      metrics: {
        totalProcessed,
        totalPlatformRevenue,
        totalPendingPayables,
        totalVatCollected
      },
      transactions: transactions.slice(0, 50),
      orders: shopOrders,
      shopOrders,
      auctionOrders,
      eventBookings
    });
  } catch (error) {
    console.error('Get Admin Finance Error:', error);
    res.status(500).json({ message: 'Server error retrieving finance data' });
  }
};

// @desc    Get Vendor Wallet & Transactions
// @route   GET /api/vendor/wallet
// @access  Private/Vendor
const getVendorWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ vendorId: req.user._id });
    
    // If no wallet exists yet, return empty structure
    if (!wallet) {
      wallet = {
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0
      };
    }

    const transactions = await Transaction.find({ vendor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Most recent 50

    const orders = await Order.find({ 'vendorPayables.vendorId': req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      wallet,
      transactions,
      orders
    });
  } catch (error) {
    console.error('Get Vendor Wallet Error:', error);
    res.status(500).json({ message: 'Server error retrieving wallet data' });
  }
};

module.exports = {
  getAdminFinanceOverview,
  getVendorWallet
};
