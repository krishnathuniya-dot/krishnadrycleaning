
const path = require("path");

// =====================================================
// 1. LOAD ENVIRONMENT VARIABLES FIRST
// =====================================================

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

// =====================================================
// 2. IMPORT CORE PACKAGES
// =====================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

// =====================================================
// 3. CONFIGURE CLOUDINARY BEFORE IMPORTING ROUTES
// =====================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Safe check: never print actual API credentials
console.log("Cloudinary environment check:", {
  cloud_name: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  api_key: Boolean(process.env.CLOUDINARY_API_KEY),
  api_secret: Boolean(process.env.CLOUDINARY_API_SECRET),
});

// =====================================================
// 4. OTHER ENVIRONMENT CHECKS
// =====================================================

console.log("JWT LOADED =", Boolean(process.env.JWT_SECRET_KEY));
console.log("MONGO URI LOADED =", Boolean(process.env.MONGO_URI));
console.log("SMTP USER LOADED =", Boolean(process.env.SMTP_USER));
console.log("SMTP PASS LOADED =", Boolean(process.env.SMTP_PASS));
console.log(
  "GOOGLE CLIENT ID LOADED =",
  Boolean(process.env.GOOGLE_CLIENT_ID)
);

// =====================================================
// 5. IMPORT ROUTES AFTER CONFIGURATION
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
// 6. INITIALIZE EXPRESS
// =====================================================

const app = express();

// =====================================================
// 7. MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// 8. OLD UPLOADS SUPPORT
// Existing local images continue to work
// =====================================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =====================================================
// 9. API ROUTES
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
// 10. HOME / HEALTH CHECK
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
// 11. GLOBAL ERROR HANDLER
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
// 12. MONGODB CONNECTION
// =====================================================

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI missing in environment variables");
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
// 13. START SERVER
// =====================================================

const PORT = process.env.PORT || 2340;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
