
const Shop = require("../model/shop");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const MAX_IMAGES = 6;
const CLOUDINARY_FOLDER = "krishna-dry-cleaning/shop";

// =====================================================
// CLOUDINARY CONFIGURATION
// =====================================================

const checkCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary configuration is incomplete. Check backend environment variables."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

// =====================================================
// UPLOAD IMAGE OR VIDEO TO CLOUDINARY
// Requires Multer memoryStorage() so file.buffer exists.
// =====================================================

const uploadToCloudinary = (file, resourceType) =>
  new Promise((resolve, reject) => {
    try {
      if (!file || !Buffer.isBuffer(file.buffer)) {
        return reject(new Error("Uploaded file buffer is missing."));
      }

      checkCloudinaryConfig();

      cloudinary.uploader
        .upload_stream(
          {
            folder: CLOUDINARY_FOLDER,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            if (!result?.secure_url || !result?.public_id) {
              return reject(
                new Error("Cloudinary returned invalid upload details.")
              );
            }

            resolve(result);
          }
        )
        .end(file.buffer);
    } catch (error) {
      reject(error);
    }
  });

// =====================================================
// EXTRACT CLOUDINARY PUBLIC ID FROM URL
// =====================================================

const getCloudinaryPublicId = (fileUrl) => {
  try {
    const parsed = new URL(fileUrl);

    if (
      parsed.protocol !== "https:" ||
      !(
        parsed.hostname === "cloudinary.com" ||
        parsed.hostname.endsWith(".cloudinary.com")
      )
    ) {
      return null;
    }

    const marker = "/upload/";
    const index = parsed.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    let publicId = decodeURIComponent(
      parsed.pathname.slice(index + marker.length)
    );

    // Remove an optional transformation prefix, if present.
    const segments = publicId.split("/");
    const versionIndex = segments.findIndex((segment) =>
      /^v\d+$/.test(segment)
    );

    if (versionIndex !== -1) {
      publicId = segments.slice(versionIndex + 1).join("/");
    }

    // Remove the file extension.
    publicId = publicId.replace(
      /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|avi|m4v)$/i,
      ""
    );

    return publicId || null;
  } catch {
    return null;
  }
};

// =====================================================
// DELETE CLOUDINARY MEDIA OR LEGACY LOCAL FILE
// =====================================================

const deleteMedia = async (fileUrl, resourceType = "image") => {
  if (!fileUrl || typeof fileUrl !== "string") {
    return;
  }

  let parsed;

  try {
    parsed = new URL(fileUrl);
  } catch {
    // Support legacy relative paths, e.g. /uploads/image.jpg
    try {
      parsed = new URL(fileUrl, "http://localhost");
    } catch {
      return;
    }
  }

  const isCloudinary =
    parsed.protocol === "https:" &&
    (
      parsed.hostname === "cloudinary.com" ||
      parsed.hostname.endsWith(".cloudinary.com")
    );

  if (isCloudinary) {
    checkCloudinaryConfig();

    const publicId = getCloudinaryPublicId(fileUrl);

    if (!publicId) {
      throw new Error("Could not identify Cloudinary public ID.");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (result.result === "error") {
      throw new Error("Cloudinary could not delete the media.");
    }

    if (result.result === "not found") {
      console.warn("Cloudinary media was not found:", publicId);
    }

    return;
  }

  // Only allow deletion from our legacy local uploads directory.
  if (
    parsed.hostname !== "localhost" ||
    !parsed.pathname.startsWith("/uploads/")
  ) {
    return;
  }

  const relativePath = decodeURIComponent(
    parsed.pathname.slice("/uploads/".length)
  );

  const uploadsDirectory = path.resolve(__dirname, "..", "uploads");
  const filePath = path.resolve(uploadsDirectory, relativePath);

  if (!filePath.startsWith(uploadsDirectory + path.sep)) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

// =====================================================
// CLEAN UP NEWLY UPLOADED ASSETS IF UPDATE FAILS
// =====================================================

const cleanupUploadedAssets = async (assets) => {
  if (!assets.length) return;

  try {
    checkCloudinaryConfig();

    const results = await Promise.allSettled(
      assets.map((asset) =>
        cloudinary.uploader.destroy(asset.publicId, {
          resource_type: asset.resourceType,
          invalidate: true,
        })
      )
    );

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error(
          "Cloudinary cleanup error:",
          result.reason?.message
        );
      }
    });
  } catch (error) {
    console.error("Asset cleanup error:", error.message);
  }
};

// =====================================================
// GET PUBLIC SHOP INFORMATION
// =====================================================

const getShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ isActive: true }).lean();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop information not found.",
      });
    }

    return res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get Shop Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get shop information.",
    });
  }
};

// =====================================================
// GET OR CREATE ADMIN SHOP
// =====================================================

const getAdminShop = async (req, res) => {
  try {
    let shop = await Shop.findOne();

    if (!shop) {
      shop = await Shop.create({
        shopName: "KRISHNA DRY CLEANING",
        tagline: "Premium Care for Your Clothes.",
        phone: "",
        email: "",
        address: "Gali No 19, Rajapuri, Uttam Nagar, Delhi",
        city: "Delhi",
        latitude: 28.6063112,
        longitude: 77.0589786,
        services: [
          "Dry Cleaning",
          "Charak",
          "Steam Press",
          "Rafu",
        ],
        images: [],
        video: "",
        isActive: true,
      });
    }

    return res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get Admin Shop Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load shop.",
    });
  }
};

