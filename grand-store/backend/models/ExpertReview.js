const mongoose = require('mongoose');

const expertReviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  expertName: {
    type: String,
    required: true
  },
  expertTitle: {
    type: String,
    required: true // e.g., "Whisky Specialist", "Master Sommelier"
  },
  expertImage: {
    type: String // URL to expert's headshot
  },
  ratings: {
    overall: { type: Number, required: true, min: 1, max: 10 },
    // E.g. Aroma, Palate, Finish, or Look, Smell, Taste
    criteria: [{
      label: String,
      score: { type: Number, min: 1, max: 10 }
    }]
  },
  verdict: {
    type: String,
    required: true
  },
  detailedReview: {
    type: String // Optional longer review text
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, { timestamps: true });

expertReviewSchema.index({ productId: 1, status: 1 });

module.exports = mongoose.model('ExpertReview', expertReviewSchema);
