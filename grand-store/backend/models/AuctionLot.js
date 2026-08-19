const mongoose = require('mongoose');

const auctionLotSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  lotNumber: { type: String },
  startingBid: { type: Number, required: true },
  reservePrice: { type: Number, required: true },
  bidIncrement: { type: Number, default: 500 },
  currentBid: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  condition: { type: String },
  provenance: { type: String },
  images: [{ type: String }],
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending_approval', 'upcoming', 'live', 'closed', 'sold', 'unsold'],
    default: 'pending_approval'
  },

  // === ACCOUNTING BREAKDOWN (populated when auction closes) ===
  winningBid: { type: Number, default: 0 },

  // Buyer-side charges (added ON TOP of winning bid - paid by buyer)
  buyerPremiumPct: { type: Number, default: 5 },       // % snapshot from PlatformSettings
  buyerPremiumAmount: { type: Number, default: 0 },    // winningBid × buyerPremiumPct

  barChargePct: { type: Number, default: 2 },          // Buyer Administration Reserve %
  barChargeAmount: { type: Number, default: 0 },       // winningBid × barChargePct

  shippingCost: { type: Number, default: 0 },          // From PlatformSettings
  vatPct: { type: Number, default: 15 },               // VAT % snapshot
  vatAmount: { type: Number, default: 0 },             // VAT on winningBid

  totalPaidByBuyer: { type: Number, default: 0 },      // winningBid + buyerPremium + BAR + shipping + VAT

  // Vendor-side deductions
  commissionPct: { type: Number, default: 15 },        // % snapshot from PlatformSettings
  commissionAmount: { type: Number, default: 0 },      // winningBid × commissionPct
  vendorPayable: { type: Number, default: 0 },         // winningBid - commission - VAT

  // GS Reference
  gsReference: { type: String },                      // e.g. GS-26-AUC-PAY-000001

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Failed', 'Disputed'],
    default: 'Pending'
  },

}, { timestamps: true });

module.exports = mongoose.model('AuctionLot', auctionLotSchema);

