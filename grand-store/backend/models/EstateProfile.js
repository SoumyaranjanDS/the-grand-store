const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g. "Classic Wine Tasting"
  description: { type: String },
  price: { type: Number },
  duration: { type: String },                    // e.g. "60 minutes"
  capacity: { type: Number },                    // max guests
  isAvailable: { type: Boolean, default: true }
}, { _id: false });

const estateProfileSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  isPublished: { type: Boolean, default: false },

  // ── Hero & Media ─────────────────────────────
  heroImageUrl:  { type: String },
  galleryUrls:   [{ type: String }],

  // ── Core Info ────────────────────────────────
  estateName:   { type: String, required: true },
  region:       { type: String },                 // e.g. "Stellenbosch"
  country:      { type: String, default: 'South Africa' },
  tagline:      { type: String },                 // Short sentence under name

  // ── Our Story ────────────────────────────────
  story: {
    foundedYear:     { type: Number },
    founders:        { type: String },
    history:         { type: String },            // Long text
    winemaker:       { type: String },
    winemakerBio:    { type: String },
    philosophy:      { type: String },
  },

  // ── Vineyard Details ─────────────────────────
  vineyard: {
    altitude:        { type: String },
    soil:            { type: String },
    climate:         { type: String },
    grapeVarieties:  [{ type: String }],
    viticulture:     { type: String },            // e.g. "Organic", "Biodynamic"
    sustainability:  { type: String },
  },

  // ── Hospitality ──────────────────────────────
  hospitality: {
    hasTastings: { type: Boolean, default: false },
    tastings: [experienceSchema],                 // Available tasting packages

    hasRestaurant: { type: Boolean, default: false },
    restaurant: {
      name:         { type: String },
      description:  { type: String },
      openingHours: { type: String },             // e.g. "Wed–Sun 12:00–15:00"
      menuUrl:      { type: String },
      phoneNumber:  { type: String },
    },

    hasAccommodation: { type: Boolean, default: false },
    accommodation: {
      description:   { type: String },
      roomTypes:     [{ type: String }],          // e.g. ["Vineyard Cottage", "Suite"]
      priceFrom:     { type: Number },            // Starting nightly rate
      bookingEmail:  { type: String },
      bookingPhone:  { type: String },
    },

    experiences: [experienceSchema],              // Other experiences (tours, harvests, etc.)
  },

  // ── Customer Follow ──────────────────────────
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // ── Contact ──────────────────────────────────
  contact: {
    email:    { type: String },
    phone:    { type: String },
    website:  { type: String },
    address:  { type: String },
    mapLink:  { type: String },
    instagram: { type: String },
    facebook:  { type: String },
  },

  // ── Awards & Accolades ───────────────────────
  awards: [{ type: String }],

}, { timestamps: true });

module.exports = mongoose.model('EstateProfile', estateProfileSchema);