// =====================================================
// UPDATE SHOP AND UPLOAD NEW MEDIA
// =====================================================

const updateShop = async (req, res) => {
  const uploadedAssets = [];

  try {
    const body = req.body || {};

    let shop = await Shop.findOne();

    if (!shop) {
      shop = new Shop({
        shopName: "KRISHNA DRY CLEANING",
        tagline: "Premium Care for Your Clothes.",
        address: "Gali No 19, Rajapuri, Uttam Nagar, Delhi",
        city: "Delhi",
        latitude: 28.6063112,
        longitude: 77.0589786,
        services: [
          "Dry Cleaning",
          "Charak",
          "Steam Press",
          "Rafu",
        ],
        images: [],
        video: "",
        isActive: true,
      });
    }

    const existingImages = Array.isArray(shop.images)
      ? [...shop.images]
      : [];

    const newImages = req.files?.images || [];
    const newVideo = req.files?.video?.[0];

    if (!Array.isArray(newImages)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image upload data.",
      });
    }

    if (existingImages.length + newImages.length > MAX_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_IMAGES} images are allowed. Delete an existing image first.`,
      });
    }

    // Update text fields only when provided.
    const stringFields = [
      "shopName",
      "tagline",
      "description",
      "phone",
      "email",
      "address",
      "city",
    ];

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        shop[field] = body[field];
      }
    }

    // Validate geographic coordinates.
    for (const field of ["latitude", "longitude"]) {
      if (body[field] !== undefined && body[field] !== "") {
        const value = Number(body[field]);
        const min = field === "latitude" ? -90 : -180;
        const max = field === "latitude" ? 90 : 180;

        if (!Number.isFinite(value) || value < min || value > max) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`,
          });
        }

        shop[field] = value;
      }
    }

    // Update services.
    if (body.services !== undefined) {
      if (Array.isArray(body.services)) {
        shop.services = body.services;
      } else {
        let parsedServices;

        try {
          parsedServices = JSON.parse(body.services);
        } catch {
          parsedServices = null;
        }

        shop.services = Array.isArray(parsedServices)
          ? parsedServices
          : String(body.services)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
      }
    }

    // Preserve opening hours when not supplied.
    const previousHours = shop.openingHours?.toObject
      ? shop.openingHours.toObject()
      : shop.openingHours || {};

    const defaultHours = "09:00 AM - 09:00 PM";

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const openingHours = {};

    for (const day of days) {
      openingHours[day] =
        body[day] ?? previousHours[day] ?? defaultHours;
    }

    shop.openingHours = openingHours;

    if (body.isActive !== undefined) {
      if (
        body.isActive === true ||
        body.isActive === "true"
      ) {
        shop.isActive = true;
      } else if (
        body.isActive === false ||
        body.isActive === "false"
      ) {
        shop.isActive = false;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid isActive value.",
        });
      }
    }

    const previousVideo = newVideo ? shop.video : "";

    // Upload the new video first.
    if (newVideo) {
      const result = await uploadToCloudinary(newVideo, "video");

      uploadedAssets.push({
        publicId: result.public_id,
        resourceType: "video",
      });

      shop.video = result.secure_url;
    }

    // Upload new images.
    const newImageUrls = [];

    for (const file of newImages) {
      const result = await uploadToCloudinary(file, "image");

      uploadedAssets.push({
        publicId: result.public_id,
        resourceType: "image",
      });

      newImageUrls.push(result.secure_url);
    }

    // Keep existing images and append new ones.
    shop.images = [...existingImages, ...newImageUrls];

    await shop.save();

    // Cleanup the old video only after the database save succeeds.
    if (previousVideo) {
      try {
        await deleteMedia(previousVideo, "video");
      } catch (error) {
        console.error("Old video cleanup error:", error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully.",
      shop,
    });
  } catch (error) {
    console.error("Update Shop Error:", error.message);

    await cleanupUploadedAssets(uploadedAssets);

    return res.status(500).json({
      success: false,
      message: "Failed to update shop.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE SHOP IMAGE
// =====================================================

const deleteShopImage = async (req, res) => {
  try {
    const { image } = req.body || {};

    if (!image || typeof image !== "string") {
      return res.status(400).json({
        success: false,
        message: "Image URL is required.",
      });
    }

    const shop = await Shop.findOne();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    const images = Array.isArray(shop.images) ? shop.images : [];

    if (!images.includes(image)) {
      return res.status(404).json({
        success: false,
        message: "Image not found in this shop.",
      });
    }

    shop.images = images.filter((item) => item !== image);

    await shop.save();

    try {
      await deleteMedia(image, "image");
    } catch (error) {
      console.error("Image cleanup error:", error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
      images: shop.images,
    });
  } catch (error) {
    console.error("Delete Image Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete image.",
    });
  }
};

// =====================================================
// DELETE SHOP VIDEO
// =====================================================

const deleteShopVideo = async (req, res) => {
  try {
    const shop = await Shop.findOne();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    const previousVideo = shop.video;

    shop.video = "";

    await shop.save();

    if (previousVideo) {
      try {
        await deleteMedia(previousVideo, "video");
      } catch (error) {
        console.error("Video cleanup error:", error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Video Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete video.",
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  getShop,
  getAdminShop,
  updateShop,
  deleteShopImage,
  deleteShopVideo,
};
