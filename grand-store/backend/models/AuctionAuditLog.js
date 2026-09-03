const mongoose = require('mongoose');

const auctionAuditLogSchema = new mongoose.Schema({
  lot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionLot'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'BID_PLACED',
      'PROXY_TRIGGERED',
      'EXTENSION_TRIGGERED',
      'AUTHENTICATION_STATUS_CHANGED',
      'LOT_STATUS_CHANGED',
      'RESERVE_MET',
      'AUCTION_CLOSED',
      'AUCTION_CLOSED_HAMMER',
      'INVOICE_GENERATED',
      'PAYMENT_CONFIRMED',
      'SETTLEMENT_RELEASED',
      'FRAUD_FLAGGED',
      'ADMIN_OVERRIDE'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  serverTimestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, { timestamps: true });

// Ensure audit log is strictly append-only
auctionAuditLogSchema.pre('save', function() {
  if (!this.isNew) {
    throw new Error('Audit logs are immutable and cannot be updated.');
  }
});

module.exports = mongoose.model('AuctionAuditLog', auctionAuditLogSchema);
