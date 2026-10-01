
const mongoose = require("mongoose");

const adminLoginActivitySchema = new mongoose.Schema(
  {
    // =============================================
    // ADMIN
    // =============================================

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    adminEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    // =============================================
    // SESSION
    // =============================================

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    // =============================================
    // DEVICE ID
    // Same admin + same device = same record
    // =============================================

    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // =============================================
    // LOGIN COUNT
    // Only actual successful login
    // =============================================

    loginCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    lastLoginAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // =============================================
    // DEVICE BLOCK
    // =============================================

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    blockedAt: {
      type: Date,
      default: null,
    },

    // =============================================
    // IP
    // =============================================

    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },

    ipVersion: {
      type: String,
      enum: ["IPv4", "IPv6", "Unknown"],
      default: "Unknown",
    },

    // =============================================
    // DEVICE
    // =============================================

    deviceType: {
      type: String,
      enum: ["Desktop", "Mobile", "Tablet", "Unknown"],
      default: "Unknown",
    },

    deviceName: {
      type: String,
      default: "Unknown Device",
      trim: true,
    },

    // =============================================
    // BROWSER
    // =============================================

    browser: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    browserVersion: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    // =============================================
    // OPERATING SYSTEM
    // =============================================

    operatingSystem: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    osVersion: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    // =============================================
    // USER AGENT
    // =============================================

    userAgent: {
      type: String,
      default: "",
      trim: true,
    },

    // =============================================
    // BROWSER INFORMATION
    // =============================================

    language: {
      type: String,
      default: "",
      trim: true,
    },

    timezone: {
      type: String,
      default: "",
      trim: true,
    },

    screenResolution: {
      type: String,
      default: "",
      trim: true,
    },

    // =============================================
    // LOCATION
    // Approximate IP-based location
    // =============================================

    country: {
      type: String,
      default: "",
      trim: true,
    },

    countryCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    region: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    // =============================================
    // LOGIN / ACTIVITY / LOGOUT
    // =============================================

    loginAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },

    logoutAt: {
      type: Date,
      default: null,
    },

    // =============================================
    // SESSION STATUS
    // =============================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["Active", "Logged Out", "Failed"],
      default: "Active",
    },

    success: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// ONE RECORD PER ADMIN + DEVICE
// =====================================================
//
// Same admin + same deviceId
// = SAME RECORD
//
// Different deviceId
// = NEW RECORD
//
// loginCount increases ONLY on successful login.
// =====================================================

adminLoginActivitySchema.index(
  {
    admin: 1,
    deviceId: 1,
  },
  {
    unique: true,
  }
);

// =====================================================
// PERFORMANCE INDEXES
// =====================================================

adminLoginActivitySchema.index({
  admin: 1,
  lastLoginAt: -1,
});

adminLoginActivitySchema.index({
  admin: 1,
  isActive: 1,
});

adminLoginActivitySchema.index({
  admin: 1,
  lastActive: -1,
});

module.exports = mongoose.model(
  "AdminLoginActivity",
  adminLoginActivitySchema
);

