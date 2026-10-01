const path = require("path");

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

// =====================================================
// CHECK ENV
// =====================================================

console.log("JWT LOADED =", !!process.env.JWT_SECRET_KEY);
console.log("MONGO URI LOADED =", !!process.env.MONGO_URI);
console.log("SMTP USER LOADED =", !!process.env.SMTP_USER);
console.log("SMTP PASS LOADED =", !!process.env.SMTP_PASS);

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
// UPLOADS / PROFILE IMAGES
// =====================================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =====================================================
// ROUTES
// =====================================================

// AUTH
// Iske andar login, register,
// forgot-password aur reset-password bhi honge.
app.use("/api", authRoutes);

// REVIEWS
app.use("/api", reviewRoutes);

// ADMIN
app.use("/api", adminRoutes);

// NOTIFICATIONS
app.use("/api", notificationRoutes);

// ADMIN SECURITY
app.use("/api", adminSecurityRoutes);

// RATE CATEGORY
app.use("/api", rateCategoryRoutes);

// RATE LIST
app.use("/api", rateListRoutes);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Krishna Dry Cleaning API is running",
  });
});

// =====================================================
// MONGODB
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB Error:", error.message);
  });

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 2340;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});