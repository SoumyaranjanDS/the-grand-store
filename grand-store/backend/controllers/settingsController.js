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
      auctionPremiumDepositAmount: settings.auctionPremiumDepositAmount !== undefined ? settings.auctionPremiumDepositAmount : 5000,
      auctionStandardBiddingLimit: settings.auctionStandardBiddingLimit !== undefined ? settings.auctionStandardBiddingLimit : 25000,
      auctionPremiumBiddingLimit: settings.auctionPremiumBiddingLimit !== undefined ? settings.auctionPremiumBiddingLimit : 250000,
      eventCommissionPct: settings.eventCommissionPct,
      vatPct: settings.vatPct,
      gatewayFeePct: settings.gatewayFeePct,
      bankDetails: settings.bankDetails,
      referralRewardAmount: settings.referralRewardAmount,
      referralRewardType: settings.referralRewardType,
      referralWelcomeDiscount: settings.referralWelcomeDiscount,
      referralWelcomeDiscountType: settings.referralWelcomeDiscountType,
      birthdayEmailEnabled: settings.birthdayEmailEnabled !== undefined ? settings.birthdayEmailEnabled : true,
      birthdayDiscountEnabled: settings.birthdayDiscountEnabled !== undefined ? settings.birthdayDiscountEnabled : true,
      birthdayDiscountPercent: settings.birthdayDiscountPercent !== undefined ? settings.birthdayDiscountPercent : 15,
      birthdayPromoCode: settings.birthdayPromoCode || 'BDAY-LUXURY15',
      birthdayCustomMessage: settings.birthdayCustomMessage || 'To celebrate your special day, enjoy an exclusive luxury treat on us.',
      vendorMonthlyMaintenanceFee: settings.vendorMonthlyMaintenanceFee !== undefined ? settings.vendorMonthlyMaintenanceFee : 500,
      vendorMaintenanceGraceDays: settings.vendorMaintenanceGraceDays !== undefined ? settings.vendorMaintenanceGraceDays : 7,
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
      auctionPremiumDepositAmount,
      auctionStandardBiddingLimit,
      auctionPremiumBiddingLimit,
      eventCommissionPct,
      vatPct,
      gatewayFeePct,
      bankDetails,
      referralRewardAmount,
      referralRewardType,
      referralWelcomeDiscount,
      referralWelcomeDiscountType,
      birthdayEmailEnabled,
      birthdayDiscountEnabled,
      birthdayDiscountPercent,
      birthdayPromoCode,
      birthdayCustomMessage,
      vendorMonthlyMaintenanceFee,
      vendorMaintenanceGraceDays,
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
    if (auctionPremiumDepositAmount !== undefined) settings.auctionPremiumDepositAmount = Number(auctionPremiumDepositAmount) || 5000;
    if (auctionStandardBiddingLimit !== undefined) settings.auctionStandardBiddingLimit = Number(auctionStandardBiddingLimit) || 25000;
    if (auctionPremiumBiddingLimit !== undefined) settings.auctionPremiumBiddingLimit = Number(auctionPremiumBiddingLimit) || 250000;
    if (eventCommissionPct !== undefined) settings.eventCommissionPct = eventCommissionPct;
    if (vatPct !== undefined) settings.vatPct = vatPct;
    if (gatewayFeePct !== undefined) settings.gatewayFeePct = gatewayFeePct;
    if (bankDetails !== undefined) settings.bankDetails = bankDetails;

    if (birthdayEmailEnabled !== undefined) settings.birthdayEmailEnabled = Boolean(birthdayEmailEnabled);
    if (birthdayDiscountEnabled !== undefined) settings.birthdayDiscountEnabled = Boolean(birthdayDiscountEnabled);
    if (birthdayDiscountPercent !== undefined) settings.birthdayDiscountPercent = Number(birthdayDiscountPercent) || 0;
    if (birthdayPromoCode !== undefined) settings.birthdayPromoCode = String(birthdayPromoCode).trim();
    if (birthdayCustomMessage !== undefined) settings.birthdayCustomMessage = String(birthdayCustomMessage).trim();

    if (vendorMonthlyMaintenanceFee !== undefined) settings.vendorMonthlyMaintenanceFee = Number(vendorMonthlyMaintenanceFee) || 0;
    if (vendorMaintenanceGraceDays !== undefined) settings.vendorMaintenanceGraceDays = Number(vendorMaintenanceGraceDays) || 0;

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
    if (referralRewardType !== undefined) settings.referralRewardType = referralRewardType;

    if (referralWelcomeDiscount !== undefined) {
      const discount = Number(referralWelcomeDiscount);
      if (!Number.isFinite(discount) || discount < 0 || (nextWelcomeDiscountType === 'percentage' && discount > 100)) {
        return res.status(400).json({ message: 'Welcome discount must be a valid non-negative amount (maximum 100 for percentage rewards)' });
      }
      settings.referralWelcomeDiscount = discount;
    }
    if (referralWelcomeDiscountType !== undefined) settings.referralWelcomeDiscountType = referralWelcomeDiscountType;

    await settings.save();
    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getPublicSettings, updateSettings };
