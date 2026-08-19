const AuctionLot = require('../models/AuctionLot');
const Bid = require('../models/Bid');
const PlatformSettings = require('../models/PlatformSettings');
const { getNextSequence } = require('../utils/sequenceGenerator');

// PUBLIC: Get all active auctions
exports.getAuctionLots = async (req, res) => {
  try {
    const lots = await AuctionLot.find({
      status: { $in: ['live', 'upcoming', 'closed'] }
    }).sort({ endDate: 1 });
    res.json(lots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUBLIC: Get a specific lot
exports.getLotDetails = async (req, res) => {
  try {
    const lot = await AuctionLot.findById(req.params.id).populate('vendor', 'name');
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    
    // Fetch top bids
    const bids = await Bid.find({ lot: lot._id, isMaxBid: false })
      .sort({ amount: -1 })
      .limit(10)
      .populate('user', 'name');

    // Return sanitized bid info
    const sanitizedBids = bids.map(b => ({
      _id: b._id,
      amount: b.amount,
      time: b.createdAt,
      bidder: `Bidder #${b.user._id.toString().substring(18)}` // Obfuscate bidder identity
    }));

    res.json({ lot, bids: sanitizedBids });
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

    // Anti-Sniping: If bid placed within last 2 minutes, extend by 2 minutes
    const msRemaining = new Date(lot.endDate).getTime() - new Date().getTime();
    if (msRemaining < 120000) { // 2 mins
      lot.endDate = new Date(new Date(lot.endDate).getTime() + 120000);
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
    const { title, description, category, startingBid, reservePrice, condition, provenance, images } = req.body;
    
    if (req.user.role !== 'vendor_active') {
       return res.status(403).json({ message: 'Only active vendors can submit lots.' });
    }

    const lot = new AuctionLot({
      title, description, category, startingBid, reservePrice, condition, provenance, images,
      vendor: req.user._id,
      status: 'pending_approval'
    });

    await lot.save();
    res.status(201).json(lot);
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

    const { lotNumber, startDate, endDate, bidIncrement, startingBid, reservePrice } = req.body;
    const lot = await AuctionLot.findById(req.params.id);

    if (!lot) return res.status(404).json({ message: 'Lot not found' });

    lot.lotNumber = lotNumber;
    lot.startDate = startDate;
    lot.endDate = endDate;
    lot.bidIncrement = bidIncrement || lot.bidIncrement;
    lot.startingBid = startingBid || lot.startingBid;
    lot.reservePrice = reservePrice || lot.reservePrice;
    
    // Determine if it should be live or upcoming based on startDate
    lot.status = new Date() >= new Date(startDate) ? 'live' : 'upcoming';

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

// VENDOR: Get all lots submitted by this vendor
exports.getVendorLots = async (req, res) => {
  try {
    if (req.user.role !== 'vendor_active') {
      return res.status(403).json({ message: 'Vendor access required' });
    }
    
    // Sort by newest first
    const lots = await AuctionLot.find({ vendor: req.user._id }).sort({ createdAt: -1 });
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

// ADMIN: Close auction and calculate accounting breakdown
exports.closeAuction = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const lot = await AuctionLot.findById(req.params.id);
    if (!lot) return res.status(404).json({ message: 'Lot not found' });

    // Find winning bid
    const winningBidDoc = await Bid.findOne({ lot: lot._id, isMaxBid: false }).sort({ amount: -1 }).populate('user');
    if (!winningBidDoc) {
      lot.status = 'unsold';
      await lot.save();
      return res.json({ message: 'Auction closed as unsold (no bids)', lot });
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
    const shippingCost = settings.shippingFee || 0;
    const vatPct = settings.vatPct || 15;
    const vatAmount = parseFloat(((winningBid * vatPct) / 100).toFixed(2));
    const totalPaidByBuyer = parseFloat((winningBid + buyerPremiumAmount + barChargeAmount + shippingCost + vatAmount).toFixed(2));

    // Vendor-side deductions
    const commissionPct = settings.auctionCommissionPct || 15;
    const commissionAmount = parseFloat(((winningBid * commissionPct) / 100).toFixed(2));
    const vendorPayable = parseFloat((winningBid - commissionAmount - vatAmount).toFixed(2));

    // GS Reference
    const year = new Date().getFullYear().toString().slice(-2);
    const seqNum = await getNextSequence('auctionPay');
    const gsReference = `GS-${year}-AUC-PAY-${seqNum.toString().padStart(6, '0')}`;

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
    lot.paymentStatus = 'Paid';

    await lot.save();
    res.json({ message: 'Auction closed and accounting calculated', lot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: Get all lots (for admin financial view)
exports.getAllLots = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const lots = await AuctionLot.find().sort({ createdAt: -1 }).populate('vendor', 'name email').populate('winner', 'name email');
    res.json(lots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

