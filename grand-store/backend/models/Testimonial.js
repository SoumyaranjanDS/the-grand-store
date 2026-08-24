const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
  },
  image: {
    type: String,
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
  },
  bottle: {
    type: String,
  },
  text: {
    type: String,
    required: [true, 'Please provide the testimonial text'],
  },
  date: {
    type: String,
    default: 'Verified Client',
  },
  isVisible: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
