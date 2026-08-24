const mongoose = require("mongoose");

const glossarySchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    definition: {
      type: String,
      required: true,
    },
    letter: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Glossary", glossarySchema);
