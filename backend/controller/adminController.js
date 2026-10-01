const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Admin = require("../model/Admin");
const AdminLoginActivity = require("../model/AdminLoginActivity");

const getDeviceInfo = require("../utils/getDeviceInfo");

// 👇 NAYA IMPORT
const {
  getLocationFromIp,
  normalizeIp,
} = require("../utils/geoLocation");

// =====================================================
// CREATE UNIQUE SESSION ID
// =====================================================

const createSessionId = () => {
  return crypto.randomBytes(32).toString("hex");
};

// =====================================================
// CREATE JWT TOKEN
// =====================================================

const createToken = (admin, sessionId) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is missing in .env");
  }

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      email: admin.email,
      sessionId,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================================
// GET CLIENT IP
// =====================================================

const getClientIP = (req) => {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.ip ||
    "";

  if (Array.isArray(ip)) {
    ip = ip[0];
  }

  if (typeof ip === "string") {
    ip = ip.split(",")[0].trim();
  }

  return normalizeIp(ip) || "Unknown";
};

// =====================================================
// DEVICE INFO
// =====================================================

const detectDeviceInfo = (userAgent) => {
  const defaultInfo = {
    deviceType: "Unknown",
    deviceName: "Unknown Device",
    browser: "Unknown",
    operatingSystem: "Unknown",
  };

  try {
    if (typeof getDeviceInfo === "function") {
      const result = getDeviceInfo(userAgent);

      if (result) {
        const allowedTypes = [
          "Desktop",
          "Mobile",
          "Tablet",
          "Unknown",
        ];

        return {
          deviceType: allowedTypes.includes(result.deviceType)
            ? result.deviceType
            : "Unknown",

          deviceName:
            result.deviceName || "Unknown Device",

          browser:
            result.browser || "Unknown",

          operatingSystem:
            result.operatingSystem || "Unknown",
        };
      }
    }
  } catch (error) {
    console.error(
      "DEVICE INFO ERROR:",
      error.message
    );
  }

  return defaultInfo;
};

// =====================================================
// GET ADMIN ID
// =====================================================

const getAdminId = (req) => {
  return req.admin?._id || req.admin?.id;
};

// =====================================================
// ADMIN SIGNUP
// =====================================================

const adminSignup = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      email,
      password,
      deviceId,
    } = req.body || {};

    if (
      !fullName ||
      !mobile ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, mobile, email and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      String(email)
        .toLowerCase()
        .trim();

    const existingAdmin =
      await Admin.findOne({
        email: normalizedEmail,
      });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "Admin with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        String(password),
        10
      );

    const admin =
      await Admin.create({
        fullName:
          String(fullName).trim(),

        mobile:
          String(mobile).trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        role:
          "admin",

        isActive:
          true,
      });

    const sessionId =
      createSessionId();

    const userAgent =
      req.headers["user-agent"] ||
      "Unknown";

    const deviceInfo =
      detectDeviceInfo(userAgent);

    const ipAddress =
      getClientIP(req);

    // 👇 LOCATION NIKALO
    const locationData =
      getLocationFromIp(ipAddress);

    const loginTime =
      new Date();

    const finalDeviceId =
      deviceId
        ? String(deviceId).trim()
        : crypto
            .createHash("sha256")
            .update(
              `${userAgent}|${ipAddress}|${admin._id}`
            )
            .digest("hex");

    let loginActivity;

    try {
      loginActivity =
        await AdminLoginActivity.create({
          admin:
            admin._id,

          adminEmail:
            admin.email,

          sessionId,

          deviceId:
            finalDeviceId,

          loginCount:
            1,

          lastLoginAt:
            loginTime,

          ipAddress:
            locationData.ipAddress,

          ipVersion:
            locationData.ipVersion,

          deviceType:
            deviceInfo.deviceType,

          deviceName:
            deviceInfo.deviceName,

          browser:
            deviceInfo.browser,

          operatingSystem:
            deviceInfo.operatingSystem,

          userAgent,

          country:
            locationData.country,

          countryCode:
            locationData.countryCode,

          region:
            locationData.region,

          city:
            locationData.city,

          loginAt:
            loginTime,

          lastActive:
            loginTime,

          logoutAt:
            null,

          isActive:
            true,

          isBlocked:
            false,

          blockedAt:
            null,

          status:
            "Active",

          success:
            true,
        });
    } catch (activityError) {
      console.error(
        "SIGNUP ACTIVITY ERROR:",
        activityError
      );

      await Admin.findByIdAndDelete(
        admin._id
      );

      return res.status(500).json({
        success: false,
        message:
          "Admin account could not create secure session",
      });
    }

    const token =
      createToken(
        admin,
        sessionId
      );

    const adminData =
      admin.toObject();

    delete adminData.password;

    return res.status(201).json({
      success: true,

      message:
        "Admin account created successfully",

      token,

      sessionId,

      admin:
        adminData,

      user:
        adminData,

      loginActivity: {
        id:
          loginActivity._id,

        sessionId:
          loginActivity.sessionId,

        deviceId:
          loginActivity.deviceId,

        loginCount:
          loginActivity.loginCount,

        loginAt:
          loginActivity.loginAt,

        lastLoginAt:
          loginActivity.lastLoginAt,

        lastActive:
          loginActivity.lastActive,

        ipAddress:
          loginActivity.ipAddress,

        ipVersion:
          loginActivity.ipVersion,

        country:
          loginActivity.country,

        countryCode:
          loginActivity.countryCode,

        region:
          loginActivity.region,

        city:
          loginActivity.city,

        deviceType:
          loginActivity.deviceType,

        deviceName:
          loginActivity.deviceName,

        browser:
          loginActivity.browser,

        operatingSystem:
          loginActivity.operatingSystem,

        isBlocked:
          loginActivity.isBlocked,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN SIGNUP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Admin signup failed",
      error:
        error.message,
    });
  }
};

