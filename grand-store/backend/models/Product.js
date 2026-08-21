const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  description: String,
  price: {
    type: String,
  },
  image: String,
  gallery: [String],
  factSheetPdf: String,
  featured: {
    type: Boolean,
    default: false
  },
  options: [String],
  tags: [String],
  tastingNotes: [String],
  stock: {
    type: Number,
    default: 0
  },
  // Social Proof Engine Metrics
  badges: [{
    type: String // e.g., 'GRAND_STORE_CHOICE', 'MOST_LOVED', 'TRENDING'
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Default to approved for the seeded products
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
