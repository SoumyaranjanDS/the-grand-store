const AuctionLot = require('../models/AuctionLot');
const Bid = require('../models/Bid');
const PlatformSettings = require('../models/PlatformSettings');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { getNextSequence } = require('../utils/sequenceGenerator');
const { sendEmail } = require('../utils/emailService');
const { auctionWinTemplate } = require('../utils/emailTemplates');

const parseAuctionSchedule = (startDate, endDate) => {
  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);

  if (!startDate || !endDate || Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
    return { error: 'A valid auction start and end date are required.' };
  }
  if (parsedEnd <= parsedStart) {
    return { error: 'Auction end date must be later than its start date.' };
  }
  if (parsedEnd <= new Date()) {
    return { error: 'Auction end date must be in the future.' };
  }

  return { startDate: parsedStart, endDate: parsedEnd };
};

exports.parseAuctionSchedule = parseAuctionSchedule;

// PUBLIC: Get all active auctions
exports.getAuctionLots = async (req, res) => {
  try {
    let lots = await AuctionLot.find({
      status: { $in: ['live', 'upcoming', 'closed', 'sold', 'unsold'] }
    })
    .populate('vendor', 'name storeName role')
    .populate('winner', 'name')
    .sort({ endDate: 1 });

    lots = lots.filter(lot => {
      if (!lot.vendor) return false;
      const role = lot.vendor.role;
      return role === 'admin' || role === 'vendor_active' || role === 'auction_host';
    });

    res.json(lots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUBLIC: Get a specific lot (with optional auth for admin/vendor visibility)
exports.getLotDetails = async (req, res) => {
  try {
    const lot = await AuctionLot.findById(req.params.id).populate('vendor', 'name storeName');
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    
    // Check if user is logged in for elevated permissions
    let currentUser = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        currentUser = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Ignore token errors for this public route
      }
    }

    // Fetch top bids
    const bids = await Bid.find({ lot: lot._id, isMaxBid: false })
      .sort({ amount: -1 })
      .limit(10)
      .populate('user', 'name email');

    // Return sanitized bid info
    const sanitizedBids = bids.map(b => {
      let canSeeDetails = false;
      if (currentUser) {
         if (currentUser.role === 'admin') canSeeDetails = true;
         if (lot.vendor && lot.vendor._id.toString() === currentUser._id.toString()) canSeeDetails = true;
      }

      return {
        _id: b._id,
        amount: b.amount,
        time: b.createdAt,
        bidder: canSeeDetails 
          ? (b.user ? `${b.user.name} (${b.user.email})` : 'Deleted User') 
          : (b.user ? `Bidder #${b.user._id.toString().substring(18)}` : 'Deleted User')
      };
    });

    // Convert to plain object to attach custom properties
    const lotObj = lot.toObject();

    // Attach shipping address if sold and authorized
    if (lotObj.status === 'sold' && lotObj.paymentStatus === 'Paid' && currentUser) {
       const isWinner = lotObj.winner && lotObj.winner.toString() === currentUser._id.toString();
       const isAdmin = currentUser.role === 'admin';
       const isVendor = lotObj.vendor && lotObj.vendor._id.toString() === currentUser._id.toString();

       if (isWinner || isAdmin || isVendor) {
          const order = await Order.findOne({ 'orderItems.product': lotObj._id.toString() });
          if (order && order.shippingAddress) {
             lotObj.shippingAddress = order.shippingAddress;
          }
       }
    }

    res.json({ lot: lotObj, bids: sanitizedBids });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// AUTHENTICATED: Place a bid
exports.placeBid = async (req, res) => {
  try {
    const { amount, isMaxBid } = req.body;
    const lotId = req.params.id;
    const userId = req.user._id; // Requires authenticateUser middleware

    const lot = await AuctionLot.findById(lotId);
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    
    if (req.user.role === 'admin' || req.user.role === 'vendor_active') {
      return res.status(403).json({ message: 'Admins and vendors are not allowed to place bids.' });
    }
    
    if (lot.status === 'upcoming' && new Date() >= new Date(lot.startDate)) {
      lot.status = 'live';
      await lot.save();
    }

    if (lot.status !== 'live') {
      return res.status(400).json({ message: 'Auction is not live' });
    }

    if (new Date() > new Date(lot.endDate)) {
      lot.status = 'closed';
      await lot.save();
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Minimum bid required
    const nextMinimum = lot.currentBid === 0 ? lot.startingBid : lot.currentBid + lot.bidIncrement;
    
    if (amount < nextMinimum) {
      return res.status(400).json({ message: `Bid must be at least R${nextMinimum}` });
    }

    // Max Bid Logic
    if (isMaxBid) {
      // Save max bid secretly
      const newMaxBid = new Bid({ user: userId, lot: lotId, amount, isMaxBid: true });
      await newMaxBid.save();

      // See if there's another active max bid to compete with
      const highestExistingMax = await Bid.findOne({ lot: lotId, isMaxBid: true, _id: { $ne: newMaxBid._id } }).sort({ amount: -1 });

      if (highestExistingMax && highestExistingMax.amount >= amount) {
        // They outbid us instantly up to our max
        lot.currentBid = amount; // Pushed to our max
        await lot.save();
        
        // Push their bid above ours (if they have room)
        const counterBidAmt = Math.min(highestExistingMax.amount, amount + lot.bidIncrement);
        if (counterBidAmt > amount) {
           await new Bid({ user: highestExistingMax.user, lot: lotId, amount: counterBidAmt, isMaxBid: false }).save();
           lot.currentBid = counterBidAmt;
           await lot.save();
           return res.status(400).json({ message: 'You have been outbid instantly by an automatic bid.', lot });
        }
      } else {
        // We beat their max bid. Push to their max + increment (or minimum if none)
        let winningAmt = nextMinimum;
        if (highestExistingMax) {
          winningAmt = Math.min(amount, highestExistingMax.amount + lot.bidIncrement);
        }
        await new Bid({ user: userId, lot: lotId, amount: winningAmt, isMaxBid: false }).save();
        lot.currentBid = winningAmt;
      }

    } else {
      // Normal bid
      const highestExistingMax = await Bid.findOne({ lot: lotId, isMaxBid: true }).sort({ amount: -1 });
      
      if (highestExistingMax && highestExistingMax.user.toString() !== userId.toString() && highestExistingMax.amount >= amount) {
        // Existing max bid beats this normal bid instantly
        const counterBidAmt = Math.min(highestExistingMax.amount, amount + lot.bidIncrement);
        await new Bid({ user: highestExistingMax.user, lot: lotId, amount: counterBidAmt, isMaxBid: false }).save();
        lot.currentBid = counterBidAmt;
        await lot.save();
        return res.status(400).json({ message: 'You have been outbid instantly by an automatic bid.', lot });
      }

      // We win for now
      await new Bid({ user: userId, lot: lotId, amount, isMaxBid: false }).save();
      lot.currentBid = amount;
    }

    // Anti-Sniping: If bid placed within last 5 minutes, extend by 5 minutes
    const msRemaining = new Date(lot.endDate).getTime() - new Date().getTime();
    if (msRemaining < 300000) { // 5 mins
      lot.endDate = new Date(new Date(lot.endDate).getTime() + 300000);
    }

    await lot.save();
    res.json({ message: 'Bid placed successfully', lot });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VENDOR: Submit new lot
exports.submitLot = async (req, res) => {
  try {
    const { title, description, category, startingBid, reservePrice, condition, provenance, startDate, endDate } = req.body;
    
    if (req.user.role !== 'vendor_active' && req.user.role !== 'auction_host') {
       return res.status(403).json({ message: 'Only active vendors and auction hosts can submit lots.' });
    }

    if (req.user.role === 'auction_host') {
      const currentLotsCount = await AuctionLot.countDocuments({ vendor: req.user._id });
      if (currentLotsCount >= (req.user.allowedHostLimit || 0)) {
        return res.status(403).json({ message: `You have reached your limit of ${req.user.allowedHostLimit || 0} auction lots. Contact support to increase it.` });
      }
    }

    const schedule = parseAuctionSchedule(startDate, endDate);
    if (schedule.error) return res.status(400).json({ message: schedule.error });

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const lot = new AuctionLot({
      title, description, category, startingBid, reservePrice, condition, provenance, images,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      vendor: req.user._id,
      status: 'pending_approval'
    });

    await lot.save();
    res.status(201).json(lot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VENDOR: Resubmit an unsold/closed lot
exports.resubmitLot = async (req, res) => {
  try {
    if (req.user.role !== 'vendor_active' && req.user.role !== 'auction_host') {
      return res.status(403).json({ message: 'Vendor or auction host access required' });
    }

    const { startDate, endDate } = req.body;
    const lot = await AuctionLot.findOne({ _id: req.params.id, vendor: req.user._id });
    
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    if (lot.status !== 'unsold' && lot.status !== 'closed') {
      return res.status(400).json({ message: 'Only unsold or closed lots can be resubmitted' });
    }

    const schedule = parseAuctionSchedule(startDate, endDate);
    if (schedule.error) return res.status(400).json({ message: schedule.error });

    lot.startDate = schedule.startDate;
    lot.endDate = schedule.endDate;
    lot.status = 'pending_approval'; // goes back to admin for review

    await lot.save();
    res.json({ message: 'Lot resubmitted successfully', lot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: Approve lot
exports.approveLot = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
       return res.status(403).json({ message: 'Admin only' });
    }

    const { lotNumber, bidIncrement, startingBid, reservePrice, startDate, endDate } = req.body;
    const lot = await AuctionLot.findById(req.params.id);

    if (!lot) return res.status(404).json({ message: 'Lot not found' });

    const schedule = parseAuctionSchedule(startDate || lot.startDate, endDate || lot.endDate);
    if (schedule.error) return res.status(400).json({ message: schedule.error });

    lot.lotNumber = lotNumber;
    lot.bidIncrement = bidIncrement || lot.bidIncrement;
    lot.startingBid = startingBid || lot.startingBid;
    lot.reservePrice = reservePrice || lot.reservePrice;
    lot.startDate = schedule.startDate;
    lot.endDate = schedule.endDate;
    
    // Determine if it should be live or upcoming based on startDate
    lot.status = new Date() >= schedule.startDate ? 'live' : 'upcoming';

    await lot.save();
    res.json({ message: 'Lot approved', lot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// AUTHENTICATED: Toggle watchlist
exports.toggleWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const lotId = req.params.id;
    const User = require('../models/User');

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const lotIndex = user.auctionWatchlist.indexOf(lotId);
    if (lotIndex === -1) {
      user.auctionWatchlist.push(lotId);
    } else {
      user.auctionWatchlist.splice(lotIndex, 1);
    }

    await user.save();
    res.json({ message: 'Watchlist updated', watchlist: user.auctionWatchlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CUSTOMER: Get user's auction dashboard data (bids, wins, watchlist)
exports.getUserBids = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get lots the user has won
    const wonLots = await AuctionLot.find({ winner: userId, status: 'sold' }).populate('vendor', 'storeName name');

    // 2. Get active bids (where user is the max bidder on a live lot)
    // For simplicity, we fetch all live lots where current max bid is from this user
    // A better approach in a real app would be querying the Bid collection
    const activeBids = await Bid.find({ user: userId })
      .sort({ amount: -1 })
      .populate('lot')
      .lean();

    // Group by lot to just get the highest bid the user placed per lot
    const bidMap = {};
    activeBids.forEach(bid => {
      if (bid.lot && bid.lot.status === 'live') {
        if (!bidMap[bid.lot._id]) {
          bidMap[bid.lot._id] = bid;
        }
      }
    });
    const userActiveLots = Object.values(bidMap).map(b => b.lot);

    // 3. Get watchlist
    const user = await req.user.populate({
      path: 'auctionWatchlist',
      select: 'title currentBid status endDate images'
    });

    res.json({
      wonLots,
      activeLots: userActiveLots,
      watchlist: user.auctionWatchlist || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VENDOR: Get all lots submitted by this vendor
exports.getVendorLots = async (req, res) => {
  try {
    if (req.user.role !== 'vendor_active' && req.user.role !== 'auction_host') {
      return res.status(403).json({ message: 'Vendor or auction host access required' });
    }
    
    // Sort by newest first
    const lots = await AuctionLot.find({ vendor: req.user._id }).sort({ createdAt: -1 }).populate('winner', 'name email').lean();
    
    // Attach order shipping address if available
    for (let lot of lots) {
       if (lot.status === 'sold' && lot.paymentStatus === 'Paid') {
          const order = await Order.findOne({ 'orderItems.product': lot._id.toString() });
          if (order) {
             lot.shippingAddress = order.shippingAddress;
          }
       }
    }

    res.json(lots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: Get all pending lots
exports.getAdminPendingLots = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const lots = await AuctionLot.find({ status: 'pending_approval' }).sort({ createdAt: -1 });
    res.json(lots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const closeAuctionInternal = async (lotId) => {
  const lot = await AuctionLot.findById(lotId);
  if (!lot) throw new Error('Lot not found');
  if (lot.status === 'sold' || lot.status === 'unsold') return lot; // Already closed

  // Find winning bid
  const winningBidDoc = await Bid.findOne({ lot: lot._id, isMaxBid: false }).sort({ amount: -1 }).populate('user');
  if (!winningBidDoc) {
    lot.status = 'unsold';
    await lot.save();
    return lot;
  }

  // Fetch fee settings
  let settings = await PlatformSettings.findOne();
  if (!settings) settings = await PlatformSettings.create({});

  const winningBid = winningBidDoc.amount;

  // Buyer-side charges
  const buyerPremiumPct = settings.buyerPremiumPct || 5;
  const buyerPremiumAmount = parseFloat(((winningBid * buyerPremiumPct) / 100).toFixed(2));
  const barChargePct = settings.barChargePct || 2;
  const barChargeAmount = parseFloat(((winningBid * barChargePct) / 100).toFixed(2));
  
  // Shipping will be determined at checkout, but we can set a placeholder
  const shippingCost = settings.shippingFee || 0;
  
  const vatPct = settings.vatPct || 15;
  const vatAmount = parseFloat(((winningBid * vatPct) / 100).toFixed(2));
  const totalPaidByBuyer = parseFloat((winningBid + buyerPremiumAmount + barChargeAmount + shippingCost).toFixed(2));

  // Vendor-side deductions
  const commissionPct = settings.auctionCommissionPct || 15;
  const commissionAmount = parseFloat(((winningBid * commissionPct) / 100).toFixed(2));
  const vendorPayable = parseFloat((winningBid - commissionAmount - vatAmount).toFixed(2));

  // GS Reference
  const year = new Date().getFullYear().toString().slice(-2);
  const seqNum = await getNextSequence('auctionPay');
  const gsReference = `GS-${year}-AUC-PAY-${seqNum.toString().padStart(6, '0')}`;
  
  const orderId = `ORD-${Date.now().toString().slice(-6)}`;
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const paymentId = `PAY-${Date.now().toString().slice(-6)}`;

  lot.winningBid = winningBid;
  lot.winner = winningBidDoc.user._id;
  lot.status = 'sold';
  lot.buyerPremiumPct = buyerPremiumPct;
  lot.buyerPremiumAmount = buyerPremiumAmount;
  lot.barChargePct = barChargePct;
  lot.barChargeAmount = barChargeAmount;
  lot.shippingCost = shippingCost;
  lot.vatPct = vatPct;
  lot.vatAmount = vatAmount;
  lot.totalPaidByBuyer = totalPaidByBuyer;
  lot.commissionPct = commissionPct;
  lot.commissionAmount = commissionAmount;
  lot.vendorPayable = vendorPayable;
  lot.gsReference = gsReference;
  lot.paymentStatus = 'Pending'; // User must pay at checkout

  await lot.save();

  // Create Order
  const order = new Order({
    user: winningBidDoc.user._id,
    transactionId: gsReference,
    orderId,
    invoiceNumber,
    paymentId,
    orderItems: [{
      product: lot._id,
      vendorId: lot.vendor,
      name: `Auction Lot ${lot.lotNumber || ''}: ${lot.title}`,
      quantity: 1,
      price: winningBid,
      image: lot.images && lot.images.length > 0 ? lot.images[0] : ''
    }],
    shippingAddress: { address: 'Pending', city: 'Pending', postalCode: 'Pending', country: 'Pending' },
    paymentMethod: 'Pending',
    subTotal: winningBid,
    shippingCost: shippingCost,
    vatPct: vatPct,
    vatAmount: vatAmount,
    commissionPct: commissionPct,
    commissionAmount: commissionAmount,
    totalPrice: totalPaidByBuyer, // We can bundle buyer premiums into a fee or adjust totalPrice
    vendorPayables: [{
      vendorId: lot.vendor,
      grossAmount: winningBid,
      commission: commissionAmount,
      vatDeducted: vatAmount,
      netPayable: vendorPayable,
      paid: false
    }],
    paymentStatus: 'Pending',
    isPaid: false
  });
  
  await order.save();

  // Create pending Transaction
  const transaction = new Transaction({
    gsReference,
    type: 'payment',
    module: 'auction',
    amount: totalPaidByBuyer,
    netAmount: totalPaidByBuyer, // Will be updated on actual payment
    customer: winningBidDoc.user._id,
    vendor: lot.vendor,
    order: order._id,
    status: 'pending',
    description: `Auction Payment - Lot ${lot.lotNumber || ''}`
  });
  await transaction.save();

  // Send email to winner
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const checkoutUrl = `${frontendUrl}/checkout?orderId=${order._id}`;
    
    sendEmail({
      to: winningBidDoc.user.email,
      subject: `Congratulations! You won the auction for ${lot.title}`,
      html: auctionWinTemplate(
        winningBidDoc.user.name,
        lot.title,
        lot.lotNumber || 'N/A',
        winningBid,
        checkoutUrl
      )
    }).catch(err => console.error('Failed to send auction win email:', err));
  } catch (err) {
    console.error('Error preparing auction win email:', err);
  }

  return lot;
};

exports.closeAuctionInternal = closeAuctionInternal;

// ADMIN: Close auction manually
exports.closeAuction = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const lot = await closeAuctionInternal(req.params.id);
    res.json({ message: 'Auction closed and accounting calculated', lot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// USER: Prepare lot for payment
exports.payAuction = async (req, res) => {
  try {
    const lot = await AuctionLot.findById(req.params.id);
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    
    if (lot.winner.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Only the winner can checkout' });
    }
    
    if (lot.paymentStatus === 'Paid') {
       return res.status(400).json({ message: 'Lot already paid' });
    }

    const { shippingAddress, calculatedShipping } = req.body;
    
    // Find associated Order
    const order = await Order.findOne({ 'orderItems.product': lot._id });

    // Update lot as Pending
    lot.paymentStatus = 'Pending';
    lot.shippingCost = calculatedShipping || lot.shippingCost || 0;
    lot.totalPaidByBuyer = lot.winningBid + lot.buyerPremiumAmount + lot.barChargeAmount + lot.shippingCost;
    
    if (order) {
      order.paymentStatus = 'Pending';
      if (shippingAddress) order.shippingAddress = shippingAddress;
      order.shippingCost = lot.shippingCost;
      order.totalPrice = lot.totalPaidByBuyer;
      await order.save();
    }

    await lot.save();

    res.json({ message: 'Shipping saved, pending payment', lot, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Process the ledger transactions and wallet updates after a successful auction payment
 * This function will be called by the PayFast ITN Webhook Controller
 */
exports.processAuctionPayment = async (lotId) => {
  const lot = await AuctionLot.findById(lotId);
  if (!lot) throw new Error('Lot not found');
  if (lot.paymentStatus === 'Paid') return true;

  const order = await Order.findOne({ 'orderItems.product': lot._id });
  const transaction = order ? await Transaction.findOne({ order: order._id }) : null;

  lot.paymentStatus = 'Paid';

  if (order) {
    order.paymentStatus = 'Paid';
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();
  }

  if (transaction) {
    transaction.status = 'cleared';
    transaction.amount = lot.totalPaidByBuyer;
    transaction.netAmount = lot.totalPaidByBuyer - ((lot.totalPaidByBuyer * 2.5) / 100); // 2.5% mock gateway fee
    await transaction.save();
  }

  // Update vendor wallet (pending balance until delivered)
  if (lot.vendor) {
    let wallet = await Wallet.findOne({ vendorId: lot.vendor });
    if (!wallet) {
       wallet = new Wallet({ vendorId: lot.vendor });
    }
    wallet.pendingBalance += lot.vendorPayable;
    wallet.totalEarned += lot.vendorPayable;
    await wallet.save();
  }

  await lot.save();
  return true;
};

// ADMIN: Get all lots (for admin financial view)
exports.getAllLots = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const lots = await AuctionLot.find().sort({ createdAt: -1 }).populate('vendor', 'name email').populate('winner', 'name email').lean();
    
    // Attach order shipping address if available
    for (let lot of lots) {
       if (lot.status === 'sold' && lot.paymentStatus === 'Paid') {
          const order = await Order.findOne({ 'orderItems.product': lot._id.toString() });
          if (order) {
             lot.shippingAddress = order.shippingAddress;
          }
       }
    }
    
    res.json(lots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