// =====================================================
// ADMIN LOGIN
// =====================================================

const adminLogin = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body || {};

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message:
          "Device ID is required. Please refresh the page and try again.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const cleanDeviceId = String(deviceId).trim();

    if (!cleanDeviceId) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID",
      });
    }

    // -------------------------------------------------
    // FIND ADMIN
    // -------------------------------------------------

    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // CHECK ADMIN ACTIVE
    // -------------------------------------------------

    if (admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your admin account has been disabled",
      });
    }

    // -------------------------------------------------
    // CHECK PASSWORD
    // -------------------------------------------------

    if (!admin.password) {
      return res.status(500).json({
        success: false,
        message: "Admin password is not configured correctly",
      });
    }

    const passwordMatch = await bcrypt.compare(
      String(password),
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // DEVICE INFORMATION
    // -------------------------------------------------

    const userAgent =
      req.headers["user-agent"] || "Unknown";

    const deviceInfo = detectDeviceInfo(userAgent);

    const ipAddress = getClientIP(req);

    // 👇 LOCATION NIKALO
    const locationData = getLocationFromIp(ipAddress);

    const loginTime = new Date();

    // -------------------------------------------------
    // FIND EXISTING DEVICE
    // -------------------------------------------------

    const existingDevice =
      await AdminLoginActivity.findOne({
        admin: admin._id,
        deviceId: cleanDeviceId,
      });

    // -------------------------------------------------
    // CHECK BLOCKED DEVICE
    // -------------------------------------------------

    if (
      existingDevice &&
      existingDevice.isBlocked === true
    ) {
      return res.status(403).json({
        success: false,
        blocked: true,
        deviceBlocked: true,
        message:
          "This device has been blocked by the administrator. You cannot login from this device until it is unblocked.",
      });
    }

    // -------------------------------------------------
    // CREATE NEW SESSION
    // -------------------------------------------------

    const sessionId = createSessionId();

    // -------------------------------------------------
    // UPDATE ADMIN LAST LOGIN
    // -------------------------------------------------

    admin.lastLogin = loginTime;
    admin.lastLoginIP = ipAddress;
    admin.lastLoginDevice = deviceInfo.deviceName;
    admin.lastLoginDeviceType = deviceInfo.deviceType;
    admin.lastLoginBrowser = deviceInfo.browser;
    admin.lastLoginOS = deviceInfo.operatingSystem;

    await admin.save();

    let loginActivity;

    // =================================================
    // SAME DEVICE
    // =================================================

    if (existingDevice) {
      loginActivity =
        await AdminLoginActivity.findOneAndUpdate(
          {
            _id: existingDevice._id,
            admin: admin._id,
            deviceId: cleanDeviceId,
          },

          {
            $inc: {
              loginCount: 1,
            },

            $set: {
              sessionId: sessionId,

              adminEmail: admin.email,

              lastLoginAt: loginTime,

              loginAt: loginTime,

              lastActive: loginTime,

              logoutAt: null,

              isActive: true,

              status: "Active",

              success: true,

              ipAddress: locationData.ipAddress,

              ipVersion: locationData.ipVersion,

              deviceType: deviceInfo.deviceType,

              deviceName: deviceInfo.deviceName,

              browser: deviceInfo.browser,

              operatingSystem:
                deviceInfo.operatingSystem,

              userAgent: userAgent,

              country: locationData.country,

              countryCode: locationData.countryCode,

              region: locationData.region,

              city: locationData.city,
            },
          },

          {
            new: true,
            runValidators: true,
          }
        );
    }

    // =================================================
    // NEW DEVICE
    // =================================================

    else {
      try {
        loginActivity =
          await AdminLoginActivity.create({
            admin: admin._id,

            adminEmail: admin.email,

            sessionId: sessionId,

            deviceId: cleanDeviceId,

            loginCount: 1,

            lastLoginAt: loginTime,

            loginAt: loginTime,

            lastActive: loginTime,

            logoutAt: null,

            isActive: true,

            isBlocked: false,

            blockedAt: null,

            status: "Active",

            success: true,

            ipAddress: locationData.ipAddress,

            ipVersion: locationData.ipVersion,

            deviceType: deviceInfo.deviceType,

            deviceName: deviceInfo.deviceName,

            browser: deviceInfo.browser,

            operatingSystem:
              deviceInfo.operatingSystem,

            userAgent: userAgent,

            country: locationData.country,

            countryCode: locationData.countryCode,

            region: locationData.region,

            city: locationData.city,
          });
      }

      // -------------------------------------------------
      // RACE CONDITION
      // -------------------------------------------------

      catch (activityError) {
        if (
          activityError &&
          activityError.code === 11000
        ) {
          loginActivity =
            await AdminLoginActivity.findOneAndUpdate(
              {
                admin: admin._id,
                deviceId: cleanDeviceId,
              },

              {
                $inc: {
                  loginCount: 1,
                },

                $set: {
                  sessionId: sessionId,

                  adminEmail: admin.email,

                  lastLoginAt: loginTime,

                  loginAt: loginTime,

                  lastActive: loginTime,

                  logoutAt: null,

                  isActive: true,

                  status: "Active",

                  success: true,

                  ipAddress: locationData.ipAddress,

                  ipVersion: locationData.ipVersion,

                  deviceType:
                    deviceInfo.deviceType,

                  deviceName:
                    deviceInfo.deviceName,

                  browser:
                    deviceInfo.browser,

                  operatingSystem:
                    deviceInfo.operatingSystem,

                  userAgent: userAgent,

                  country: locationData.country,

                  countryCode: locationData.countryCode,

                  region: locationData.region,

                  city: locationData.city,
                },
              },

              {
                new: true,
                runValidators: true,
              }
            );
        } else {
          throw activityError;
        }
      }
    }

    // -------------------------------------------------
    // CHECK ACTIVITY
    // -------------------------------------------------

    if (!loginActivity) {
      return res.status(500).json({
        success: false,
        message:
          "Login activity could not be created",
      });
    }

    // -------------------------------------------------
    // CREATE JWT TOKEN
    // -------------------------------------------------

    const token = createToken(
      admin,
      loginActivity.sessionId
    );

    // -------------------------------------------------
    // REMOVE PASSWORD FROM RESPONSE
    // -------------------------------------------------

    const adminData = admin.toObject();

    delete adminData.password;

    // -------------------------------------------------
    // SUCCESS RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Admin login successful",

      token: token,

      sessionId: loginActivity.sessionId,

      admin: adminData,

      user: adminData,

      loginActivity: {
        id: loginActivity._id,

        sessionId:
          loginActivity.sessionId,

        deviceId:
          loginActivity.deviceId,

        loginCount:
          loginActivity.loginCount,

        loginAt:
          loginActivity.loginAt,

        lastLoginAt:
          loginActivity.lastLoginAt,

        lastActive:
          loginActivity.lastActive,

        ipAddress:
          loginActivity.ipAddress,

        ipVersion:
          loginActivity.ipVersion,

        country:
          loginActivity.country,

        countryCode:
          loginActivity.countryCode,

        region:
          loginActivity.region,

        city:
          loginActivity.city,

        deviceType:
          loginActivity.deviceType,

        deviceName:
          loginActivity.deviceName,

        browser:
          loginActivity.browser,

        operatingSystem:
          loginActivity.operatingSystem,

        isBlocked:
          loginActivity.isBlocked,

        isActive:
          loginActivity.isActive,

        status:
          loginActivity.status,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
};

// =====================================================
// GET ADMIN PROFILE
// =====================================================

const getAdminProfile = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const admin = await Admin.findById(adminId).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
      user: admin,
    });
  } catch (error) {
    console.error(
      "GET ADMIN PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get admin profile",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ADMIN PROFILE
// =====================================================

const updateAdminProfile = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const {
      fullName,
      email,
      mobile,
      emailNotifications,
      smsNotifications,
      language,
      darkMode,
    } = req.body || {};

    if (fullName !== undefined) {
      admin.fullName = String(fullName).trim();
    }

    if (mobile !== undefined) {
      admin.mobile = String(mobile).trim();
    }

    if (email !== undefined) {
      const normalizedEmail = String(email)
        .toLowerCase()
        .trim();

      const existingAdmin = await Admin.findOne({
        email: normalizedEmail,
        _id: { $ne: adminId },
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message:
            "Email is already used by another admin",
        });
      }

      admin.email = normalizedEmail;
    }

    if (emailNotifications !== undefined) {
      admin.emailNotifications = Boolean(
        emailNotifications
      );
    }

    if (smsNotifications !== undefined) {
      admin.smsNotifications = Boolean(
        smsNotifications
      );
    }

    if (language !== undefined) {
      admin.language = language;
    }

    if (darkMode !== undefined) {
      admin.darkMode = Boolean(darkMode);
    }

    await admin.save();

    const adminData = admin.toObject();

    delete adminData.password;

    return res.status(200).json({
      success: true,

      message: "Admin profile updated successfully",

      admin: adminData,

      user: adminData,
    });
  } catch (error) {
    console.error(
      "UPDATE ADMIN PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update admin profile",
      error: error.message,
    });
  }
};

