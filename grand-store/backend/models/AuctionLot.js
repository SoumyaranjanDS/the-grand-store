const mongoose = require('mongoose');

const auctionLotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  lotNumber: {
    type: String, // Assigned by admin later
  },
  startingBid: {
    type: Number,
    required: true,
  },
  reservePrice: {
    type: Number,
    required: true,
  },
  bidIncrement: {
    type: Number,
    default: 500, // E.g., R500 increments
  },
  currentBid: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  condition: {
    type: String,
  },
  provenance: {
    type: String,
  },
  images: [{
    type: String // URLs for front, back, label, capsule, etc.
  }],
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending_approval', 'upcoming', 'live', 'closed', 'sold', 'unsold'],
    default: 'pending_approval'
  }
}, { timestamps: true });

module.exports = mongoose.model('AuctionLot', auctionLotSchema);
