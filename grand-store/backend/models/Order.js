const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    unique: true
  },
  orderId: {
    type: String,
    unique: true
  },
  paymentId: {
    type: String,
    unique: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  orderItems: [
    {
      product: {
        type: String,
        required: true
      },
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: { type: String, required: true },
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
  paymentMethod: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
