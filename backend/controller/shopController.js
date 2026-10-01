const Shop = require("../model/shop");
const fs = require("fs");
const path = require("path");


/* =====================================================
   GET PUBLIC SHOP
===================================================== */

const getShop = async (req, res) => {
  try {
    let shop = await Shop.findOne({
      isActive: true,
    }).lean();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop information not found",
      });
    }

    res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get Shop Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get shop information",
      error: error.message,
    });
  }
};


/* =====================================================
   GET ADMIN SHOP
===================================================== */

const getAdminShop = async (req, res) => {
  try {
    let shop = await Shop.findOne().lean();

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

    res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get Admin Shop Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load shop",
      error: error.message,
    });
  }
};


/* =====================================================
   UPDATE SHOP
===================================================== */

const updateShop = async (req, res) => {
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
    } = req.body;


    let shop = await Shop.findOne();

    if (!shop) {
      shop = new Shop();
    }


    if (shopName !== undefined)
      shop.shopName = shopName;

    if (tagline !== undefined)
      shop.tagline = tagline;

    if (description !== undefined)
      shop.description = description;

    if (phone !== undefined)
      shop.phone = phone;

    if (email !== undefined)
      shop.email = email;

    if (address !== undefined)
      shop.address = address;

    if (city !== undefined)
      shop.city = city;

    if (latitude !== undefined && latitude !== "")
      shop.latitude = Number(latitude);

    if (longitude !== undefined && longitude !== "")
      shop.longitude = Number(longitude);


    if (services !== undefined) {
      try {
        shop.services =
          typeof services === "string"
            ? JSON.parse(services)
            : services;
      } catch {
        shop.services = services
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }


    shop.openingHours = {
      monday:
        monday || shop.openingHours?.monday || "09:00 AM - 09:00 PM",

      tuesday:
        tuesday || shop.openingHours?.tuesday || "09:00 AM - 09:00 PM",

      wednesday:
        wednesday ||
        shop.openingHours?.wednesday ||
        "09:00 AM - 09:00 PM",

      thursday:
        thursday ||
        shop.openingHours?.thursday ||
        "09:00 AM - 09:00 PM",

      friday:
        friday || shop.openingHours?.friday || "09:00 AM - 09:00 PM",

      saturday:
        saturday ||
        shop.openingHours?.saturday ||
        "09:00 AM - 09:00 PM",

      sunday:
        sunday ||
        shop.openingHours?.sunday ||
        "09:00 AM - 09:00 PM",
    };


    if (isActive !== undefined) {
      shop.isActive =
        isActive === true ||
        isActive === "true";
    }


    /* =========================
       VIDEO
    ========================= */

    if (req.files?.video?.[0]) {
      const newVideo =
        `/uploads/shop/${req.files.video[0].filename}`;

      if (shop.video) {
        deleteFile(shop.video);
      }

      shop.video = newVideo;
    }


    /* =========================
       IMAGES
    ========================= */

    if (req.files?.images?.length) {
      const newImages =
        req.files.images.map(
          (file) =>
            `/uploads/shop/${file.filename}`
        );

      shop.images = [
        ...(shop.images || []),
        ...newImages,
      ];
    }


    await shop.save();


    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop,
    });

  } catch (error) {
    console.error("Update Shop Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update shop",
      error: error.message,
    });
  }
};


/* =====================================================
   DELETE IMAGE
===================================================== */

const deleteShopImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image path required",
      });
    }

    const shop = await Shop.findOne();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }


    shop.images = shop.images.filter(
      (item) => item !== image
    );

    deleteFile(image);

    await shop.save();


    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      images: shop.images,
    });

  } catch (error) {
    console.error("Delete Image Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};


/* =====================================================
   DELETE VIDEO
===================================================== */

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
      deleteFile(shop.video);
    }

    shop.video = "";

    await shop.save();


    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });

  } catch (error) {
    console.error("Delete Video Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error.message,
    });
  }
};


/* =====================================================
   DELETE FILE
===================================================== */

function deleteFile(fileUrl) {
  try {
    if (!fileUrl) return;

    const cleanPath = fileUrl.replace(
      /^\/uploads\//,
      ""
    );

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      cleanPath
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "File Delete Error:",
      error.message
    );
  }
}


module.exports = {
  getShop,
  getAdminShop,
  updateShop,
  deleteShopImage,
  deleteShopVideo,
};