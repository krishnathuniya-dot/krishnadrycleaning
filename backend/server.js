
const path = require("path");

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminSecurityRoutes = require("./routes/adminSecurityRoutes");
const rateCategoryRoutes = require("./routes/rateCategoryRoutes");
const rateListRoutes = require("./routes/rateListRoutes");
const shopRoutes = require("./routes/shopRoutes");

// =====================================================
// CLOUDINARY CONFIGURATION
// =====================================================

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================================================
// CHECK ENVIRONMENT VARIABLES
// =====================================================

console.log("JWT LOADED =", !!process.env.JWT_SECRET_KEY);
console.log("MONGO URI LOADED =", !!process.env.MONGO_URI);
console.log("SMTP USER LOADED =", !!process.env.SMTP_USER);
console.log("SMTP PASS LOADED =", !!process.env.SMTP_PASS);
console.log("GOOGLE CLIENT ID LOADED =", !!process.env.GOOGLE_CLIENT_ID);
console.log(
  "CLOUDINARY CONFIG LOADED =",
  !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
);

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// OLD UPLOADS SUPPORT
// Existing local images continue to work
// =====================================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =====================================================
// API ROUTES
// =====================================================

app.use("/api", authRoutes);
app.use("/api", reviewRoutes);
app.use("/api", adminRoutes);
app.use("/api", notificationRoutes);
app.use("/api", adminSecurityRoutes);
app.use("/api", rateCategoryRoutes);
app.use("/api", rateListRoutes);
app.use("/api/shop", shopRoutes);

// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Krishna Dry Cleaning API is running",
    cloudinaryConfigured: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("API ERROR:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal server error",
  });
});

// =====================================================
// MONGODB CONNECTION
// =====================================================

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI missing in backend/.env");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((error) => {
      console.error("MongoDB Error:", error.message);
    });
}

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 2340;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
