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
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'super_admin', 'accountant', 'product_manager', 'vendor_pending', 'vendor_approved_unpaid', 'vendor_active', 'vendor_rejected', 'auction_host', 'event_host'],
    default: 'customer',
  },
  staffKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  mustChangePassword: {
    type: Boolean,
    default: false,
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
  }],
  allowedHostLimit: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rewardBalance: {
    type: Number,
    default: 0
  },
  totalReferrals: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
