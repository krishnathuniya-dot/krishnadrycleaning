
const express = require("express");

const router = express.Router();

const {
  getAdminSecurityActivities,
  getActiveAdminSessions,
  logoutAdminSession,

  blockAdminDevice,
  unblockAdminDevice,
  getBlockedAdminDevices,

  getSecuritySummary,

  getSingleSecurityActivity,

  deleteSecurityActivity,

  logoutAllAdminSessions,
} = require("../controller/adminSecurityController");

const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// ALL SECURITY ACTIVITIES
// GET
// =====================================================

router.get(
  "/admin/security/activities",
  authMiddleware,
  getAdminSecurityActivities
);

// =====================================================
// ACTIVE SESSIONS
// GET
// =====================================================

router.get(
  "/admin/security/active",
  authMiddleware,
  getActiveAdminSessions
);

// =====================================================
// BLOCKED DEVICES
// GET
// =====================================================

router.get(
  "/admin/security/blocked",
  authMiddleware,
  getBlockedAdminDevices
);

// =====================================================
// SECURITY SUMMARY
// GET
// =====================================================

router.get(
  "/admin/security/summary",
  authMiddleware,
  getSecuritySummary
);

// =====================================================
// LOGOUT ALL ACTIVE SESSIONS
// PUT
//
// Must be BEFORE /:id routes
// =====================================================

router.put(
  "/admin/security/logout-all",
  authMiddleware,
  logoutAllAdminSessions
);

// =====================================================
// LOGOUT PARTICULAR SESSION
// PUT
//
// Logout = device can login again
// =====================================================

router.put(
  "/admin/security/:id/logout",
  authMiddleware,
  logoutAdminSession
);

// =====================================================
// BLOCK DEVICE
// PUT
//
// Block = device cannot login again
// =====================================================

router.put(
  "/admin/security/:id/block",
  authMiddleware,
  blockAdminDevice
);

// =====================================================
// UNBLOCK DEVICE
// PUT
//
// Unblock = device can login again
// =====================================================

router.put(
  "/admin/security/:id/unblock",
  authMiddleware,
  unblockAdminDevice
);

// =====================================================
// GET SINGLE SECURITY ACTIVITY
// GET
//
// Keep this BELOW all fixed routes
// =====================================================

router.get(
  "/admin/security/:id",
  authMiddleware,
  getSingleSecurityActivity
);

// =====================================================
// DELETE SECURITY ACTIVITY
// DELETE
//
// Permanently removes record
// =====================================================

router.delete(
  "/admin/security/:id",
  authMiddleware,
  deleteSecurityActivity
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;