// =====================================================
// UPLOAD ADMIN PROFILE IMAGE
// =====================================================

const uploadAdminProfileImage = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.profileImage = `/uploads/${req.file.filename}`;

    await admin.save();

    const adminData = admin.toObject();

    delete adminData.password;

    return res.status(200).json({
      success: true,

      message: "Profile image uploaded successfully",

      profileImage: admin.profileImage,

      admin: adminData,
    });
  } catch (error) {
    console.error(
      "UPLOAD ADMIN PROFILE IMAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
      error: error.message,
    });
  }
};

// =====================================================
// CHANGE ADMIN PASSWORD
// =====================================================

const changeAdminPassword = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const { currentPassword, newPassword } =
      req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const passwordMatch = await bcrypt.compare(
      String(currentPassword),
      admin.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    admin.password = await bcrypt.hash(
      String(newPassword),
      10
    );

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "CHANGE ADMIN PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE ADMIN ACCOUNT
// =====================================================

const deleteAdminAccount = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await AdminLoginActivity.deleteMany({
      admin: adminId,
    });

    await Admin.findByIdAndDelete(adminId);

    return res.status(200).json({
      success: true,
      message: "Admin account deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ADMIN ACCOUNT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete admin account",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN LOGOUT - CURRENT DEVICE
// =====================================================

const adminLogout = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const sessionId = req.admin?.sessionId;

    if (!adminId || !sessionId) {
      return res.status(401).json({
        success: false,
        message: "Admin session not found",
      });
    }

    const activity = await AdminLoginActivity.findOne({
      admin: adminId,
      sessionId: sessionId,
      isActive: true,
      status: "Active",
      success: true,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Active admin session not found",
      });
    }

    activity.isActive = false;
    activity.status = "Logged Out";
    activity.logoutAt = new Date();
    activity.lastActive = new Date();

    await activity.save();

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
      sessionId,
    });
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Admin logout failed",
      error: error.message,
    });
  }
};

