const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema({
  shippingFee: { type: Number, default: 100 },
  marketplaceCommissionPct: { type: Number, default: 15 },
  auctionCommissionPct: { type: Number, default: 15 },
  buyerPremiumPct: { type: Number, default: 5 },
  barChargePct: { type: Number, default: 2 },
  auctionPremiumDepositAmount: { type: Number, default: 5000 },
  auctionStandardBiddingLimit: { type: Number, default: 25000 },
  auctionPremiumBiddingLimit: { type: Number, default: 250000 },
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
  referralWelcomeDiscountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },

  // Birthday Greeting & Promotion Settings (Admin Configurable)
  birthdayEmailEnabled: { type: Boolean, default: true },
  birthdayDiscountEnabled: { type: Boolean, default: true },
  birthdayDiscountPercent: { type: Number, default: 15 },
  birthdayPromoCode: { type: String, default: 'BDAY-LUXURY15' },
  birthdayCustomMessage: { type: String, default: 'To celebrate your special day, enjoy an exclusive luxury treat on us.' },

  // Vendor Fees Configuration (Admin Configurable)
  vendorMonthlyMaintenanceFee: { type: Number, default: 500 },
  vendorMaintenanceGraceDays: { type: Number, default: 7 }
}, { timestamps: true });

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
