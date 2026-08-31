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
      bankDetails: settings.bankDetails,
      referralRewardAmount: settings.referralRewardAmount,
      referralRewardType: settings.referralRewardType,
      referralWelcomeDiscount: settings.referralWelcomeDiscount,
      referralWelcomeDiscountType: settings.referralWelcomeDiscountType,
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
    if (!['admin', 'super_admin'].includes(req.user.role)) {
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
      bankDetails,
      referralRewardAmount,
      referralRewardType,
      referralWelcomeDiscount,
      referralWelcomeDiscountType,
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
    if (bankDetails !== undefined) settings.bankDetails = bankDetails;
    const validReferralTypes = ['fixed', 'percentage'];
    if (referralRewardType !== undefined && !validReferralTypes.includes(referralRewardType)) {
      return res.status(400).json({ message: 'Invalid referral reward type' });
    }
    if (referralWelcomeDiscountType !== undefined && !validReferralTypes.includes(referralWelcomeDiscountType)) {
      return res.status(400).json({ message: 'Invalid referral welcome discount type' });
    }

    const nextRewardType = referralRewardType ?? settings.referralRewardType;
    const nextWelcomeDiscountType = referralWelcomeDiscountType ?? settings.referralWelcomeDiscountType;
    if (referralRewardAmount !== undefined) {
      const amount = Number(referralRewardAmount);
      if (!Number.isFinite(amount) || amount < 0 || (nextRewardType === 'percentage' && amount > 100)) {
        return res.status(400).json({ message: 'Referral reward must be a valid non-negative amount (maximum 100 for percentage rewards)' });
      }
      settings.referralRewardAmount = amount;
    }
    if (referralWelcomeDiscount !== undefined) {
      const amount = Number(referralWelcomeDiscount);
      if (!Number.isFinite(amount) || amount < 0 || (nextWelcomeDiscountType === 'percentage' && amount > 100)) {
        return res.status(400).json({ message: 'Welcome discount must be a valid non-negative amount (maximum 100 for percentage discounts)' });
      }
      settings.referralWelcomeDiscount = amount;
    }
    if (referralRewardType !== undefined) settings.referralRewardType = referralRewardType;
    if (referralWelcomeDiscountType !== undefined) settings.referralWelcomeDiscountType = referralWelcomeDiscountType;

    await settings.save();
    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getPublicSettings, updateSettings };