// =====================================================
// GET LOGIN ACTIVITY
// =====================================================

const getAdminLoginActivity = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const activities = await AdminLoginActivity.find({
      admin: adminId,
    })
      .sort({
        lastLoginAt: -1,
        loginAt: -1,
      })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
      data: activities,
    });
  } catch (error) {
    console.error(
      "GET ADMIN LOGIN ACTIVITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get login activity",
      error: error.message,
    });
  }
};

// =====================================================
// GET ACTIVE ADMIN SESSIONS
// =====================================================

const getActiveAdminSessions = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const currentSessionId = req.admin?.sessionId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const sessions = await AdminLoginActivity.find({
      admin: adminId,
      isActive: true,
      status: "Active",
      success: true,
      isBlocked: false,
    })
      .sort({
        lastActive: -1,
      })
      .lean();

    const formattedSessions = sessions.map((session) => ({
      ...session,
      isCurrent:
        session.sessionId === currentSessionId,
    }));

    return res.status(200).json({
      success: true,
      count: formattedSessions.length,
      sessions: formattedSessions,
      data: formattedSessions,
    });
  } catch (error) {
    console.error(
      "GET ACTIVE ADMIN SESSIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get active sessions",
      error: error.message,
    });
  }
};

// =====================================================
// LOGOUT ADMIN DEVICE BY SESSION ID
// =====================================================

