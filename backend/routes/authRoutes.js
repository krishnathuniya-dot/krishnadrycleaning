const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  changePassword,
  deleteAccount,
  logout,
  getAllUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
  googleLogin,
  completeProfile, // ← YE ADD HUA HAI
} = require("../controller/authcontroller");

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/uploads");

// =====================================================
// SIGNUP
// =====================================================

router.post("/signup", signup);

// =====================================================
// LOGIN
// =====================================================

router.post("/login", login);

// =====================================================
// GOOGLE LOGIN
// =====================================================

router.post("/auth/google", googleLogin);

// =====================================================
// COMPLETE PROFILE (Mobile Save After Google Login)
// =====================================================

router.post(
  "/complete-profile",
  authMiddleware,
  completeProfile
); // ← YE ADD HUA HAI

// =====================================================
// PROFILE
// =====================================================

// Get profile
router.get("/profile", authMiddleware, getProfile);

// Update profile + image
router.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

// =====================================================
// SETTINGS
// =====================================================

// Get settings
router.get("/settings", authMiddleware, getSettings);

// Update settings
router.put("/settings", authMiddleware, updateSettings);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

// =====================================================
// DELETE OWN ACCOUNT
// =====================================================

router.delete("/profile", authMiddleware, deleteAccount);

// =====================================================
// LOGOUT
// =====================================================

router.post("/logout", authMiddleware, logout);

// =====================================================
// GET ALL USERS
// =====================================================

router.get("/users", getAllUsers);

// =====================================================
// FORGOT / RESET PASSWORD
// =====================================================

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

// =====================================================
// ADMIN DELETE USER
// =====================================================

router.delete("/users/:id", authMiddleware, deleteUser);

module.exports = router;