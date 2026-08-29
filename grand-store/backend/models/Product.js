const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    category: {
      type: String,
    },
    country: {
      type: String,
    },
    brand: {
      type: String,
    },
    size: {
      type: String,
    },
    subcategory: {
      type: String,
    },
    description: String,
    price: {
      type: String,
    },
    image: String,
    imageSource: String,
    imageSourceUrl: String,
    imageSyncedAt: Date,
    originalImage: String,
    backgroundRemovalStatus: {
      type: String,
      enum: ["not_requested", "pending", "complete", "failed", "skipped"],
      default: "not_requested",
    },
    backgroundRemovalError: String,
    backgroundRemovedAt: Date,
    cloudinaryPublicId: String,
    gallery: [String],
    factSheetPdf: String,
    featured: {
      type: Boolean,
      default: false,
    },
    options: [String],
    tags: [String],
    tastingNotes: [String],
    flavorProfile: [String],
    foodPairing: [String],
    identity: {
      type: { type: String, default: "" },
      style: { type: String, default: "" },
      production: { type: String, default: "" },
      origin: { type: String, default: "" },
      age: { type: String, default: "" },
      bottleSize: { type: String, default: "" },
      abv: { type: String, default: "" },
    },
    stock: {
      type: Number,
      default: 0,
    },
    // Social Proof Engine Metrics
    badges: [
      {
        type: String, // e.g., 'GRAND_STORE_CHOICE', 'MOST_LOVED', 'TRENDING'
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Default to approved for the seeded products
    },
    catalogManaged: {
      type: Boolean,
      default: false,
    },
    sourceWorkbooks: [String],
    sourceUrl: String,
    importedAt: Date,
    isCatalogDuplicate: {
      type: Boolean,
      default: false,
    },
    catalogDuplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
