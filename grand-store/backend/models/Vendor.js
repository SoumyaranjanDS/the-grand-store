const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Step 1: Progress Tracking
  onboardingStep: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'suspended'],
    default: 'draft'
  },
  verificationScore: {
    businessVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
    licenceVerified: { type: Boolean, default: false },
    taxVerified: { type: Boolean, default: false },
    bankVerified: { type: Boolean, default: false },
  },
  
  // Step 2: Business
  businessInfo: {
    legalName: String,
    tradingName: String,
    registrationNumber: String,
    businessType: String,
    address: String,
  },
  
  // Step 3: KYC
  kycInfo: {
    directorName: String,
    idNumber: String,
    contactNumber: String,
    idDocumentUrl: String,
  },
  
  // Step 4: Tax
  taxInfo: {
    taxNumber: String,
    vatNumber: String,
    taxClearanceUrl: String,
  },
  
  // Step 5: Licence
  licenceInfo: {
    licenceNumber: String,
    licenceType: String,
    expiryDate: Date,
    licenceDocumentUrl: String,
  },
  
  // Step 6: Customs
  customsInfo: {
    exportCode: String,
    exportDocumentUrl: String,
  },
  
  // Step 7: Banking
  bankingInfo: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    branchCode: String,
    swiftCode: String,
    bankConfirmationUrl: String,
    payoutPreference: {
      type: String,
      enum: ['Weekly', 'Fortnightly', 'Monthly'],
      default: 'Monthly'
    }
  },
  
  // Step 8: Products
  productCategories: [String],
  
  // Step 9: Delivery
  deliveryInfo: {
    fulfillmentMethod: String,
    dispatchLocation: String,
    dispatchDays: String,
    cutoffTime: String,
    processingTime: String,
  },
  
  // Step 10: Agreement
  agreements: {
    termsAccepted: { type: Boolean, default: false },
    informationAccurate: { type: Boolean, default: false },
    acceptedAt: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
