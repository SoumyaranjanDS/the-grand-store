const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  brandLogos: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
