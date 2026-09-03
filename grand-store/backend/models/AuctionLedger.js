const mongoose = require('mongoose');

const auctionLedgerSchema = new mongoose.Schema({
  lot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionLot',
    required: true,
    unique: true
  },
  transactionRef: {
    type: String,
    required: true,
    unique: true // e.g. GS-AUC-2026-00101
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hammerPrice: {
    type: Number,
    required: true
  },
  buyerPremiumPct: {
    type: Number,
    default: 15
  },
  buyerPremiumAmount: {
    type: Number,
    required: true
  },
  barChargeAmount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  transitInsurance: {
    type: Number,
    default: 0
  },
  vatAmount: {
    type: Number,
    default: 0
  },
  totalPaidByBuyer: {
    type: Number,
    required: true
  },
  sellerCommissionPct: {
    type: Number,
    default: 10
  },
  sellerCommissionAmount: {
    type: Number,
    required: true
  },
  vendorPayable: {
    type: Number,
    required: true // hammerPrice - sellerCommissionAmount
  },
  grandStoreGrossRevenue: {
    type: Number,
    required: true // buyerPremiumAmount + sellerCommissionAmount
  },
  paymentGateway: {
    type: String,
    default: 'PayFast'
  },
  paymentReference: {
    type: String
  },
  settlementStatus: {
    type: String,
    enum: ['AWAITING_PAYMENT', 'HELD_IN_ESCROW', 'SETTLEMENT_RELEASED', 'REFUNDED'],
    default: 'AWAITING_PAYMENT'
  },
  settlementReleasedAt: {
    type: Date
  },
  settlementPayoutRef: {
    type: String
  },
  paymentDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
}, { timestamps: true });

module.exports = mongoose.model('AuctionLedger', auctionLedgerSchema);
