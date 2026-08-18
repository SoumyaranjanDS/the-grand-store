const mongoose = require('mongoose');

const systemCodeSchema = new mongoose.Schema({
  module: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemCode', systemCodeSchema);
