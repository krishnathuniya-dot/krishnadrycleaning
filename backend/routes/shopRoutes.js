
const express = require("express");
const router = express.Router();

const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const adminAuth = require("../middleware/adminAuthMiddleware");

const {
  getShop,
  getAdminShop,
  updateShop,
  deleteShopImage,
  deleteShopVideo,
} = require("../controller/shopController");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage: file local uploads folder mein save nahi hogi
const storage = multer.memoryStorage();

// File validation
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
      new Error("Only MP4, WEBM, MOV or AVI videos allowed")
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
      new Error("Only JPG, JPEG, PNG or WEBP images allowed")
    );
  }

  return cb(new Error("Unsupported file field"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 11,
  },
});

// Upload a file buffer directly to Cloudinary
const uploadToCloudinary = (file, resourceType) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("File buffer is missing"));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "krishna-dry-cleaning/shop",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

// Export helper for the controller
router.uploadToCloudinary = uploadToCloudinary;
router.cloudinary = cloudinary;

// Public routes
router.get("/", getShop);

// Admin routes
router.get("/admin", adminAuth, getAdminShop);

router.put(
  "/admin",
  adminAuth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateShop
);

router.delete("/admin/image", adminAuth, deleteShopImage);
router.delete("/admin/video", adminAuth, deleteShopVideo);

// Multer and upload errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    console.error("Shop upload error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});

module.exports = router;
