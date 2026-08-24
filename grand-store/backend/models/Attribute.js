const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an attribute name (e.g. Smoky & Peaty)'],
  },
  value: {
    type: String,
    required: [true, 'Please provide an attribute value ID (e.g. smoky)'],
    unique: true
  },
  type: {
    type: String,
    enum: ['flavor', 'pairing'],
    required: [true, 'Please specify if this is a flavor or food pairing'],
  },
  icon: {
    type: String,
    required: [true, 'Please provide a Lucide icon name (e.g. Flame)'],
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attribute', attributeSchema);
