
const mongoose = require("mongoose");
const AdminLoginActivity = require("../model/AdminLoginActivity");

// =====================================================
// COMMON POPULATE
// =====================================================

const populateAdmin = (query) => {
  return query.populate(
    "admin",
    "fullName email mobile profileImage role"
  );
};

// =====================================================
// GET ALL ADMIN SECURITY ACTIVITIES
// Includes:
// Active + Logged Out + Blocked
// =====================================================

const getAdminSecurityActivities = async (req, res) => {
  try {
    const activities = await populateAdmin(
      AdminLoginActivity.find()
    )
      .sort({
        lastLoginAt: -1,
        loginAt: -1,
      })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      total: activities.length,
      activities,
    });
  } catch (error) {
    console.error(
      "GET SECURITY ACTIVITIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch security activities",
      error: error.message,
    });
  }
};

// =====================================================
// GET ACTIVE ADMIN SESSIONS
// =====================================================

const getActiveAdminSessions = async (req, res) => {
  try {
    const sessions = await populateAdmin(
      AdminLoginActivity.find({
        isActive: true,
        status: "Active",
        success: true,
        isBlocked: false,
      })
    )
      .sort({
        lastActive: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      total: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error(
      "GET ACTIVE SESSIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active sessions",
      error: error.message,
    });
  }
};

// =====================================================
// LOGOUT SINGLE ADMIN SESSION
// =====================================================

const logoutAdminSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }

    const activity =
      await AdminLoginActivity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // -----------------------------------------------
    // BLOCKED DEVICE
    // -----------------------------------------------

    if (activity.isBlocked) {
      return res.status(400).json({
        success: false,
        message:
          "This device is blocked. Use Unblock Device instead.",
      });
    }

    // -----------------------------------------------
    // ALREADY LOGGED OUT
    // -----------------------------------------------

    if (!activity.isActive) {
      return res.status(400).json({
        success: false,
        message: "This session is already logged out",
      });
    }

    // -----------------------------------------------
    // LOGOUT
    // -----------------------------------------------

    const now = new Date();

    activity.isActive = false;
    activity.status = "Logged Out";
    activity.logoutAt = now;
    activity.lastActive = now;

    await activity.save();

    return res.status(200).json({
      success: true,
      message: "Session logged out successfully",
      session: activity,
    });
  } catch (error) {
    console.error(
      "LOGOUT SESSION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to logout session",
      error: error.message,
    });
  }
};

// =====================================================
// BLOCK ADMIN DEVICE
//
// Block means:
// 1. Device is permanently marked blocked
// 2. Current session is logged out
// 3. Future login must be rejected by login controller
// =====================================================

const blockAdminDevice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }

    const activity =
      await AdminLoginActivity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Device activity not found",
      });
    }

    // -----------------------------------------------
    // ALREADY BLOCKED
    // -----------------------------------------------

    if (activity.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "This device is already blocked",
      });
    }

    const now = new Date();

    // -----------------------------------------------
    // BLOCK DEVICE
    // -----------------------------------------------

    activity.isBlocked = true;
    activity.blockedAt = now;

    // Current session logout
    activity.isActive = false;
    activity.status = "Logged Out";
    activity.logoutAt = now;
    activity.lastActive = now;

    await activity.save();

    return res.status(200).json({
      success: true,
      message:
        "Device blocked successfully. This device cannot login again.",
      activity,
    });
  } catch (error) {
    console.error(
      "BLOCK DEVICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to block device",
      error: error.message,
    });
  }
};

// =====================================================
// UNBLOCK ADMIN DEVICE
// =====================================================

const unblockAdminDevice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }

    const activity =
      await AdminLoginActivity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Device activity not found",
      });
    }

    // -----------------------------------------------
    // ALREADY UNBLOCKED
    // -----------------------------------------------

    if (!activity.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "This device is already unblocked",
      });
    }

    // -----------------------------------------------
    // UNBLOCK
    // -----------------------------------------------

    activity.isBlocked = false;
    activity.blockedAt = null;

    // Do not automatically login the device
    activity.isActive = false;
    activity.status = "Logged Out";

    await activity.save();

    return res.status(200).json({
      success: true,
      message:
        "Device unblocked successfully. It can login again.",
      activity,
    });
  } catch (error) {
    console.error(
      "UNBLOCK DEVICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to unblock device",
      error: error.message,
    });
  }
};

