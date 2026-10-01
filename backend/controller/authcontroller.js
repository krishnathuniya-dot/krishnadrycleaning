const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const {
  notifyAllAdmins,
} = require("./notificationController");

const {
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
} = require("../config/usermailer");

// =====================================================
// SIGNUP
// =====================================================

const signup = async (req, res) => {
  try {
    const { fullName, mobile, email, password } = req.body;

    if (!fullName || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      mobile,
      email: cleanEmail,
      password: hashedPassword,
      provider: "local",
    });

    // SEND WELCOME EMAIL
    try {
      if (user.emailNotifications !== false) {
        await sendWelcomeEmail({
          email: user.email,
          name: user.fullName,
        });
      }
    } catch (mailError) {
      console.log("Welcome Email Error:", mailError);
    }

    // NOTIFY ALL ADMINS
    try {
      await notifyAllAdmins({
        sender: user._id,
        type: "user_registered",
        title: "New User Registered",
        message: `${user.fullName} has created a new account.`,
        link: "/admin/users",
        data: {
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          registeredAt: new Date(),
        },
      });
    } catch (notifyError) {
      console.log("Notify Admin Error:", notifyError);
    }

    // CREATE TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profileImage || "",
        provider: user.provider,
        lastLogin: user.lastLogin || null,
      },
    });
  } catch (error) {
    console.log("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during signup",
      error: error.message,
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Google user hai — password nahi hai
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account uses Google login. Please sign in with Google.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // SAVE LAST LOGIN
    user.lastLogin = new Date();
    await user.save();

    // NOTIFY ALL ADMINS
    try {
      await notifyAllAdmins({
        sender: user._id,
        type: "user_login",
        title: "New User Login",
        message: `${user.fullName} has logged in successfully.`,
        link: "/admin/users",
        data: {
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          loginAt: user.lastLogin,
        },
      });
    } catch (notifyError) {
      console.log("Notify Admin Error:", notifyError);
    }

    // CREATE TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profileImage || "",
        provider: user.provider,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// =====================================================
// GOOGLE LOGIN
// =====================================================

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential missing",
      });
    }

    // =================================================
    // VERIFY GOOGLE TOKEN
    // =================================================

    const googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID
    );

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.log("Google Token Verify Error:", verifyError);
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
      });
    }

    const payload = ticket.getPayload();

    const {
      email,
      name,
      picture,
      sub: googleId,
    } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found in Google account",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // =================================================
    // FIND OR CREATE USER
    // =================================================

    let user = await User.findOne({ email: cleanEmail });
    let isNewUser = false;

    if (!user) {
      // =============================================
      // NEW USER — Google se register
      // =============================================

      user = await User.create({
        fullName: name || "Google User",
        email: cleanEmail,
        mobile: "",
        password: null,
        profileImage: picture || "",
        googleId: googleId,
        provider: "google",
        emailNotifications: true,
      });

      isNewUser = true;

      // WELCOME EMAIL
      try {
        if (user.emailNotifications !== false) {
          await sendWelcomeEmail({
            email: user.email,
            name: user.fullName,
          });
        }
      } catch (mailError) {
        console.log("Welcome Email Error:", mailError);
      }

      // NOTIFY ADMINS
      try {
        await notifyAllAdmins({
          sender: user._id,
          type: "user_registered",
          title: "New User Registered (Google)",
          message: `${user.fullName} has registered via Google.`,
          link: "/admin/users",
          data: {
            userId: user._id,
            fullName: user.fullName,
            email: user.email,
            provider: "google",
            registeredAt: new Date(),
          },
        });
      } catch (notifyError) {
        console.log("Notify Admin Error:", notifyError);
      }
    } else {
      // =============================================
      // EXISTING USER — Google account link
      // =============================================

      let updated = false;

      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
        
      }

      if (!user.profileImage && picture) {
        user.profileImage = picture;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    // =================================================
    // SAVE LAST LOGIN
    // =================================================

    user.lastLogin = new Date();
    await user.save();

    // =================================================
    // NOTIFY ADMINS — LOGIN
    // =================================================

    try {
      await notifyAllAdmins({
        sender: user._id,
        type: "user_login",
        title: "New User Login (Google)",
        message: `${user.fullName} logged in via Google.`,
        link: "/admin/users",
        data: {
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          provider: "google",
          loginAt: user.lastLogin,
        },
      });
    } catch (notifyError) {
      console.log("Notify Admin Error:", notifyError);
    }

    // =================================================
    // CREATE JWT TOKEN
    // =================================================

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    // =================================================
    // CHECK IF MOBILE NEEDED
    // =================================================

    const needsMobile =
      !user.mobile || user.mobile.trim() === "";

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: isNewUser
        ? "Account created via Google successfully"
        : "Google login successful",
      token,
      needsMobile, // ← YE ADD HUA HAI
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profileImage || "",
        provider: user.provider || "google",
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.log("Google Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during Google login",
      error: error.message,
    });
  }
};

