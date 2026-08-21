const mongoose = require('mongoose');

const hostApplicationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['auction', 'event'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  // ── Applicant details ─────────────────────────────────────
  applicantName:  { type: String, required: true },
  applicantEmail: { type: String, required: true },
  applicantPhone: { type: String, required: true },
  companyName:    { type: String },

  // ── Auction-specific ──────────────────────────────────────
  itemTitle:       { type: String },
  itemCategory:    { type: String },
  itemDescription: { type: String },
  itemCondition:   { type: String },
  estimatedValue:  { type: Number },

  // ── Event-specific ────────────────────────────────────────
  eventName:       { type: String },
  eventType:       { type: String }, // wine tasting | dinner | masterclass | other
  eventDate:       { type: Date },
  eventVenue:      { type: String },
  eventCapacity:   { type: Number },
  eventDescription:{ type: String },

  // ── Extra notes ───────────────────────────────────────────
  notes: { type: String },

  // ── After admin decision ──────────────────────────────────
  generatedUserId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generatedUsername:{ type: String }, // email used as username
  generatedPassword:{ type: String }, // stored for admin reference
  approvedAt:       { type: Date },
  approvedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt:       { type: Date },
  rejectedReason:   { type: String },
  credentialsSent:  { type: Boolean, default: false }, // email sent flag

}, { timestamps: true });

module.exports = mongoose.model('HostApplication', hostApplicationSchema);
