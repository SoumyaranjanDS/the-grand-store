const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema({
  shippingFee: { type: Number, default: 100 },
  marketplaceCommissionPct: { type: Number, default: 15 },
  auctionCommissionPct: { type: Number, default: 15 },
  buyerPremiumPct: { type: Number, default: 5 },
  barChargePct: { type: Number, default: 2 },
  eventCommissionPct: { type: Number, default: 10 },
  vatPct: { type: Number, default: 15 },
  gatewayFeePct: { type: Number, default: 2.5 },
  bankDetails: {
    bankName: { type: String, default: 'Standard Bank' },
    accountName: { type: String, default: 'The Grand Store PTY LTD' },
    accountNumber: { type: String, default: '0123456789' },
    branchCode: { type: String, default: '051001' }
  },
  referralRewardAmount: { type: Number, default: 50 },
  referralRewardType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  referralWelcomeDiscount: { type: Number, default: 50 },
  referralWelcomeDiscountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' }
}, { timestamps: true });

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
