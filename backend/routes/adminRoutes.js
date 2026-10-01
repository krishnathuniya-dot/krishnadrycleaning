const express = require("express");

const router = express.Router();

// =====================================================
// ADMIN CONTROLLER
// =====================================================

const {
  adminSignup,
  adminLogin,

  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfileImage,

  changeAdminPassword,
  deleteAdminAccount,

  adminLogout,
  getAdminDashboard,

  // ===================================================
  // OLD LOGIN ACTIVITY
  // ===================================================

  getAdminLoginActivity,
  getActiveAdminSessions,
  logoutAdminDevice,

  // ===================================================
  // NEW SECURITY SYSTEM
  // ===================================================

  getAdminSecurityActivities,
  logoutAdminSecuritySession,
  blockAdminDevice,
  unblockAdminDevice,
  getBlockedAdminDevices,
  getSecuritySummary,
  getSingleSecurityActivity,
  deleteSecurityActivity,
  logoutAllAdminSessions,
} = require("../controller/adminController");

// =====================================================
// MIDDLEWARE
// =====================================================

const adminAuthMiddleware =
  require("../middleware/adminAuthMiddleware");

const upload =
  require("../middleware/uploads");

// =====================================================
// ADMIN SIGNUP
// =====================================================

router.post(
  "/admin/signup",
  adminSignup
);

// =====================================================
// ADMIN LOGIN
// =====================================================

router.post(
  "/admin/login",
  adminLogin
);

// =====================================================
// ADMIN PROFILE
// =====================================================

router.get(
  "/admin/profile",
  adminAuthMiddleware,
  getAdminProfile
);

// =====================================================
// UPDATE ADMIN PROFILE
// =====================================================

router.put(
  "/admin/profile",
  adminAuthMiddleware,
  updateAdminProfile
);

// =====================================================
// PROFILE IMAGE
// =====================================================

router.put(
  "/admin/profile/image",
  adminAuthMiddleware,
  upload.single("profileImage"),
  uploadAdminProfileImage
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
  "/admin/change-password",
  adminAuthMiddleware,
  changeAdminPassword
);

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
  "/admin/dashboard",
  adminAuthMiddleware,
  getAdminDashboard
);

// =====================================================
// OLD LOGIN ACTIVITY
// =====================================================

router.get(
  "/admin/login-activity",
  adminAuthMiddleware,
  getAdminLoginActivity
);

// =====================================================
// OLD ACTIVE SESSIONS
// =====================================================

router.get(
  "/admin/active-sessions",
  adminAuthMiddleware,
  getActiveAdminSessions
);

// =====================================================
// OLD LOGOUT DEVICE
// =====================================================

router.delete(
  "/admin/security/session/:sessionId",
  adminAuthMiddleware,
  logoutAdminDevice
);

// =====================================================
// NEW SECURITY SYSTEM
// =====================================================

// =====================================================
// ALL SECURITY ACTIVITIES
// =====================================================

router.get(
  "/admin/security/activities",
  adminAuthMiddleware,
  getAdminSecurityActivities
);

// =====================================================
// ACTIVE SECURITY SESSIONS
// =====================================================
// IMPORTANT:
// Existing controller function:
// getActiveAdminSessions
// =====================================================

router.get(
  "/admin/security/active",
  adminAuthMiddleware,
  getActiveAdminSessions
);

// =====================================================
// BLOCKED DEVICES
// =====================================================

router.get(
  "/admin/security/blocked",
  adminAuthMiddleware,
  getBlockedAdminDevices
);

// =====================================================
// SECURITY SUMMARY
// =====================================================

router.get(
  "/admin/security/summary",
  adminAuthMiddleware,
  getSecuritySummary
);

// =====================================================
// LOGOUT ALL DEVICES
// =====================================================

router.put(
  "/admin/security/logout-all",
  adminAuthMiddleware,
  logoutAllAdminSessions
);

// =====================================================
// LOGOUT PARTICULAR DEVICE
// =====================================================
// :id = AdminLoginActivity MongoDB _id
// =====================================================

router.put(
  "/admin/security/:id/logout",
  adminAuthMiddleware,
  logoutAdminSecuritySession
);

// =====================================================
// BLOCK PARTICULAR DEVICE
// =====================================================

router.put(
  "/admin/security/:id/block",
  adminAuthMiddleware,
  blockAdminDevice
);

// =====================================================
// UNBLOCK PARTICULAR DEVICE
// =====================================================

router.put(
  "/admin/security/:id/unblock",
  adminAuthMiddleware,
  unblockAdminDevice
);

// =====================================================
// SINGLE SECURITY ACTIVITY
// =====================================================

router.get(
  "/admin/security/:id",
  adminAuthMiddleware,
  getSingleSecurityActivity
);

// =====================================================
// DELETE SECURITY ACTIVITY
// =====================================================

router.delete(
  "/admin/security/:id",
  adminAuthMiddleware,
  deleteSecurityActivity
);

// =====================================================
// CURRENT ADMIN LOGOUT
// =====================================================

router.post(
  "/admin/logout",
  adminAuthMiddleware,
  adminLogout
);

// =====================================================
// DELETE ADMIN ACCOUNT
// =====================================================

router.delete(
  "/admin/account",
  adminAuthMiddleware,
  deleteAdminAccount
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;