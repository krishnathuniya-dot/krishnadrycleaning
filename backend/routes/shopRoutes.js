
const express = require("express");
const router = express.Router();
const multer = require("multer");

const adminAuth = require("../middleware/adminAuthMiddleware");

const {
  getShop,
  getAdminShop,
  updateShop,
  deleteShopImage,
  deleteShopVideo,
} = require("../controller/shopController");

// =====================================================
// MULTER MEMORY STORAGE
// Required because the controller uploads file.buffer.
// =====================================================

const storage = multer.memoryStorage();

// =====================================================
// FILE TYPE VALIDATION
// =====================================================

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video") {
    const allowedVideos = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (allowedVideos.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only MP4, WEBM, MOV or AVI videos are allowed.")
    );
  }

  if (file.fieldname === "images") {
    const allowedImages = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedImages.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only JPG, PNG and WEBP images are allowed.")
    );
  }

  return cb(new Error("Unsupported file field."));
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 7,
  },
});

// =====================================================
// PUBLIC ROUTE
// =====================================================

router.get("/", getShop);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Get shop details
router.get("/admin", adminAuth, getAdminShop);

// Update shop and upload images/video
router.put(
  "/admin",
  adminAuth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 6 },
  ]),
  updateShop
);

// Delete a shop image
router.delete(
  "/admin/image",
  adminAuth,
  deleteShopImage
);

// Delete shop video
router.delete(
  "/admin/video",
  adminAuth,
  deleteShopVideo
);

// =====================================================
// MULTER AND FILE VALIDATION ERROR HANDLER
// =====================================================

router.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "File upload validation failed.",
      error: error.message,
    });
  }

  if (error) {
    console.error("Shop upload error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Unable to process the uploaded file.",
      error: error.message,
    });
  }

  next();
});

module.exports = router;
