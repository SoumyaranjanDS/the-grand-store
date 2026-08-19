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
}, { timestamps: true });

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
