const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Unique system reference (e.g. GS-26-SHP-PAY-000001)
  gsReference: { type: String, required: true, unique: true },
  
  // High-level categorization
  type: {
    type: String,
    enum: ['payment', 'refund', 'commission', 'payout', 'vat'],
    required: true
  },
  
  // Sub-module originating the transaction
  module: {
    type: String,
    enum: ['shop', 'auction', 'events', 'vendor', 'global'],
    required: true
  },
  
  // Financial amounts
  amount: { type: Number, required: true },
  netAmount: { type: Number, required: true }, // After any deductions like gateway fees
  currency: { type: String, default: 'ZAR' },
  
  // Linked Entities
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  
  // External gateway info
  gateway: { type: String, default: 'PayFast' },
  gatewayTransactionId: { type: String },
  
  // Tracking status
  status: {
    type: String,
    enum: ['pending', 'cleared', 'failed', 'refunded'],
    default: 'pending'
  },
  
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
