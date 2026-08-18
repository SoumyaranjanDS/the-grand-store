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
  isMaxBid: {
    type: Boolean,
    default: false // True if this bid record represents an automatic maximum bid ceiling
  }
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);
