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
    const defaultList = [
      { id: 'bank_name', key: 'Bank Name', value: settings.bankDetails?.bankName || 'Standard Bank' },
      { id: 'account_name', key: 'Account Holder', value: settings.bankDetails?.accountName || 'The Grand Store PTY LTD' },
      { id: 'account_number', key: 'Account Number', value: settings.bankDetails?.accountNumber || '0123456789' },
      { id: 'branch_code', key: 'Branch Code', value: settings.bankDetails?.branchCode || '051001' },
      { id: 'account_type', key: 'Account Type', value: settings.bankDetails?.accountType || 'Business Cheque' },
      { id: 'swift_code', key: 'SWIFT / BIC Code', value: settings.bankDetails?.swiftCode || 'SBZAJJ' },
      { id: 'reference_note', key: 'Reference Instructions', value: settings.bankDetails?.referenceNote || 'Use Order ID or Bidder Number as deposit reference' }
    ];

    const bankDetailsList = (Array.isArray(settings.bankDetailsList) && settings.bankDetailsList.length > 0)
      ? settings.bankDetailsList
      : defaultList;

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
      bankDetails: {
        bankName: settings.bankDetails?.bankName || 'Standard Bank',
        accountName: settings.bankDetails?.accountName || 'The Grand Store PTY LTD',
        accountNumber: settings.bankDetails?.accountNumber || '0123456789',
        branchCode: settings.bankDetails?.branchCode || '051001',
        accountType: settings.bankDetails?.accountType || 'Business Cheque',
        swiftCode: settings.bankDetails?.swiftCode || 'SBZAJJ',
        referenceNote: settings.bankDetails?.referenceNote || 'Use Order ID or Bidder Number as deposit reference'
      },
      bankDetailsList,
      referralRewardAmount: settings.referralRewardAmount !== undefined ? settings.referralRewardAmount : 50,
      referralRewardType: settings.referralRewardType || 'fixed',
      referralMaxRewardedUsers: settings.referralMaxRewardedUsers !== undefined ? settings.referralMaxRewardedUsers : 5,
      referralWelcomeDiscountEnabled: settings.referralWelcomeDiscountEnabled || false,
      referralWelcomeDiscount: settings.referralWelcomeDiscount !== undefined ? settings.referralWelcomeDiscount : 0,
      referralWelcomeDiscountType: settings.referralWelcomeDiscountType || 'fixed',
      birthdayEmailEnabled: settings.birthdayEmailEnabled !== undefined ? settings.birthdayEmailEnabled : true,
      birthdayDiscountEnabled: settings.birthdayDiscountEnabled !== undefined ? settings.birthdayDiscountEnabled : true,
      birthdayDiscountPercent: settings.birthdayDiscountPercent !== undefined ? settings.birthdayDiscountPercent : 15,
      birthdayPromoCode: settings.birthdayPromoCode || 'BDAY-LUXURY15',
      birthdayCustomMessage: settings.birthdayCustomMessage || 'To celebrate your special day, enjoy an exclusive luxury treat on us.',
      vendorMonthlyMaintenanceFee: settings.vendorMonthlyMaintenanceFee !== undefined ? settings.vendorMonthlyMaintenanceFee : 500,
      vendorMaintenanceGraceDays: settings.vendorMaintenanceGraceDays !== undefined ? settings.vendorMaintenanceGraceDays : 7,
      bidderKycMinAge: settings.bidderKycMinAge !== undefined ? settings.bidderKycMinAge : 18,
      bidderKycRequireDocumentUpload: settings.bidderKycRequireDocumentUpload !== undefined ? settings.bidderKycRequireDocumentUpload : true,
      bidderKycIdTypes: (Array.isArray(settings.bidderKycIdTypes) && settings.bidderKycIdTypes.length > 0)
        ? settings.bidderKycIdTypes
        : ['National ID', 'Passport', 'Driver License'],
      bidderKycFields: (Array.isArray(settings.bidderKycFields) && settings.bidderKycFields.length > 0)
        ? settings.bidderKycFields
        : [
            {
              id: 'fullName',
              key: 'fullName',
              label: 'Full Legal Name',
              type: 'text',
              placeholder: 'As printed on your official identification document',
              required: true,
              helpText: 'Official name for CPA compliance & bidding certificate',
              enabled: true
            },
            {
              id: 'dateOfBirth',
              key: 'dateOfBirth',
              label: 'Date of Birth',
              type: 'date',
              placeholder: '',
              required: true,
              helpText: 'Must be at least 18 years of age for legal liquor and auction qualification',
              enabled: true
            },
            {
              id: 'idType',
              key: 'idType',
              label: 'Identification Document Type',
              type: 'select',
              options: ['National ID', 'Passport', 'Driver License'],
              placeholder: '',
              required: true,
              helpText: 'Select the document type you will provide',
              enabled: true
            },
            {
              id: 'idNumber',
              key: 'idNumber',
              label: 'ID / Passport / Document Number',
              type: 'text',
              placeholder: 'e.g. 9204155029087 or A12345678',
              required: true,
              helpText: 'Official unique identification number',
              enabled: true
            },
            {
              id: 'idDocumentUrl',
              key: 'idDocumentUrl',
              label: 'Passport or ID Document Upload',
              type: 'file',
              placeholder: '',
              required: true,
              helpText: 'Upload a clear photo or PDF scan of your passport or ID document (Max 10MB)',
              enabled: true
            },
            {
              id: 'proofOfResidenceUrl',
              key: 'proofOfResidenceUrl',
              label: 'Proof of Residence Document (Optional)',
              type: 'file',
              placeholder: '',
              required: false,
              helpText: 'Utility bill or bank statement less than 3 months old for expedited review',
              enabled: true
            }
          ]
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
      bankDetailsList,
      referralRewardAmount,
      referralRewardType,
      referralMaxRewardedUsers,
      referralWelcomeDiscountEnabled,
      referralWelcomeDiscount,
      referralWelcomeDiscountType,
      birthdayEmailEnabled,
      birthdayDiscountEnabled,
      birthdayDiscountPercent,
      birthdayPromoCode,
      birthdayCustomMessage,
      vendorMonthlyMaintenanceFee,
      vendorMaintenanceGraceDays,
      bidderKycMinAge,
      bidderKycRequireDocumentUpload,
      bidderKycIdTypes,
      bidderKycFields,
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

    if (Array.isArray(bankDetailsList)) {
      settings.bankDetailsList = bankDetailsList
        .filter(item => item && typeof item === 'object' && (String(item.key || '').trim() || String(item.value || '').trim()))
        .map((item, idx) => ({
          id: String(item.id || `bank_key_${Date.now()}_${idx}`),
          key: String(item.key || '').trim(),
          value: String(item.value || '').trim()
        }));

      // Also sync back to bankDetails object for standard fields
      const bObj = { ...(settings.bankDetails || {}) };
      for (const item of settings.bankDetailsList) {
        const k = item.key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (k.includes('bankname') || k === 'bank') bObj.bankName = item.value;
        else if (k.includes('accountname') || k.includes('accountholder') || k.includes('holder') || k.includes('beneficiary')) bObj.accountName = item.value;
        else if (k.includes('accountnumber') || k.includes('accountno') || k === 'account') bObj.accountNumber = item.value;
        else if (k.includes('branchcode') || k.includes('branch') || k.includes('clearingcode')) bObj.branchCode = item.value;
        else if (k.includes('accounttype') || k.includes('type')) bObj.accountType = item.value;
        else if (k.includes('swift') || k.includes('bic')) bObj.swiftCode = item.value;
        else if (k.includes('reference') || k.includes('ref')) bObj.referenceNote = item.value;
      }
      settings.bankDetails = bObj;
    } else if (bankDetails !== undefined && typeof bankDetails === 'object') {
      settings.bankDetails = {
        bankName: String(bankDetails.bankName || 'Standard Bank').trim(),
        accountName: String(bankDetails.accountName || 'The Grand Store PTY LTD').trim(),
        accountNumber: String(bankDetails.accountNumber || '0123456789').trim(),
        branchCode: String(bankDetails.branchCode || '051001').trim(),
        accountType: String(bankDetails.accountType || 'Business Cheque').trim(),
        swiftCode: String(bankDetails.swiftCode || 'SBZAJJ').trim(),
        referenceNote: String(bankDetails.referenceNote || 'Use Order ID or Bidder Number as deposit reference').trim()
      };
    }

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

    if (referralMaxRewardedUsers !== undefined) {
      const maxUsers = Math.max(0, parseInt(referralMaxRewardedUsers, 10) || 0);
      settings.referralMaxRewardedUsers = maxUsers;
    }
    if (referralWelcomeDiscountEnabled !== undefined) {
      settings.referralWelcomeDiscountEnabled = Boolean(referralWelcomeDiscountEnabled);
    }

    if (referralWelcomeDiscount !== undefined) {
      const discount = Number(referralWelcomeDiscount);
      if (!Number.isFinite(discount) || discount < 0 || (nextWelcomeDiscountType === 'percentage' && discount > 100)) {
        return res.status(400).json({ message: 'Welcome discount must be a valid non-negative amount (maximum 100 for percentage rewards)' });
      }
      settings.referralWelcomeDiscount = discount;
    }
    if (referralWelcomeDiscountType !== undefined) settings.referralWelcomeDiscountType = referralWelcomeDiscountType;

    if (bidderKycMinAge !== undefined) settings.bidderKycMinAge = Math.max(18, Number(bidderKycMinAge) || 18);
    if (bidderKycRequireDocumentUpload !== undefined) settings.bidderKycRequireDocumentUpload = Boolean(bidderKycRequireDocumentUpload);
    if (Array.isArray(bidderKycIdTypes)) {
      settings.bidderKycIdTypes = bidderKycIdTypes.filter(t => t && String(t).trim()).map(t => String(t).trim());
    }
    if (Array.isArray(bidderKycFields)) {
      settings.bidderKycFields = bidderKycFields
        .filter(f => f && typeof f === 'object' && (String(f.key || '').trim() || String(f.label || '').trim()))
        .map((f, idx) => ({
          id: String(f.id || `kyc_f_${Date.now()}_${idx}`),
          key: String(f.key || '').trim(),
          label: String(f.label || '').trim(),
          type: String(f.type || 'text').trim(),
          options: Array.isArray(f.options) ? f.options.filter(Boolean).map(o => String(o).trim()) : [],
          placeholder: String(f.placeholder || '').trim(),
          required: Boolean(f.required),
          helpText: String(f.helpText || '').trim(),
          enabled: f.enabled !== false
        }));
    }

    await settings.save();
    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getPublicSettings, updateSettings };
