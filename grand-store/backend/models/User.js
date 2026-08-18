const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'vendor_pending', 'vendor_active', 'admin'],
    default: 'customer',
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    },
    option: String
  }],
  auctionRegistered: {
    type: Boolean,
    default: false
  },
  kycVerified: {
    type: Boolean,
    default: false
  },
  auctionWatchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionLot'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
