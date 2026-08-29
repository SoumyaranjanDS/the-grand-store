const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['product', 'vendor', 'event', 'estate'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, // Can refer to Product, User(Vendor), or Event
    required: true
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  ratings: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    // Optional sub-ratings depending on the type
    quality: { type: Number, min: 1, max: 5 },
    packaging: { type: Number, min: 1, max: 5 },
    delivery: { type: Number, min: 1, max: 5 },
    vendorService: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  comment: {
    type: String,
    trim: true
  },
  media: [{
    type: { type: String, enum: ['photo', 'video_link'] },
    url: String, // Photo URL or YouTube/Vimeo link
    caption: String
  }],
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // User mentioned verified purchases post automatically, admin can edit later
  },
  consentForMarketing: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient querying by reference
reviewSchema.index({ type: 1, referenceId: 1, status: 1 });

module.exports = mongoose.model('Review', reviewSchema);