// =====================================================
// GET BLOCKED ADMIN DEVICES
// =====================================================

const getBlockedAdminDevices = async (req, res) => {
  try {
    const devices = await populateAdmin(
      AdminLoginActivity.find({
        isBlocked: true,
      })
    )
      .sort({
        blockedAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      total: devices.length,
      devices,
    });
  } catch (error) {
    console.error(
      "GET BLOCKED DEVICES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blocked devices",
      error: error.message,
    });
  }
};

// =====================================================
// SECURITY SUMMARY
// =====================================================

const getSecuritySummary = async (req, res) => {
  try {
    // -----------------------------------------------
    // TOTAL SUCCESSFUL DEVICE RECORDS
    // -----------------------------------------------

    const total =
      await AdminLoginActivity.countDocuments({
        success: true,
      });

    // -----------------------------------------------
    // ACTIVE
    // -----------------------------------------------

    const active =
      await AdminLoginActivity.countDocuments({
        success: true,
        isActive: true,
        status: "Active",
        isBlocked: false,
      });

    // -----------------------------------------------
    // LOGGED OUT
    // -----------------------------------------------

    const loggedOut =
      await AdminLoginActivity.countDocuments({
        success: true,
        status: "Logged Out",
        isBlocked: false,
      });

    // -----------------------------------------------
    // BLOCKED
    // -----------------------------------------------

    const blocked =
      await AdminLoginActivity.countDocuments({
        isBlocked: true,
      });

    // -----------------------------------------------
    // FAILED
    // -----------------------------------------------

    const failed =
      await AdminLoginActivity.countDocuments({
        success: false,
      });

    // -----------------------------------------------
    // DESKTOP
    // -----------------------------------------------

    const desktop =
      await AdminLoginActivity.countDocuments({
        success: true,
        deviceType: "Desktop",
      });

    // -----------------------------------------------
    // MOBILE
    // -----------------------------------------------

    const mobile =
      await AdminLoginActivity.countDocuments({
        success: true,
        deviceType: "Mobile",
      });

    // -----------------------------------------------
    // TABLET
    // -----------------------------------------------

    const tablet =
      await AdminLoginActivity.countDocuments({
        success: true,
        deviceType: "Tablet",
      });

    // -----------------------------------------------
    // UNKNOWN
    // -----------------------------------------------

    const unknown =
      await AdminLoginActivity.countDocuments({
        success: true,
        deviceType: "Unknown",
      });

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(200).json({
      success: true,

      summary: {
        total,
        active,
        loggedOut,
        blocked,
        failed,
        desktop,
        mobile,
        tablet,
        unknown,
      },
    });
  } catch (error) {
    console.error(
      "SECURITY SUMMARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch security summary",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE SECURITY ACTIVITY
// =====================================================

const getSingleSecurityActivity = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }

    const activity = await populateAdmin(
      AdminLoginActivity.findById(id)
    ).lean();

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    return res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error(
      "GET SINGLE SECURITY ACTIVITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE SECURITY ACTIVITY
// =====================================================

const deleteSecurityActivity = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }

    const activity =
      await AdminLoginActivity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    await AdminLoginActivity.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Security activity permanently deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error(
      "DELETE SECURITY ACTIVITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete security activity",
      error: error.message,
    });
  }
};

// =====================================================
// LOGOUT ALL ACTIVE SESSIONS
//
// Does NOT unblock devices.
// =====================================================

const logoutAllAdminSessions = async (
  req,
  res
) => {
  try {
    const now = new Date();

    const result =
      await AdminLoginActivity.updateMany(
        {
          isActive: true,
          status: "Active",
          success: true,
          isBlocked: false,
        },
        {
          $set: {
            isActive: false,
            status: "Logged Out",
            logoutAt: now,
            lastActive: now,
          },
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "All active sessions logged out successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "LOGOUT ALL SESSIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to logout all sessions",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getAdminSecurityActivities,
  getActiveAdminSessions,

  logoutAdminSession,

  blockAdminDevice,
  unblockAdminDevice,
  getBlockedAdminDevices,

  getSecuritySummary,

  getSingleSecurityActivity,

  deleteSecurityActivity,

  logoutAllAdminSessions,
};

