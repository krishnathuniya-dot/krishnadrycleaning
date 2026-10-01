const express = require("express");

const router = express.Router();

const {
  getAdminNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controller/notificationController");

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// =====================================================
// GET ADMIN NOTIFICATIONS
// =====================================================

router.get(
  "/notifications",
  adminAuthMiddleware,
  getAdminNotifications
);

// =====================================================
// UNREAD COUNT
// IMPORTANT: isko /:id se pehle rakha gaya hai
// =====================================================

router.get(
  "/notifications/unread-count",
  adminAuthMiddleware,
  getUnreadNotificationCount
);

// =====================================================
// MARK ALL AS READ
// =====================================================

router.put(
  "/notifications/read-all",
  adminAuthMiddleware,
  markAllNotificationsAsRead
);

// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================================

router.put(
  "/notifications/:id/read",
  adminAuthMiddleware,
  markNotificationAsRead
);

// =====================================================
// DELETE NOTIFICATION
// =====================================================

router.delete(
  "/notifications/:id",
  adminAuthMiddleware,
  deleteNotification
);

module.exports = router;