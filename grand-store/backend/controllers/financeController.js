const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment'); // Required so Mongoose registers the model before populate() is called
const Booking = require('../models/Booking');
const Product = require('../models/Product');

// @desc    Get Admin Finance Overview
// @route   GET /api/admin/finance
// @access  Private/Admin
const getAdminFinanceOverview = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 250, 1), 2000);
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('customer', 'name email')
      .populate('vendor', 'name email');
    const rawShopOrders = await Order.find({ transactionId: { $regex: /SHP/ } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .populate('shipments')
      .lean();

    // Older orders did not store category snapshots. Resolve their products here so
    // category reporting remains useful for both historic and newly-created orders.
    const productReferences = [...new Set(rawShopOrders.flatMap((order) =>
      (order.orderItems || []).map((item) => String(item.product || '')).filter(Boolean)
    ))];
    const productNames = [...new Set(rawShopOrders.flatMap((order) =>
      (order.orderItems || []).map((item) => item.name).filter(Boolean)
    ))];
    const objectIdReferences = productReferences.filter((reference) => /^[0-9a-fA-F]{24}$/.test(reference));
    const productFilters = [];
    if (productReferences.length) productFilters.push({ id: { $in: productReferences } });
    if (objectIdReferences.length) productFilters.push({ _id: { $in: objectIdReferences } });
    if (productNames.length) productFilters.push({ name: { $in: productNames } });

    const categoryProducts = productFilters.length
      ? await Product.find({ $or: productFilters }).select('_id id name category subcategory').lean()
      : [];
    const productLookup = new Map();
    categoryProducts.forEach((product) => {
      if (product._id) productLookup.set(String(product._id), product);
      if (product.id) productLookup.set(String(product.id), product);
      if (product.name) productLookup.set(`name:${product.name.toLocaleLowerCase()}`, product);
    });

    const shopOrders = rawShopOrders.map((order) => ({
      ...order,
      orderItems: (order.orderItems || []).map((item) => {
        const product = productLookup.get(String(item.product || ''))
          || productLookup.get(`name:${String(item.name || '').toLocaleLowerCase()}`);
        return {
          ...item,
          category: item.category && item.category !== 'Uncategorised'
            ? item.category
            : (product?.category || 'Uncategorised'),
          subcategory: item.subcategory || product?.subcategory || '',
        };
      }),
    }));
    const auctionOrders = await Order.find({ transactionId: { $regex: /AUC/ } }).sort({ createdAt: -1 }).limit(limit).populate('user', 'name email');
    const eventBookings = await Booking.find().sort({ createdAt: -1 }).limit(limit).populate('user', 'name email');
    const vendorPayments = await Transaction.find({ module: 'vendor', type: 'payment' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('customer', 'name email');
    const metricRows = await Transaction.aggregate([
      { $group: { _id: { type: '$type', status: '$status' }, amount: { $sum: '$amount' } } },
    ]);

    let totalProcessed = 0;
    let totalPlatformRevenue = 0;
    let totalPendingPayables = 0;
    let totalVatCollected = 0;

    metricRows.forEach((row) => {
      if (row._id.type === 'payment' && row._id.status === 'cleared') {
        totalProcessed += row.amount;
      }
      if (row._id.type === 'commission' && row._id.status === 'cleared') {
        totalPlatformRevenue += row.amount;
      }
      if (row._id.type === 'vat' && row._id.status === 'cleared') {
        totalVatCollected += row.amount;
      }
      if (row._id.type === 'payout' && row._id.status === 'pending') {
        totalPendingPayables += row.amount;
      }
    });

    res.json({
      metrics: {
        totalProcessed,
        totalPlatformRevenue,
        totalPendingPayables,
        totalVatCollected
      },
      transactions,
      orders: shopOrders,
      shopOrders,
      auctionOrders,
      eventBookings,
      vendorPayments
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
