const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // =====================================================
    // NOTIFICATION FOR
    // =====================================================

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // WHO CREATED THE NOTIFICATION
    // =====================================================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =====================================================
    // TYPE
    // =====================================================

    type: {
      type: String,
      enum: [
        "user_registered",
        "review",
        "service",
        "system",
      ],
      required: true,
    },

    // =====================================================
    // TITLE
    // =====================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // MESSAGE
    // =====================================================

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // READ / UNREAD
    // =====================================================

    isRead: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // OPTIONAL LINK
    // =====================================================

    link: {
      type: String,
      default: "",
    },

    // =====================================================
    // EXTRA DATA
    // =====================================================

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);