const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionLot',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  bidType: {
    type: String,
    enum: ['manual', 'proxy'],
    default: 'manual'
  },
  isMaxBid: {
    type: Boolean,
    default: false
  },
  maxProxyAmount: {
    type: Number
  },
  bidderNumber: {
    type: String // Anonymous reference e.g., 'GS-B1048'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  deviceFingerprint: {
    type: String
  },
  status: {
    type: String,
    enum: ['valid', 'outbid', 'winning', 'disqualified', 'retracted'],
    default: 'valid'
  },
  serverTimestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// High-scale performance indexes for fast live auction queries
bidSchema.index({ lot: 1, createdAt: -1 });
bidSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);
