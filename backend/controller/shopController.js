
const Shop = require("../model/shop");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================================================
// UPLOAD FILE TO CLOUDINARY
// =====================================================

const uploadToCloudinary = (file, resourceType) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("Uploaded file is missing"));
    }

    cloudinary.uploader.upload_stream(
      {
        folder: "krishna-dry-cleaning/shop",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
};

// =====================================================
// GET CLOUDINARY PUBLIC ID FROM URL
// =====================================================

const getCloudinaryPublicId = (fileUrl) => {
  try {
    const parsedUrl = new URL(fileUrl);

    if (!parsedUrl.hostname.endsWith("cloudinary.com")) {
      return null;
    }

    const pathname = parsedUrl.pathname;
    const uploadIndex = pathname.indexOf("/upload/");

    if (uploadIndex === -1) return null;

    let publicId = pathname.substring(uploadIndex + 8);

    // Remove optional version prefix, e.g. v123456/
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
};

// =====================================================
// DELETE CLOUDINARY OR OLD LOCAL FILE
// =====================================================

const deleteMedia = async (fileUrl, resourceType = "image") => {
  if (!fileUrl || typeof fileUrl !== "string") return;

  // Cloudinary media
  if (fileUrl.includes("res.cloudinary.com/")) {
    const publicId = getCloudinaryPublicId(fileUrl);

    if (!publicId) {
      throw new Error("Could not identify Cloudinary public ID");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (result.result === "error") {
      throw new Error("Cloudinary could not delete the file");
    }

    return;
  }

  // Legacy local media: /uploads/shop/filename
  try {
    const pathname = new URL(
      fileUrl,
      "http://localhost"
    ).pathname;

    const prefix = "/uploads/";

    if (!pathname.startsWith(prefix)) return;

    const relativePath = decodeURIComponent(
      pathname.substring(prefix.length)
    );

    const uploadsDirectory = path.resolve(
      __dirname,
      "..",
      "uploads"
    );

    const filePath = path.resolve(
      uploadsDirectory,
      relativePath
    );

    // Prevent paths outside uploads folder
    if (
      filePath !== uploadsDirectory &&
      !filePath.startsWith(uploadsDirectory + path.sep)
    ) {
      return;
    }

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error("Local file delete error:", error.message);
  }
};

// =====================================================
// GET PUBLIC SHOP
// =====================================================

const getShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({
      isActive: true,
    }).lean();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop information not found",
      });
    }

    return res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get shop information",
      error: error.message,
    });
  }
};

// =====================================================
// GET ADMIN SHOP
// =====================================================

const getAdminShop = async (req, res) => {
  try {
    let shop = await Shop.findOne();

    if (!shop) {
      shop = await Shop.create({
        shopName: "KRISHNA DRY CLEANING",
        tagline: "Premium Care for Your Clothes.",
        phone: "+91 98765 43210",
        address: "Gali No 19, Rajapuri, Uttam Nagar, Delhi",
        latitude: 28.6063112,
        longitude: 77.0399242,
        services: [
          "Dry Cleaning",
          "Charak",
          "Steam Press",
          "Rafu",
        ],
      });
    }

    return res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get Admin Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load shop",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE SHOP
// =====================================================

const updateShop = async (req, res) => {
  const uploadedAssets = [];

  try {
    const {
      shopName,
      tagline,
      description,
      phone,
      email,
      address,
      city,
      latitude,
      longitude,
      services,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      isActive,
    } = req.body || {};

    let shop = await Shop.findOne();

    if (!shop) {
      shop = new Shop();
    }

    if (shopName !== undefined) shop.shopName = shopName;
    if (tagline !== undefined) shop.tagline = tagline;
    if (description !== undefined) shop.description = description;
    if (phone !== undefined) shop.phone = phone;
    if (email !== undefined) shop.email = email;
    if (address !== undefined) shop.address = address;
    if (city !== undefined) shop.city = city;

    if (latitude !== undefined && latitude !== "") {
      const value = Number(latitude);

      if (!Number.isFinite(value)) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude",
        });
      }

      shop.latitude = value;
    }

    if (longitude !== undefined && longitude !== "") {
      const value = Number(longitude);

      if (!Number.isFinite(value)) {
        return res.status(400).json({
          success: false,
          message: "Invalid longitude",
        });
      }

      shop.longitude = value;
    }

    if (services !== undefined) {
      try {
        shop.services =
          typeof services === "string"
            ? JSON.parse(services)
            : services;
      } catch {
        shop.services = String(services)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    const previousHours = shop.openingHours || {};
    const defaultHours = "09:00 AM - 09:00 PM";

    shop.openingHours = {
      monday: monday ?? previousHours.monday ?? defaultHours,
      tuesday: tuesday ?? previousHours.tuesday ?? defaultHours,
      wednesday: wednesday ?? previousHours.wednesday ?? defaultHours,
      thursday: thursday ?? previousHours.thursday ?? defaultHours,
      friday: friday ?? previousHours.friday ?? defaultHours,
      saturday: saturday ?? previousHours.saturday ?? defaultHours,
      sunday: sunday ?? previousHours.sunday ?? defaultHours,
    };

    if (isActive !== undefined) {
      shop.isActive =
        isActive === true || isActive === "true";
    }

    // -----------------------------------------------
    // VIDEO UPLOAD
    // -----------------------------------------------

    let previousVideo = null;

    if (req.files?.video?.[0]) {
      const file = req.files.video[0];

      const result = await uploadToCloudinary(file, "video");

      uploadedAssets.push({
        publicId: result.public_id,
        resourceType: "video",
      });

      previousVideo = shop.video || null;
      shop.video = result.secure_url;
    }

    // -----------------------------------------------
    // IMAGES UPLOAD
    // -----------------------------------------------

    let previousImages = [];

    if (req.files?.images?.length) {
      const results = await Promise.all(
        req.files.images.map((file) =>
          uploadToCloudinary(file, "image")
        )
      );

      results.forEach((result) => {
        uploadedAssets.push({
          publicId: result.public_id,
          resourceType: "image",
        });
      });

      const newImages = results.map(
        (result) => result.secure_url
      );

      shop.images = [
        ...(shop.images || []),
        ...newImages,
      ];
    }

    await shop.save();

    // Delete old video only after database save succeeds
    if (previousVideo) {
      try {
        await deleteMedia(previousVideo, "video");
      } catch (error) {
        console.error("Old video cleanup error:", error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop,
    });
  } catch (error) {
    console.error("Update Shop Error:", error);

    // Clean up new Cloudinary uploads if the update fails
    await Promise.allSettled(
      uploadedAssets.map((asset) =>
        cloudinary.uploader.destroy(asset.publicId, {
          resource_type: asset.resourceType,
          invalidate: true,
        })
      )
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update shop",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE IMAGE
// =====================================================

const deleteShopImage = async (req, res) => {
  try {
    const { image } = req.body || {};

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const shop = await Shop.findOne();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    if (!(shop.images || []).includes(image)) {
      return res.status(404).json({
        success: false,
        message: "Image not found in this shop",
      });
    }

    await deleteMedia(image, "image");

    shop.images = shop.images.filter(
      (item) => item !== image
    );

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      images: shop.images,
    });
  } catch (error) {
    console.error("Delete Image Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE VIDEO
// =====================================================

const deleteShopVideo = async (req, res) => {
  try {
    const shop = await Shop.findOne();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    if (shop.video) {
      await deleteMedia(shop.video, "video");
    }

    shop.video = "";

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Delete Video Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getShop,
  getAdminShop,
  updateShop,
  deleteShopImage,
  deleteShopVideo,
};
