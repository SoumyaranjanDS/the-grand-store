const mongoose = require('mongoose');

const auctionFraudAlertSchema = new mongoose.Schema({
  lot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionLot',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  alertType: {
    type: String,
    required: true,
    enum: [
      'SELLER_BIDDER_MATCH',
      'IP_COLLISION',
      'DEVICE_COLLISION',
      'RAPID_BID_VELOCITY',
      'SUSPICIOUS_INCREMENT',
      'PAYMENT_ANOMALY'
    ]
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  evidence: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['PENDING_REVIEW', 'INVESTIGATING', 'CLEARED', 'ACTION_TAKEN'],
    default: 'PENDING_REVIEW'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AuctionFraudAlert', auctionFraudAlertSchema);
