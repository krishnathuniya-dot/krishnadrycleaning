const express = require("express");

const router = express.Router();

const {
  addReview,
  getReviews,
  getMyReview,
  updateReview,
  deleteReview,adminDeleteReview
} = require("../controller/reviewController");

const authMiddleware = require("../middleware/authMiddleware");


// =====================================================
// GET ALL REVIEWS
// Public route
// =====================================================

router.get(
  "/reviews",
  getReviews
);


// =====================================================
// ADD REVIEW
// Login required
// =====================================================

router.post(
  "/reviews",
  authMiddleware,
  addReview
);


// =====================================================
// GET MY REVIEW
// Login required
// =====================================================

router.get(
  "/reviews/my",
  authMiddleware,
  getMyReview
);


// =====================================================
// UPDATE MY REVIEW
// Login required
// =====================================================

router.put(
  "/reviews/:id",
  authMiddleware,
  updateReview
);


// =====================================================
// DELETE MY REVIEW
// Login required
// =====================================================

router.delete(
  "/reviews/:id",
  authMiddleware,
  deleteReview
);
// =====================================================
// ADMIN DELETE ANY REVIEW
// =====================================================

router.delete(
  "/admin/reviews/:id",
  authMiddleware,
  adminDeleteReview
);


module.exports = router;