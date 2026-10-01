const Review = require("../model/review");
const User = require("../model/user");
const { notifyAllAdmins } = require("./notificationController");

// =====================================================
// ADD REVIEW
// =====================================================

const addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Rating and review are required",
      });
    }

    const numericRating = Number(rating);

    if (
      isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (review.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Review must be at least 3 characters",
      });
    }

    // ---------------------------------------------
    // GET LOGGED-IN USER
    // ---------------------------------------------

    const user = await User.findById(req.user.userId).select(
      "fullName profileImage"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------------------------------------
    // CREATE REVIEW
    // ---------------------------------------------

    const newReview = await Review.create({
      userId: user._id,

      name: user.fullName,

      profileImage: user.profileImage || "",

      rating: numericRating,

      review: review.trim(),
    });

    // =================================================
    // ADMIN NOTIFICATION
    // =================================================

    try {
      await notifyAllAdmins({
        type: "review",
        title: "New Review Received",
        message: `${user.fullName} has submitted a new ${numericRating}-star review.`,
      });
    } catch (notificationError) {
      // Notification fail hone par review fail nahi hoga
      console.log(
        "Review Notification Error:",
        notificationError
      );
    }

    // ---------------------------------------------
    // RESPONSE
    // ---------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.log("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while adding review",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL REVIEWS
// =====================================================

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "fullName profileImage")
      .sort({
        createdAt: -1,
      })
      .limit(20);

    // ---------------------------------------------
    // FORMAT REVIEWS
    // ---------------------------------------------

    const formattedReviews = reviews.map((item) => ({
      _id: item._id,

      userId: item.userId?._id,

      name:
        item.userId?.fullName ||
        item.name ||
        "User",

      profileImage:
        item.userId?.profileImage ||
        item.profileImage ||
        "",

      rating: item.rating,

      review: item.review,

      createdAt: item.createdAt,
    }));

    // ---------------------------------------------
    // AVERAGE RATING
    // ---------------------------------------------

    let averageRating = 0;

    if (formattedReviews.length > 0) {
      const totalRating = formattedReviews.reduce(
        (sum, item) =>
          sum + Number(item.rating),
        0
      );

      averageRating =
        totalRating /
        formattedReviews.length;
    }

    // ---------------------------------------------
    // RESPONSE
    // ---------------------------------------------

    return res.status(200).json({
      success: true,

      totalReviews:
        formattedReviews.length,

      averageRating:
        Number(averageRating.toFixed(1)),

      reviews: formattedReviews,
    });
  } catch (error) {
    console.log("Get Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while getting reviews",
      error: error.message,
    });
  }
};

// =====================================================
// GET LOGGED-IN USER REVIEW
// =====================================================

const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      userId: req.user.userId,
    })
      .populate(
        "userId",
        "fullName profileImage"
      )
      .sort({
        createdAt: -1,
      });

    // ---------------------------------------------
    // NO REVIEW
    // ---------------------------------------------

    if (!review) {
      return res.status(200).json({
        success: true,
        exists: false,
        review: null,
      });
    }

    // ---------------------------------------------
    // RESPONSE
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      exists: true,

      review: {
        _id: review._id,

        userId: review.userId?._id,

        name:
          review.userId?.fullName ||
          review.name ||
          "User",

        profileImage:
          review.userId?.profileImage ||
          review.profileImage ||
          "",

        rating: review.rating,

        review: review.review,

        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.log("Get My Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MY REVIEW
// =====================================================

const updateReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Rating and review are required",
      });
    }

    const numericRating = Number(rating);

    if (
      isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (review.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Review must be at least 3 characters",
      });
    }

    // ---------------------------------------------
    // FIND ONLY LOGGED-IN USER REVIEW
    // ---------------------------------------------

    const existingReview =
      await Review.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // ---------------------------------------------
    // GET CURRENT USER
    // ---------------------------------------------

    const user = await User.findById(
      req.user.userId
    ).select("fullName profileImage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------------------------------------
    // UPDATE REVIEW
    // ---------------------------------------------

    existingReview.rating = numericRating;

    existingReview.review =
      review.trim();

    existingReview.name =
      user.fullName;

    existingReview.profileImage =
      user.profileImage || "";

    await existingReview.save();

    // ---------------------------------------------
    // RESPONSE
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",

      review: existingReview,
    });
  } catch (error) {
    console.log(
      "Update Review Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating review",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE MY REVIEW
// =====================================================

const deleteReview = async (req, res) => {
  try {
    const review =
      await Review.findOneAndDelete({
        _id: req.params.id,

        userId: req.user.userId,
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log(
      "Delete Review Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting review",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN DELETE REVIEW
// Admin can delete ANY review
// =====================================================

const adminDeleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    // ---------------------------------------------
    // VALIDATE REVIEW ID
    // ---------------------------------------------

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required",
      });
    }

    // ---------------------------------------------
    // FIND REVIEW
    // ---------------------------------------------

    const review =
      await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // ---------------------------------------------
    // DELETE REVIEW
    // ---------------------------------------------

    await Review.findByIdAndDelete(
      reviewId
    );

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      deletedReviewId: reviewId,
    });
  } catch (error) {
    console.log(
      "Admin Delete Review Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting review",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  addReview,
  getReviews,
  getMyReview,
  updateReview,
  deleteReview,
  adminDeleteReview,
};