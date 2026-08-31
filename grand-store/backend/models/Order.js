const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // GS Reference IDs
  transactionId: { type: String, unique: true },
  orderId: { type: String, unique: true },
  paymentId: { type: String, unique: true },
  invoiceNumber: { type: String, unique: true },

  orderItems: [
    {
      product: { type: String, required: true },
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      category: { type: String, default: 'Uncategorised' },
      subcategory: { type: String, default: '' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      option: { type: String },
      image: { type: String }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  
  isGift: { type: Boolean, default: false },
  giftRecipientName: { type: String, default: "" },
  giftMessage: { type: String, default: "" },

  paymentMethod: { type: String, required: true },
  proofUrl: { type: String },

  // === ACCOUNTING BREAKDOWN ===
  subTotal: { type: Number, default: 0 },          // Products total before any fees
  shippingCost: { type: Number, default: 0 },       // Sum of all courier quotes
  vatPct: { type: Number, default: 0 },             // 15% (Domestic) or 0% (Export)
  vatAmount: { type: Number, default: 0 },          // Calculated VAT on subTotal
  
  // International Charges (DDP)
  importDuties: { type: Number, default: 0 },
  importTaxes: { type: Number, default: 0 },
  customsFees: { type: Number, default: 0 },
  
  commissionPct: { type: Number, default: 15 },     // Commission % snapshot
  commissionAmount: { type: Number, default: 0 },   // Grand Store commission on subTotal
  gatewayFeePct: { type: Number, default: 2.5 },
  gatewayFeeAmount: { type: Number, default: 0 },   // Payment gateway fee

  appliedWelcomeDiscount: { type: Number, default: 0 },
  appliedRewards: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 }, // = subTotal + shipping + VAT + duties - discounts

  shipments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  }],

  // Per-vendor payable breakdown
  vendorPayables: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    grossAmount: { type: Number },     // vendor's product total
    commission: { type: Number },      // GS commission on their items
    vatDeducted: { type: Number },     // VAT deducted from vendor
    netPayable: { type: Number },      // What vendor actually receives
    paid: { type: Boolean, default: false },
    paidAt: { type: Date }
  }],

  // Payment status
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Awaiting_Approval', 'Authorised', 'Paid', 'Allocated', 'Settled', 'Failed', 'Cancelled', 'Refunded', 'Disputed'],
    default: 'Pending'
  },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
