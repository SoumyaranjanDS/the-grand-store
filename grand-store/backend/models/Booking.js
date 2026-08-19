const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  ticketType: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },

  // === ACCOUNTING BREAKDOWN ===
  subTotal: { type: Number, required: true },         // quantity × ticket price
  commissionPct: { type: Number, default: 10 },       // % snapshot from PlatformSettings
  commissionAmount: { type: Number, default: 0 },     // GS commission on subTotal
  vatPct: { type: Number, default: 15 },              // VAT % snapshot
  vatAmount: { type: Number, default: 0 },            // VAT on subTotal
  organizerPayable: { type: Number, default: 0 },     // subTotal - commission - VAT
  totalPrice: { type: Number, required: true },       // What customer pays = subTotal + VAT

  // GS Reference
  gsReference: { type: String },                     // e.g. GS-26-EVT-BKG-000001

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
    default: 'Paid'
  },
  ticketStatus: {
    type: String,
    enum: ['Valid', 'Used', 'Cancelled'],
    default: 'Valid'
  },
  ticketId: { type: String, required: true, unique: true },
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);

