const PlatformSettings = require("../models/PlatformSettings");

// @desc  Get platform settings (public - fees only)
// @route GET /api/settings/public
// @access Public
const getPublicSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.json({
      shippingFee: settings.shippingFee,
      marketplaceCommissionPct: settings.marketplaceCommissionPct,
      auctionCommissionPct: settings.auctionCommissionPct,
      buyerPremiumPct: settings.buyerPremiumPct,
      barChargePct: settings.barChargePct,
      eventCommissionPct: settings.eventCommissionPct,
      vatPct: settings.vatPct,
      gatewayFeePct: settings.gatewayFeePct,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc  Update platform settings
// @route PUT /api/settings
// @access Private (Admin only)
const updateSettings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const {
      shippingFee,
      marketplaceCommissionPct,
      auctionCommissionPct,
      buyerPremiumPct,
      barChargePct,
      eventCommissionPct,
      vatPct,
      gatewayFeePct,
    } = req.body;

    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings({});
    }

    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (marketplaceCommissionPct !== undefined) settings.marketplaceCommissionPct = marketplaceCommissionPct;
    if (auctionCommissionPct !== undefined) settings.auctionCommissionPct = auctionCommissionPct;
    if (buyerPremiumPct !== undefined) settings.buyerPremiumPct = buyerPremiumPct;
    if (barChargePct !== undefined) settings.barChargePct = barChargePct;
    if (eventCommissionPct !== undefined) settings.eventCommissionPct = eventCommissionPct;
    if (vatPct !== undefined) settings.vatPct = vatPct;
    if (gatewayFeePct !== undefined) settings.gatewayFeePct = gatewayFeePct;

    await settings.save();
    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getPublicSettings, updateSettings };
