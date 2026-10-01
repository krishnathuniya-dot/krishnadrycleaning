const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =====================================================
    // FULL NAME
    // =====================================================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // MOBILE NUMBER
    // =====================================================

     mobile: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // EMAIL
    // =====================================================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =====================================================
    // PASSWORD
    // =====================================================

    password: {
      type: String,
      required: false,
      default: null,
    },
    // =====================================================
    // LAST LOGIN
    // =====================================================

    lastLogin: {
      type: Date,
      default: null,
    },

    // =====================================================
    // PROFILE IMAGE
    // =====================================================

    profileImage: {
      type: String,
      default: "",
    },

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    smsNotifications: {
      type: Boolean,
      default: true,
    },

    // =====================================================
    // LANGUAGE
    // =====================================================

    language: {
      type: String,
      enum: ["English", "Hindi"],
      default: "English",
    },

    // =====================================================
    // DARK MODE
    // =====================================================

    darkMode: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
  type: String,
  default: null,
},
 googleId: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

resetPasswordExpire: {
  type: Date,
  default: null,
},
  },


  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);