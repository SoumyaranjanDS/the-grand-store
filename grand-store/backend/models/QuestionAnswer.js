const mongoose = require('mongoose');

const questionAnswerSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  asker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answers: [{
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    responderType: {
      type: String,
      enum: ['vendor', 'expert', 'customer'],
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, { timestamps: true });

questionAnswerSchema.index({ productId: 1, status: 1 });

module.exports = mongoose.model('QuestionAnswer', questionAnswerSchema);