const logoutAdminDevice = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const currentSessionId = req.admin?.sessionId;

    const targetSessionId = req.params.sessionId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    if (!targetSessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    if (targetSessionId === currentSessionId) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove your current device here. Use Logout instead.",
      });
    }

    const activity = await AdminLoginActivity.findOne({
      admin: adminId,
      sessionId: targetSessionId,
      isActive: true,
      status: "Active",
      success: true,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Active device session not found",
      });
    }

    activity.isActive = false;
    activity.status = "Logged Out";
    activity.logoutAt = new Date();
    activity.lastActive = new Date();

    await activity.save();

    return res.status(200).json({
      success: true,
      message: "Device logged out successfully",
      sessionId: targetSessionId,
    });
  } catch (error) {
    console.error(
      "LOGOUT ADMIN DEVICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to logout device",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL SECURITY ACTIVITIES
// =====================================================

const getAdminSecurityActivities = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const activities = await AdminLoginActivity.find({
      admin: adminId,
    })
      .sort({
        lastLoginAt: -1,
        loginAt: -1,
      })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
      data: activities,
    });
  } catch (error) {
    console.error(
      "GET SECURITY ACTIVITIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get security activities",
      error: error.message,
    });
  }
};

// =====================================================
// LOGOUT PARTICULAR SECURITY SESSION
// =====================================================

const logoutAdminSecuritySession = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const activityId = req.params.id;

    const currentSessionId = req.admin?.sessionId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "Security activity ID is required",
      });
    }

    const activity = await AdminLoginActivity.findOne({
      _id: activityId,
      admin: adminId,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Security activity not found",
      });
    }

    if (activity.sessionId === currentSessionId) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot logout your current device from this button. Use Logout instead.",
      });
    }

    activity.isActive = false;
    activity.status = "Logged Out";
    activity.logoutAt = new Date();
    activity.lastActive = new Date();

    await activity.save();

    return res.status(200).json({
      success: true,
      message: "Device session logged out successfully",
      data: activity,
    });
  } catch (error) {
    console.error(
      "LOGOUT SECURITY SESSION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to logout device session",
      error: error.message,
    });
  }
};

// =====================================================
// BLOCK DEVICE
// =====================================================

const blockAdminDevice = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const activityId = req.params.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "Security activity ID is required",
      });
    }

    const activity = await AdminLoginActivity.findOne({
      _id: activityId,
      admin: adminId,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Security activity not found",
      });
    }

    activity.isBlocked = true;
    activity.blockedAt = new Date();
    activity.isActive = false;
    activity.status = "Logged Out";
    activity.logoutAt = new Date();
    activity.lastActive = new Date();

    await activity.save();

    console.log(
      "ADMIN DEVICE BLOCKED:",
      activity.deviceId
    );

    return res.status(200).json({
      success: true,
      message: "Device blocked successfully",
      data: activity,
    });
  } catch (error) {
    console.error(
      "BLOCK ADMIN DEVICE ERROR:",
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
// UNBLOCK DEVICE
// =====================================================

const unblockAdminDevice = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const activityId = req.params.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "Security activity ID is required",
      });
    }

    const activity = await AdminLoginActivity.findOne({
      _id: activityId,
      admin: adminId,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Security activity not found",
      });
    }

    activity.isBlocked = false;
    activity.blockedAt = null;
    activity.isActive = false;
    activity.status = "Logged Out";
    activity.logoutAt =
      activity.logoutAt || new Date();

    await activity.save();

    return res.status(200).json({
      success: true,
      message:
        "Device unblocked successfully. It can login again.",
      data: activity,
    });
  } catch (error) {
    console.error(
      "UNBLOCK ADMIN DEVICE ERROR:",
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
// GET BLOCKED DEVICES
// =====================================================

const getBlockedAdminDevices = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const devices = await AdminLoginActivity.find({
      admin: adminId,
      isBlocked: true,
    })
      .sort({
        blockedAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: devices.length,
      devices,
      data: devices,
    });
  } catch (error) {
    console.error(
      "GET BLOCKED DEVICES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get blocked devices",
      error: error.message,
    });
  }
};

