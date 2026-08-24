const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide a name'] },
  quote: { type: String },
  role: { type: String, default: 'Wine farm partner' },
  isActive: { type: Boolean, default: true },
  location: { type: String },
  image: { type: String },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  bottle: { type: String },
  text: { type: String },
  date: { type: String, default: 'Verified Client' },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
