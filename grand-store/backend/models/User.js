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
  // === BIDDER QUALIFICATION & LIMITS (CPA & AUCTION SPEC) ===
  bidderApprovalStatus: {
    type: String,
    enum: ['unregistered', 'pending_approval', 'approved', 'rejected'],
    default: 'unregistered'
  },
  bidderRejectionReason: {
    type: String
  },
  bidderApprovedAt: {
    type: Date
  },
  bidderApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bidderDepositRequired: {
    type: Boolean,
    default: false
  },
  bidderDepositAmount: {
    type: Number,
    default: 0
  },
  bidderDepositStatus: {
    type: String,
    enum: ['none', 'pending', 'paid', 'refunded'],
    default: 'none'
  },
  bidderLevel: {
    type: String,
    enum: ['level_1_registered', 'level_2_verified', 'level_3_enhanced', 'level_4_vip'],
    default: 'level_1_registered'
  },
  biddingLimit: {
    type: Number,
    default: 0 // 0 for unverified/pending; R25,000 for level 2; R250,000 for level 3; R1,000,000+ for level 4
  },
  bidderNumber: {
    type: String, // Publicly displayed as "Bidder GS-xxxx" to protect privacy
  },
  bidderReliabilityScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  dateOfBirth: {
    type: Date // Required 18+ age verification
  },
  idType: {
    type: String,
    enum: ['National ID', 'Passport', 'Driver License']
  },
  idNumber: {
    type: String
  },
  idDocumentUrl: {
    type: String
  },
  rulesAcceptedVersion: {
    type: String, // e.g., 'v1.0'
  },
  rulesAcceptedAt: {
    type: Date
  },
  isBiddingSuspended: {
    type: Boolean,
    default: false
  },
  biddingSuspensionReason: {
    type: String
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

// High-scale query indexes for admin filtering and auth
userSchema.index({ bidderApprovalStatus: 1, createdAt: -1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
