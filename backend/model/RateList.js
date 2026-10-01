  const mongoose = require("mongoose");

  const rateListSchema = new mongoose.Schema(
    {
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RateCategory",
        required: true,
      },

      // Garment ka naam manually yahin likha jayega
      garment: {
        type: String,
        required: true,
        trim: true,
      },

      // Sirf ye 4 services allowed hain
      service: {
        type: String,
        required: true,
        enum: [
          "Dry Cleaning",
          "Charak",
          "Steam Press",
          "Rafu",
        ],
        trim: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      unit: {
        type: String,
        default: "Per Piece",
        trim: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

  // Category + garment + service combination
  rateListSchema.index({
    categoryId: 1,
    garment: 1,
    service: 1,
  });

  module.exports = mongoose.model("RateList", rateListSchema);