// =====================================================
// SECURITY SUMMARY
// =====================================================

const getSecuritySummary = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const totalDevices =
      await AdminLoginActivity.countDocuments({
        admin: adminId,
      });

    const activeDevices =
      await AdminLoginActivity.countDocuments({
        admin: adminId,
        isActive: true,
        status: "Active",
        success: true,
        isBlocked: false,
      });

    const blockedDevices =
      await AdminLoginActivity.countDocuments({
        admin: adminId,
        isBlocked: true,
      });

    const loggedOutDevices =
      await AdminLoginActivity.countDocuments({
        admin: adminId,
        status: "Logged Out",
      });

    const successfulLogins =
      await AdminLoginActivity.aggregate([
        {
          $match: {
            admin: adminId,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$loginCount",
            },
          },
        },
      ]);

    const totalLogins = successfulLogins.length
      ? successfulLogins[0].total
      : 0;

    const deviceTypes =
      await AdminLoginActivity.aggregate([
        {
          $match: {
            admin: adminId,
          },
        },
        {
          $group: {
            _id: "$deviceType",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);

    return res.status(200).json({
      success: true,
      summary: {
        totalDevices,
        activeDevices,
        blockedDevices,
        loggedOutDevices,
        totalLogins,
        deviceTypes,
      },
      data: {
        totalDevices,
        activeDevices,
        blockedDevices,
        loggedOutDevices,
        totalLogins,
        deviceTypes,
      },
    });
  } catch (error) {
    console.error(
      "SECURITY SUMMARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get security summary",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE SECURITY ACTIVITY
// =====================================================

const getSingleSecurityActivity = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const activityId = req.params.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const activity = await AdminLoginActivity.findOne({
      _id: activityId,
      admin: adminId,
    }).lean();

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Security activity not found",
      });
    }

    return res.status(200).json({
      success: true,
      activity,
      data: activity,
    });
  } catch (error) {
    console.error(
      "GET SINGLE SECURITY ACTIVITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get security activity",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE SECURITY ACTIVITY
// =====================================================

const deleteSecurityActivity = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const activityId = req.params.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const activity = await AdminLoginActivity.findOne({
      _id: activityId,
      admin: adminId,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Security activity not found",
      });
    }

    await AdminLoginActivity.deleteOne({
      _id: activityId,
      admin: adminId,
    });

    return res.status(200).json({
      success: true,
      message: "Security activity deleted permanently",
      deletedId: activityId,
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
// LOGOUT ALL OTHER ADMIN SESSIONS
// =====================================================

const logoutAllAdminSessions = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const currentSessionId = req.admin?.sessionId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const result =
      await AdminLoginActivity.updateMany(
        {
          admin: adminId,
          isActive: true,
          isBlocked: false,
          status: "Active",
          success: true,
          sessionId: {
            $ne: currentSessionId,
          },
        },
        {
          $set: {
            isActive: false,
            status: "Logged Out",
            logoutAt: new Date(),
            lastActive: new Date(),
          },
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "All other admin devices have been logged out",
      loggedOutCount: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error(
      "LOGOUT ALL ADMIN SESSIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to logout all admin sessions",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getAdminDashboard = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();

    const activeAdmins = await Admin.countDocuments({
      isActive: true,
    });

    const inactiveAdmins = await Admin.countDocuments({
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      data: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT ALL CONTROLLERS
// =====================================================

module.exports = {
  // AUTH
  adminSignup,
  adminLogin,

  // PROFILE
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfileImage,

  // PASSWORD
  changeAdminPassword,

  // ACCOUNT
  deleteAdminAccount,

  // LOGOUT
  adminLogout,

  // DASHBOARD
  getAdminDashboard,

  // OLD ACTIVITY
  getAdminLoginActivity,
  getActiveAdminSessions,
  logoutAdminDevice,

  // NEW SECURITY
  getAdminSecurityActivities,
  logoutAdminSecuritySession,
  blockAdminDevice,
  unblockAdminDevice,
  getBlockedAdminDevices,
  getSecuritySummary,
  getSingleSecurityActivity,
  deleteSecurityActivity,
  logoutAllAdminSessions,
};