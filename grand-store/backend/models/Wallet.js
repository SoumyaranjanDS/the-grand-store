const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Available funds ready to be withdrawn by the vendor
  availableBalance: { type: Number, default: 0 },
  
  // Funds from recent sales that have not cleared yet (e.g. pending delivery)
  pendingBalance: { type: Number, default: 0 },
  
  // Lifetime stats
  totalEarned: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  
  // Preferred payout method (e.g., EFT details)
  payoutDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    branchCode: { type: String },
    accountType: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
