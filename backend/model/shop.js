const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
      default: "KRISHNA DRY CLEANING",
    },

    tagline: {
      type: String,
      default: "Premium Care for Your Clothes.",
      trim: true,
    },

    description: {
      type: String,
      default:
        "Professional dry cleaning and garment care with quality service and attention to every detail.",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      default: "Delhi",
      trim: true,
    },

    latitude: {
      type: Number,
      default: 28.6063112,
    },

    longitude: {
      type: Number,
      default: 77.0399242,
    },

    video: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    services: [
      {
        type: String,
        trim: true,
      },
    ],

    openingHours: {
      monday: { type: String, default: "09:00 AM - 09:00 PM" },
      tuesday: { type: String, default: "09:00 AM - 09:00 PM" },
      wednesday: { type: String, default: "09:00 AM - 09:00 PM" },
      thursday: { type: String, default: "09:00 AM - 09:00 PM" },
      friday: { type: String, default: "09:00 AM - 09:00 PM" },
      saturday: { type: String, default: "09:00 AM - 09:00 PM" },
      sunday: { type: String, default: "09:00 AM - 09:00 PM" },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shop", shopSchema);