// =====================================================
// COMPLETE PROFILE (Save Mobile After Google Login)
// =====================================================

const completeProfile = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check — koi aur user is mobile se registered to nahi
    const mobileExists = await User.findOne({
      mobile: mobile,
      _id: { $ne: user._id },
    });

    if (mobileExists) {
      return res.status(409).json({
        success: false,
        message:
          "This mobile number is already registered with another account",
      });
    }

    user.mobile = mobile;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Mobile number saved successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profileImage || "",
        provider: user.provider || "google",
      },
    });
  } catch (error) {
    console.log("Complete Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving mobile number",
      error: error.message,
    });
  }
};

// =====================================================
// GET PROFILE
// =====================================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const { fullName, mobile, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Mobile optional hai Google users ke liye
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const emailExists = await User.findOne({
      email: cleanEmail,
      _id: { $ne: user._id },
    });

    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email already used by another account",
      });
    }

    user.fullName = fullName.trim();
    user.mobile = mobile || user.mobile || "";
    user.email = cleanEmail;

    // PROFILE IMAGE
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profileImage || "",
        lastLogin: user.lastLogin || null,
      },
    });
  } catch (error) {
    console.log("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

// =====================================================
// GET SETTINGS
// =====================================================

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select(
      "fullName mobile email profileImage emailNotifications smsNotifications language darkMode"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      settings: {
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profileImage || "",
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        language: user.language,
        darkMode: user.darkMode,
      },
    });
  } catch (error) {
    console.log("Get Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while getting settings",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE SETTINGS
// =====================================================

const updateSettings = async (req, res) => {
  try {
    const {
      emailNotifications,
      smsNotifications,
      language,
      darkMode,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (typeof emailNotifications === "boolean") {
      user.emailNotifications = emailNotifications;
    }

    if (typeof smsNotifications === "boolean") {
      user.smsNotifications = smsNotifications;
    }

    if (language) {
      if (!["English", "Hindi"].includes(language)) {
        return res.status(400).json({
          success: false,
          message: "Language must be English or Hindi",
        });
      }

      user.language = language;
    }

    if (typeof darkMode === "boolean") {
      user.darkMode = darkMode;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        language: user.language,
        darkMode: user.darkMode,
      },
    });
  } catch (error) {
    console.log("Update Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating settings",
      error: error.message,
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Google user — password nahi hai
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google login. Password change is not available.",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // PASSWORD CHANGED EMAIL
    try {
      if (user.emailNotifications !== false) {
        await sendPasswordChangedEmail({
          email: user.email,
          name: user.fullName,
        });
      }
    } catch (mailError) {
      console.log("Password Changed Email Error:", mailError);
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while changing password",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE ACCOUNT
// =====================================================

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log("Delete Account Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting account",
      error: error.message,
    });
  }
};

// =====================================================
// LOGOUT
// =====================================================

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// =====================================================
// GET ALL USERS
// =====================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      total: users.length,
      users,
    });
  } catch (error) {
    console.log("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while getting users",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE USER BY ADMIN
// =====================================================

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUserId: userId,
    });
  } catch (error) {
    console.log("Admin Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: error.message,
    });
  }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Google user — password reset nahi hoga
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google login. Please sign in with Google.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetExpire = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(resetExpire);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendResetPasswordEmail({
        email: user.email,
        name: user.fullName,
        resetUrl,
      });

      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (mailError) {
      console.log("Reset Email Error:", mailError);

      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message:
          "Unable to send password reset email. Please try again later.",
      });
    }
  } catch (error) {
    console.log("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset link.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter a new password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.log("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  signup,
  login,
  googleLogin,
  completeProfile, // ← YE ADD HUA HAI

  forgotPassword,
  resetPassword,

  getProfile,
  updateProfile,

  getSettings,
  updateSettings,

  changePassword,

  deleteAccount,

  getAllUsers,
  deleteUser,

  logout,
};