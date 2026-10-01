const jwt = require("jsonwebtoken");

const Admin = require("../model/Admin");
const AdminLoginActivity = require("../model/AdminLoginActivity");

// =====================================================
// ADMIN AUTH MIDDLEWARE
// =====================================================

const adminAuthMiddleware = async (req, res, next) => {
  try {
    // =====================================================
    // 1. CHECK AUTHORIZATION HEADER
    // =====================================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    // =====================================================
    // 2. CHECK BEARER FORMAT
    // =====================================================

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // =====================================================
    // 3. GET TOKEN
    // =====================================================

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    // =====================================================
    // 4. CHECK JWT SECRET
    // =====================================================

    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is missing in .env");

      return res.status(500).json({
        success: false,
        message: "JWT configuration error",
      });
    }

    // =====================================================
    // 5. VERIFY JWT
    // =====================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    // =====================================================
    // 6. CHECK ADMIN ID
    // =====================================================

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token",
      });
    }

    // =====================================================
    // 7. CHECK SESSION ID
    // =====================================================

    if (!decoded.sessionId) {
      return res.status(401).json({
        success: false,
        sessionExpired: true,
        message:
          "Admin session is no longer valid. Please login again.",
      });
    }

    // =====================================================
    // 8. FIND ADMIN
    // =====================================================

    const admin = await Admin.findById(decoded.id).select(
      "-password"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    // =====================================================
    // 9. CHECK ADMIN ACTIVE
    // =====================================================

    if (admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Admin account is disabled",
      });
    }

    // =====================================================
    // 10. FIND CURRENT DEVICE SESSION
    // =====================================================

    const session = await AdminLoginActivity.findOne({
      admin: admin._id,
      sessionId: decoded.sessionId,
      success: true,
    });

    // =====================================================
    // 11. SESSION NOT FOUND
    // =====================================================

    if (!session) {
      return res.status(401).json({
        success: false,
        sessionRevoked: true,
        message:
          "This admin device session no longer exists. Please login again.",
      });
    }

    // =====================================================
    // 12. CHECK BLOCKED DEVICE
    // =====================================================

    if (session.isBlocked === true) {
      return res.status(403).json({
        success: false,
        deviceBlocked: true,
        message:
          "This device has been blocked by the administrator.",
      });
    }

    // =====================================================
    // 13. CHECK SESSION ACTIVE
    // =====================================================

    if (
      session.isActive !== true ||
      session.status !== "Active"
    ) {
      return res.status(401).json({
        success: false,
        sessionRevoked: true,
        message:
          "This admin device session has been logged out. Please login again.",
      });
    }

    // =====================================================
    // 14. UPDATE LAST ACTIVE
    // =====================================================

    const now = Date.now();

    const lastActive = session.lastActive
      ? new Date(session.lastActive).getTime()
      : 0;

    const oneMinute = 60 * 1000;

    if (
      !lastActive ||
      now - lastActive > oneMinute
    ) {
      session.lastActive = new Date();

      await session.save();
    }

    // =====================================================
    // 15. ATTACH ADMIN TO REQUEST
    // =====================================================

    req.admin = {
      ...admin.toObject(),
      sessionId: decoded.sessionId,
    };

    // =====================================================
    // 16. ATTACH FULL SESSION
    // =====================================================

    req.adminSession = session;

    // =====================================================
    // 17. CONTINUE
    // =====================================================

    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);

    // =====================================================
    // TOKEN EXPIRED
    // =====================================================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        tokenExpired: true,
        message:
          "Admin session expired. Please login again.",
      });
    }

    // =====================================================
    // INVALID TOKEN
    // =====================================================

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        invalidToken: true,
        message: "Invalid admin token",
      });
    }

    // =====================================================
    // GENERAL ERROR
    // =====================================================

    return res.status(500).json({
      success: false,
      message: "Admin authentication failed",
      error: error.message,
    });
  }
};

module.exports = adminAuthMiddleware;