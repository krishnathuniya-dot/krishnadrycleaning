const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const adminAuth = require("../middleware/adminAuthMiddleware");

const {
  getShop,
  getAdminShop,
  updateShop,
  deleteShopImage,
  deleteShopVideo,
} = require("../controller/shopController");


/* =====================================================
   CREATE FOLDERS
===================================================== */

const shopFolder = path.join(
  __dirname,
  "..",
  "uploads",
  "shop"
);

if (!fs.existsSync(shopFolder)) {
  fs.mkdirSync(shopFolder, {
    recursive: true,
  });
}


/* =====================================================
   MULTER STORAGE
===================================================== */

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, shopFolder);
  },

  filename: function (req, file, cb) {

    const extension =
      path.extname(file.originalname);

    const name =
      path
        .basename(
          file.originalname,
          extension
        )
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();

    cb(
      null,
      `${name}-${Date.now()}${extension}`
    );
  },
});


/* =====================================================
   FILE FILTER
===================================================== */

const fileFilter = (req, file, cb) => {

  if (file.fieldname === "video") {

    const allowedVideos = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (
      allowedVideos.includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only MP4, WEBM, MOV or AVI videos allowed"
      )
    );
  }


  if (file.fieldname === "images") {

    const allowedImages = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedImages.includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only JPG, JPEG, PNG or WEBP images allowed"
      )
    );
  }


  cb(null, false);
};


/* =====================================================
   UPLOAD
===================================================== */

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize: 100 * 1024 * 1024,

  },

});


/* =====================================================
   PUBLIC
===================================================== */

router.get(
  "/",
  getShop
);


/* =====================================================
   ADMIN
===================================================== */

router.get(
  "/admin",
  adminAuth,
  getAdminShop
);


router.put(
  "/admin",
  adminAuth,

  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 10,
    },
  ]),

  updateShop
);


router.delete(
  "/admin/image",
  adminAuth,
  deleteShopImage
);


router.delete(
  "/admin/video",
  adminAuth,
  deleteShopVideo
);


/* =====================================================
   MULTER ERROR
===================================================== */

router.use(
  (error, req, res, next) => {

    if (
      error instanceof multer.MulterError
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  }
);


module.exports = router;