const mongoose = require('mongoose');

const advertisedProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  price: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  tagline: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AdvertisedProduct', advertisedProductSchema);
