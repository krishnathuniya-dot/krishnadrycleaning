import { useEffect, useState } from "react";
import "../css/AdminSettings.css";

const API_URL = "http://localhost:2340";

// =====================================================
// COUNTRY CODE -> FLAG EMOJI
// =====================================================

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return "";

  const code = String(countryCode)
    .trim()
    .toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return "";
  }

  return code
    .split("")
    .map((char) =>
      String.fromCodePoint(
        127397 + char.charCodeAt(0)
      )
    )
    .join("");
};

function AdminSettings() {
  // =====================================================
  // COMMON
  // =====================================================

  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // PROFILE
  // =====================================================

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    mobile: "",
  });

  const [profileImage, setProfileImage] = useState("");

  // =====================================================
  // PASSWORD
  // =====================================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
  });

  // =====================================================
  // PREFERENCES
  // =====================================================

  const [language, setLanguage] = useState("English");
  const [darkMode, setDarkMode] = useState(false);

  // =====================================================
  // SECURITY
  // =====================================================

  const [loginActivity, setLoginActivity] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [blockedDevices, setBlockedDevices] = useState([]);

  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securityAction, setSecurityAction] = useState("");

  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [showHiddenHistory, setShowHiddenHistory] = useState(false);

  const [hiddenLoginHistory, setHiddenLoginHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "adminHiddenLoginHistory"
      );

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  // =====================================================
  // ADMIN SESSION ID
  // =====================================================

  const getCurrentSessionId = () => {
    return (
      localStorage.getItem("adminSessionId") ||
      ""
    );
  };

  // =====================================================
  // ADMIN DEVICE ID
  // =====================================================

  const getAdminDeviceId = () => {
    return (
      localStorage.getItem("adminDeviceId") ||
      ""
    );
  };

  // =====================================================
  // HEADERS
  // =====================================================

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // =====================================================
  // CLEAR MESSAGES
  // =====================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
    setSecurityError("");
  };

  // =====================================================
  // CLEAR AUTH
  // =====================================================

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    localStorage.removeItem("admin");
    localStorage.removeItem("user");

    localStorage.removeItem("userId");
    localStorage.removeItem("adminSessionId");

    localStorage.removeItem("loginActivity");

    /*
      IMPORTANT:
      adminDeviceId intentionally NOT removed.
    */
  };

  // =====================================================
  // UNAUTHORIZED
  // =====================================================

  const handleUnauthorized = async (response) => {
    if (
      response.status !== 401 &&
      response.status !== 403
    ) {
      return false;
    }

    let data = {};

    try {
      data = await response.clone().json();
    } catch {
      data = {};
    }

    const shouldLogout =
      response.status === 401 ||
      response.status === 403 ||
      data.sessionRevoked ||
      data.sessionExpired ||
      data.invalidToken ||
      data.tokenExpired ||
      data.deviceBlocked;

    if (shouldLogout) {
      clearAuth();

      window.location.href = "/admin/login";

      return true;
    }

    return false;
  };

  // =====================================================
  // PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/profile`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (await handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load profile."
        );
      }

      const admin =
        data.admin ||
        data.user ||
        data.data;

      if (!admin) {
        throw new Error(
          "Admin profile not found."
        );
      }

      setUser(admin);

      setProfileData({
        fullName: admin.fullName || "",
        email: admin.email || "",
        mobile: admin.mobile || "",
      });

      setProfileImage(
        admin.profileImage || ""
      );

      setNotifications({
        emailNotifications:
          admin.emailNotifications !== false,

        smsNotifications:
          admin.smsNotifications !== false,
      });

      setLanguage(
        admin.language || "English"
      );

      setDarkMode(
        admin.darkMode === true
      );
    } catch (err) {
      console.error(
        "Profile Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SECURITY DATA
  // =====================================================

  const fetchSecurityData = async () => {
    try {
      setSecurityLoading(true);
      setSecurityError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const currentSessionId =
        getCurrentSessionId();

      const currentDeviceId =
        getAdminDeviceId();

      // =================================================
      // LOGIN ACTIVITY
      // =================================================

      const activityResponse = await fetch(
        `${API_URL}/api/admin/security/activities`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (
        await handleUnauthorized(
          activityResponse
        )
      ) {
        return;
      }

      const activityData =
        await activityResponse.json();

      if (!activityResponse.ok) {
        throw new Error(
          activityData.message ||
            "Unable to load login activity."
        );
      }

      const activities =
        activityData.activities ||
        activityData.data ||
        activityData.results ||
        [];

      const safeActivities =
        Array.isArray(activities)
          ? activities
          : [];

      setLoginActivity(
        safeActivities
      );

      // =================================================
      // ACTIVE SESSIONS
      // =================================================

      const sessionsResponse = await fetch(
        `${API_URL}/api/admin/security/active`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (
        await handleUnauthorized(
          sessionsResponse
        )
      ) {
        return;
      }

      const sessionsData =
        await sessionsResponse.json();

      if (!sessionsResponse.ok) {
        throw new Error(
          sessionsData.message ||
            "Unable to load active sessions."
        );
      }

      const sessions =
        sessionsData.sessions ||
        sessionsData.activities ||
        sessionsData.data ||
        [];

      const safeSessions =
        Array.isArray(sessions)
          ? sessions
          : [];

      const sessionsWithCurrent =
        safeSessions.map((session) => {
          const sessionMatches =
            currentSessionId &&
            session.sessionId &&
            String(session.sessionId) ===
              String(currentSessionId);

          const deviceMatches =
            currentDeviceId &&
            session.deviceId &&
            String(session.deviceId) ===
              String(currentDeviceId);

          return {
            ...session,
            isCurrent:
              session.isCurrent === true ||
              sessionMatches ||
              deviceMatches,
          };
        });

      setActiveSessions(
        sessionsWithCurrent
      );

      // =================================================
      // BLOCKED DEVICES
      // =================================================

      const blockedResponse = await fetch(
        `${API_URL}/api/admin/security/blocked`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (
        await handleUnauthorized(
          blockedResponse
        )
      ) {
        return;
      }

      const blockedData =
        await blockedResponse.json();

      if (!blockedResponse.ok) {
        throw new Error(
          blockedData.message ||
            "Unable to load blocked devices."
        );
      }

      const blocked =
        blockedData.devices ||
        blockedData.activities ||
        blockedData.data ||
        [];

      setBlockedDevices(
        Array.isArray(blocked)
          ? blocked
          : []
      );
    } catch (err) {
      console.error(
        "Security Error:",
        err
      );

      setSecurityError(
        err.message ||
          "Unable to load security information."
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // SECURITY TAB
  // =====================================================

  useEffect(() => {
    if (activeTab === "security") {
      fetchSecurityData();
    }
  }, [activeTab]);

  // =====================================================
  // PROFILE INPUT
  // =====================================================

  const handleProfileChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const updateProfile = async (e) => {
    e.preventDefault();

    clearMessages();

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/profile`,
        {
          method: "PUT",
          headers: getHeaders(),

          body: JSON.stringify({
            fullName:
              profileData.fullName.trim(),

            mobile:
              profileData.mobile.trim(),
          }),
        }
      );

      if (
        await handleUnauthorized(response)
      ) {
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update profile."
        );
      }

      const updatedAdmin =
        data.admin ||
        data.user ||
        data.data;

      if (updatedAdmin) {
        setUser(updatedAdmin);

        setProfileData({
          fullName:
            updatedAdmin.fullName ||
            "",

          email:
            updatedAdmin.email ||
            "",

          mobile:
            updatedAdmin.mobile ||
            "",
        });

        setProfileImage(
          updatedAdmin.profileImage ||
            ""
        );

        localStorage.setItem(
          "admin",
          JSON.stringify(
            updatedAdmin
          )
        );
      }

      setMessage(
        data.message ||
          "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Update Profile Error:",
        err
      );

      setError(
        err.message ||
          "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // IMAGE
  // =====================================================

  const handleImageChange = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    clearMessages();

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Please select a valid image."
      );

      e.target.value = "";
      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setError(
        "Image size should be less than 2MB."
      );

      e.target.value = "";
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "profileImage",
        file
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/profile/image`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${getToken()}`,
            },

            body: formData,
          }
        );

      if (
        await handleUnauthorized(
          response
        )
      ) {
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to upload image."
        );
      }

      const admin =
        data.admin ||
        data.user ||
        data.data;

      if (admin) {
        setUser(admin);

        setProfileImage(
          admin.profileImage ||
            ""
        );

        localStorage.setItem(
          "admin",
          JSON.stringify(admin)
        );

        if (
          admin.profileImage
        ) {
          localStorage.setItem(
            "profileImage",
            admin.profileImage
          );
        }
      }

      setMessage(
        data.message ||
          "Profile image updated successfully."
      );
    } catch (err) {
      console.error(
        "Image Upload Error:",
        err
      );

      setError(
        err.message ||
          "Unable to upload image."
      );
    } finally {
      setLoading(false);

      e.target.value = "";
    }
  };

  // =====================================================
  // PASSWORD
  // =====================================================

  const handlePasswordChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setPasswordData(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  const changePassword = async (e) => {
    e.preventDefault();

    clearMessages();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError(
        "Please fill all password fields."
      );

      return;
    }

    if (
      passwordData.newPassword.length <
      6
    ) {
      setError(
        "New password must contain at least 6 characters."
      );

      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/admin/change-password`,
          {
            method: "PUT",
            headers: getHeaders(),

            body: JSON.stringify({
              currentPassword:
                passwordData.currentPassword,

              newPassword:
                passwordData.newPassword,
            }),
          }
        );

      if (
        await handleUnauthorized(
          response
        )
      ) {
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change password."
        );
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        data.message ||
          "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Password Error:",
        err
      );

      setError(
        err.message ||
          "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SAVE PREFERENCES
  // =====================================================

  const savePreferences = async () => {
    clearMessages();

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/admin/profile`,
          {
            method: "PUT",
            headers: getHeaders(),

            body: JSON.stringify({
              emailNotifications:
                notifications.emailNotifications,

              smsNotifications:
                notifications.smsNotifications,

              language,
              darkMode,
            }),
          }
        );

      if (
        await handleUnauthorized(
          response
        )
      ) {
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save settings."
        );
      }

      const updatedAdmin =
        data.admin ||
        data.user ||
        data.data;

      if (updatedAdmin) {
        setUser(updatedAdmin);

        setNotifications({
          emailNotifications:
            updatedAdmin.emailNotifications !==
            false,

          smsNotifications:
            updatedAdmin.smsNotifications !==
            false,
        });

        setLanguage(
          updatedAdmin.language ||
            "English"
        );

        setDarkMode(
          updatedAdmin.darkMode === true
        );

        localStorage.setItem(
          "admin",
          JSON.stringify(
            updatedAdmin
          )
        );
      }

      setMessage(
        data.message ||
          "Settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Settings Error:",
        err
      );

      setError(
        err.message ||
          "Unable to save settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT DEVICE
  // =====================================================

  const logoutDevice = async (activityId) => {
    if (!activityId) {
      setError(
        "Invalid device activity."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to logout this device?"
      );

    if (!confirmed) return;

    try {
      setSecurityAction(
        `logout-${activityId}`
      );

      clearMessages();

      const response =
        await fetch(
          `${API_URL}/api/admin/security/${encodeURIComponent(
            activityId
          )}/logout`,
          {
            method: "PUT",
            headers: getHeaders(),
          }
        );

      if (
        await handleUnauthorized(
          response
        )
      ) {
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to logout device."
        );
      }

      setMessage(
        data.message ||
          "Device logged out successfully."
      );

      await fetchSecurityData();
    } catch (err) {
      console.error(
        "Logout Device Error:",
        err
      );

      setError(
        err.message ||
          "Unable to logout device."
      );
    } finally {
      setSecurityAction("");
    }
  };

  // =====================================================
  // BLOCK DEVICE
  // =====================================================

  const blockDevice = async (activity) => {
    if (!activity) return;

    const activityId =
      activity._id ||
      activity.id;

    if (!activityId) {
      setError(
        "Invalid device activity."
      );

      return;
    }

    if (
      isCurrentActivity(activity)
    ) {
      setError(
        "You cannot block your current device from this screen."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Block ${
          activity.deviceName ||
          "this device"
        }?\n\nThis will logout the device and prevent it from logging in again until you unblock it.`
      );

    if (!confirmed) return;

    try {
      setSecurityAction(
        `block-${activityId}`
      );

      clearMessages();

      const response =
        await fetch(
          `${API_URL}/api/admin/security/${encodeURIComponent(
            activityId
          )}/block`,
          {
            method: "PUT",
            headers: getHeaders(),
          }
        );

      if (
        await handleUnauthorized(
          response
        )
      ) {
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to block device."
        );
      }

      setMessage(
        data.message ||
          "Device blocked successfully."
      );

      await fetchSecurityData();
    } catch (err) {
      console.error(
        "Block Device Error:",
        err
      );

      setError(
        err.message ||
          "Unable to block device."
      );
    } finally {
      setSecurityAction("");
    }
  };

  // =====================================================
  // UNBLOCK DEVICE
  // =====================================================

  const unblockDevice = async (activity) => {
    if (!activity) return;

    const activityId =
      activity._id ||
      activity.id;

    if (!activityId) {
      setError(
        "Invalid blocked device."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Unblock ${
          activity.deviceName ||
          "this device"
        }?\n\nThis device will be allowed to login again.`
      );

    if (!confirmed) return;

    try {
      setSecurityAction(
        `unblock-${activityId}`
      );

      clearMessages();

      const response =
        await fetch(
          `${API_URL}/api/admin/security/${encodeURIComponent(
            activityId
          )}/unblock`,
          {
            method: "PUT",
            headers: getHeaders(),
          }
        );

      if (
        await handleUnauthorized(
          response
        )
      ) {
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to unblock device."
        );
      }

      setMessage(
        data.message ||
          "Device unblocked successfully."
      );

      await fetchSecurityData();
    } catch (err) {
      console.error(
        "Unblock Device Error:",
        err
      );

      setError(
        err.message ||
          "Unable to unblock device."
      );
    } finally {
      setSecurityAction("");
    }
  };

  // =====================================================
  // DELETE SECURITY ACTIVITY
  // =====================================================

  const deleteActivity = async (activity) => {
    if (!activity) return;

    const activityId =
      activity._id ||
      activity.id;

    if (!activityId) {
      setError(
        "Invalid activity."
      );

      return;
    }

    if (
      isCurrentActivity(activity)
    ) {
      setError(
        "Current device activity cannot be deleted."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete login activity for ${
          activity.deviceName ||
          "this device"
        }?\n\nThis permanently removes the security activity record.`
      );

    if (!confirmed) return;

    try {
      setSecurityAction(
        `delete-${activityId}`
      );

      clearMessages();

      const response =
        await fetch(
          `${API_URL}/api/admin/security/${encodeURIComponent(
            activityId
          )}`,
          {
            method: "DELETE",
            headers: getHeaders(),
          }
        );

      if (
        await handleUnauthorized(
          response
        )
      ) {
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete activity."
        );
      }

      setMessage(
        data.message ||
          "Security activity deleted successfully."
      );

      await fetchSecurityData();
    } catch (err) {
      console.error(
        "Delete Activity Error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete activity."
      );
    } finally {
      setSecurityAction("");
    }
  };

  // =====================================================
  // DEVICE ICON
  // =====================================================

  const getDeviceIcon = (type) => {
    const value =
      String(type || "")
        .toLowerCase();

    if (
      value.includes("mobile")
    ) {
      return "📱";
    }

    if (
      value.includes("tablet")
    ) {
      return "📲";
    }

    return "💻";
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getActivityStatus = (
    activity
  ) => {
    if (
      activity.isBlocked === true
    ) {
      return {
        text: "Blocked",
        className:
          "status-blocked",
      };
    }

    if (
      activity.isActive === true &&
      activity.status === "Active"
    ) {
      return {
        text: "Active now",
        className:
          "status-active",
      };
    }

    if (
      activity.status === "Failed" ||
      activity.success === false
    ) {
      return {
        text: "Failed",
        className:
          "status-failed",
      };
    }

    return {
      text: "Logged out",
      className:
        "status-logout",
    };
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // RELATIVE TIME
  // =====================================================

  const getRelativeTime = (date) => {
    if (!date) return "";

    const time =
      new Date(date).getTime();

    if (
      Number.isNaN(time)
    ) {
      return "";
    }

    const difference =
      Date.now() - time;

    if (difference < 0) {
      return "Just now";
    }

    const minutes =
      Math.floor(
        difference / 60000
      );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 30) {
      return `${days} day${
        days > 1 ? "s" : ""
      } ago`;
    }

    return formatDate(date);
  };

  // =====================================================
  // LOCATION FORMATTER
  // =====================================================

  const formatLocation = (item) => {
    if (!item) return "";

    const parts = [
      item.city,
      item.region,
      item.country,
    ]
      .map((value) =>
        value ? String(value).trim() : ""
      )
      .filter(Boolean);

    return parts.join(", ");
  };

  const getLocationFlag = (item) => {
    if (!item) return "";
    return getFlagEmoji(item.countryCode);
  };

  const getIpDisplay = (item) => {
    if (!item) return "Unknown IP";

    const ip = item.ipAddress
      ? String(item.ipAddress).trim()
      : "";

    if (!ip) return "Unknown IP";

    return ip;
  };

  const getIpVersionLabel = (item) => {
    if (!item) return "";

    if (
      item.ipVersion &&
      item.ipVersion !== "Unknown"
    ) {
      return item.ipVersion;
    }

    return "";
  };

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const getProfileImage = () => {
    if (!profileImage) {
      return "";
    }

    if (
      profileImage.startsWith(
        "http://"
      ) ||
      profileImage.startsWith(
        "https://"
      ) ||
      profileImage.startsWith(
        "blob:"
      )
    ) {
      return profileImage;
    }

    return `${API_URL}${profileImage}`;
  };

  // =====================================================
  // CURRENT SESSION
  // =====================================================

  const currentSessionId =
    getCurrentSessionId();

  const currentDeviceId =
    getAdminDeviceId();

  const currentSession =
    activeSessions.find(
      (session) => {
        if (
          session.isCurrent === true
        ) {
          return true;
        }

        if (
          currentSessionId &&
          session.sessionId
        ) {
          return (
            String(
              session.sessionId
            ) ===
            String(
              currentSessionId
            )
          );
        }

        if (
          currentDeviceId &&
          session.deviceId
        ) {
          return (
            String(
              session.deviceId
            ) ===
            String(
              currentDeviceId
            )
          );
        }

        return false;
      }
    ) || null;

  const isCurrentActivity = (
    activity
  ) => {
    if (!activity) return false;

    if (
      activity.sessionId &&
      currentSessionId
    ) {
      if (
        String(
          activity.sessionId
        ) ===
        String(
          currentSessionId
        )
      ) {
        return true;
      }
    }

    if (
      activity.deviceId &&
      currentDeviceId
    ) {
      if (
        String(
          activity.deviceId
        ) ===
        String(
          currentDeviceId
        )
      ) {
        return true;
      }
    }

    return false;
  };

  // =====================================================
  // HISTORY ID
  // =====================================================

  const getHistoryId = (
    activity,
    index
  ) => {
    return String(
      activity._id ||
        activity.id ||
        activity.deviceId ||
        activity.sessionId ||
        `history-${index}`
    );
  };

  // =====================================================
  // HIDDEN HISTORY
  // =====================================================

  const isHistoryHidden = (
    activity,
    index
  ) => {
    return hiddenLoginHistory.includes(
      getHistoryId(
        activity,
        index
      )
    );
  };

  const hideLoginHistory = (
    historyId
  ) => {
    if (!historyId) return;

    const confirmed =
      window.confirm(
        "Hide this login activity from your history view?"
      );

    if (!confirmed) return;

    const updated = [
      ...hiddenLoginHistory,
      String(historyId),
    ];

    const uniqueIds = [
      ...new Set(updated),
    ];

    setHiddenLoginHistory(
      uniqueIds
    );

    localStorage.setItem(
      "adminHiddenLoginHistory",
      JSON.stringify(
        uniqueIds
      )
    );

    setMessage(
      "Login activity hidden from this view."
    );
  };

  const clearHiddenHistory = () => {
    const confirmed =
      window.confirm(
        "Show all hidden login activities again?"
      );

    if (!confirmed) return;

    setHiddenLoginHistory([]);

    localStorage.removeItem(
      "adminHiddenLoginHistory"
    );

    setMessage(
      "All hidden login activities restored."
    );
  };

  // =====================================================
  // SELECT DEVICE
  // =====================================================

  const selectSessionForHistory = (
    session
  ) => {
    if (!session) return;

    const deviceId =
      session.deviceId;

    const sessionId =
      session.sessionId;

    setSelectedSessionId(
      deviceId ||
        sessionId ||
        session._id ||
        session.id ||
        null
    );

    setShowHiddenHistory(false);

    setTimeout(() => {
      const section =
        document.getElementById(
          "admin-login-history"
        );

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // =====================================================
  // HISTORY FILTER
  // =====================================================

  const getVisibleLoginHistory =
    () => {
      let history =
        Array.isArray(
          loginActivity
        )
          ? [...loginActivity]
          : [];

      if (
        selectedSessionId
      ) {
        history =
          history.filter(
            (activity) => {
              const activityDevice =
                activity.deviceId;

              const activitySession =
                activity.sessionId;

              return (
                String(
                  activityDevice
                ) ===
                  String(
                    selectedSessionId
                  ) ||
                String(
                  activitySession
                ) ===
                  String(
                    selectedSessionId
                  )
              );
            }
          );
      }

      if (
        !showHiddenHistory
      ) {
        history =
          history.filter(
            (
              activity,
              index
            ) =>
              !isHistoryHidden(
                activity,
                index
              )
          );
      }

      return history;
    };

  // =====================================================
  // SECURITY STATS
  // =====================================================

  const totalDevices =
    loginActivity.length;

  const activeCount =
    activeSessions.length;

  const blockedCount =
    blockedDevices.length;

  const totalLoginCount =
    loginActivity.reduce(
      (
        total,
        activity
      ) =>
        total +
        Number(
          activity.loginCount || 1
        ),
      0
    );

  const lastLogin =
    loginActivity.length > 0
      ? loginActivity[0]
      : null;

  const currentLastActivity =
    currentSession?.lastActive ||
    currentSession?.lastLoginAt ||
    lastLogin?.lastActive ||
    lastLogin?.lastLoginAt ||
    lastLogin?.loginAt;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-settings-page">

      {/* HEADER */}

      <div className="settings-header">

        <div>

          <div className="settings-breadcrumb">
            Admin / Settings
          </div>

          <h1>
            Account Settings
          </h1>

          <p>
            Manage your profile, security
            and administrator preferences.
          </p>

        </div>

        <div className="settings-admin-mini">

          <div className="mini-avatar">

            {getProfileImage() ? (
              <img
                src={getProfileImage()}
                alt="Admin"
              />
            ) : (
              (
                profileData.fullName ||
                "A"
              )
                .charAt(0)
                .toUpperCase()
            )}

          </div>

          <div>

            <strong>
              {profileData.fullName ||
                "Administrator"}
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </div>

      </div>

      {/* ALERTS */}

      {message && (
        <div className="settings-alert success">

          <span>✓</span>

          <div>
            <strong>
              Success
            </strong>

            <p>
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            ×
          </button>

        </div>
      )}

      {error && (
        <div className="settings-alert error">

          <span>!</span>

          <div>
            <strong>
              Error
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* MAIN */}

      <div className="settings-layout">

        {/* SIDEBAR */}

        <aside className="settings-sidebar">

          <div className="settings-sidebar-title">
            SETTINGS
          </div>

          <button
            type="button"
            className={
              activeTab === "profile"
                ? "settings-nav active"
                : "settings-nav"
            }
            onClick={() => {
              clearMessages();
              setActiveTab("profile");
            }}
          >

            <span className="nav-icon">
              👤
            </span>

            <span>
              <strong>
                Profile
              </strong>

              <small>
                Personal information
              </small>
            </span>

            <b>›</b>

          </button>

          <button
            type="button"
            className={
              activeTab === "security"
                ? "settings-nav active"
                : "settings-nav"
            }
            onClick={() => {
              clearMessages();
              setActiveTab("security");
            }}
          >

            <span className="nav-icon">
              🔐
            </span>

            <span>
              <strong>
                Security
              </strong>

              <small>
                Login & devices
              </small>
            </span>

            <b>›</b>

          </button>

          <button
            type="button"
            className={
              activeTab ===
              "notifications"
                ? "settings-nav active"
                : "settings-nav"
            }
            onClick={() => {
              clearMessages();
              setActiveTab(
                "notifications"
              );
            }}
          >

            <span className="nav-icon">
              🔔
            </span>

            <span>
              <strong>
                Notifications
              </strong>

              <small>
                Alerts & messages
              </small>
            </span>

            <b>›</b>

          </button>

          <button
            type="button"
            className={
              activeTab ===
              "preferences"
                ? "settings-nav active"
                : "settings-nav"
            }
            onClick={() => {
              clearMessages();
              setActiveTab(
                "preferences"
              );
            }}
          >

            <span className="nav-icon">
              ⚙
            </span>

            <span>
              <strong>
                Preferences
              </strong>

              <small>
                App preferences
              </small>
            </span>

            <b>›</b>

          </button>

          <div className="sidebar-security-card">

            <div className="security-shield">
              🔒
            </div>

            <strong>
              Account protected
            </strong>

            <p>
              Your administrator account
              is protected by authentication.
            </p>

          </div>

        </aside>

        {/* CONTENT */}

        <main className="settings-content">

          {/* PROFILE */}

          {activeTab === "profile" && (

            <div className="settings-panel">

              <div className="panel-heading">

                <div>

                  <span className="panel-label">
                    ACCOUNT
                  </span>

                  <h2>
                    Profile Information
                  </h2>

                  <p>
                    Update your administrator
                    account information.
                  </p>

                </div>

              </div>

              <div className="profile-photo-section">

                <div className="large-profile-avatar">

                  {getProfileImage() ? (
                    <img
                      src={getProfileImage()}
                      alt="Admin"
                    />
                  ) : (
                    (
                      profileData.fullName ||
                      "A"
                    )
                      .charAt(0)
                      .toUpperCase()
                  )}

                </div>

                <div className="photo-info">

                  <h3>
                    Profile photo
                  </h3>

                  <p>
                    JPG, PNG or WEBP.
                    Maximum recommended
                    size 2MB.
                  </p>

                  <label className="upload-photo-btn">

                    Change photo

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageChange
                      }
                    />

                  </label>

                </div>

              </div>

              <form
                className="settings-form"
                onSubmit={
                  updateProfile
                }
              >

                <div className="form-grid">

                  <div className="settings-field">

                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={
                        profileData.fullName
                      }
                      onChange={
                        handleProfileChange
                      }
                      placeholder="Enter full name"
                    />

                  </div>

                  <div className="settings-field">

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      value={
                        profileData.email
                      }
                      disabled
                    />

                    <small>
                      Email cannot be changed
                      from this page.
                    </small>

                  </div>

                  <div className="settings-field">

                    <label>
                      Mobile Number
                    </label>

                    <input
                      type="text"
                      name="mobile"
                      value={
                        profileData.mobile
                      }
                      onChange={
                        handleProfileChange
                      }
                      placeholder="Enter mobile number"
                    />

                  </div>

                  <div className="settings-field">

                    <label>
                      Account Role
                    </label>

                    <input
                      type="text"
                      value={
                        user?.role ||
                        "Administrator"
                      }
                      disabled
                    />

                  </div>

                </div>

                <div className="form-actions">

                  <button
                    type="submit"
                    className="primary-settings-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          )}

          {/* SECURITY */}

          {activeTab === "security" && (

            <div className="security-page">

              <div className="panel-heading security-heading">

                <div>

                  <span className="panel-label">
                    SECURITY CENTER
                  </span>

                  <h2>
                    Login Activity
                  </h2>

                  <p>
                    Monitor administrator
                    account access and
                    registered devices.
                  </p>

                </div>

                <button
                  type="button"
                  className="refresh-security-btn"
                  onClick={
                    fetchSecurityData
                  }
                  disabled={
                    securityLoading
                  }
                >
                  ↻{" "}
                  {securityLoading
                    ? "Refreshing..."
                    : "Refresh"}
                </button>

              </div>

              {/* SECURITY ERROR */}

              {securityError && (

                <div className="security-inline-error">

                  <span>!</span>

                  <div>

                    <strong>
                      Security data error
                    </strong>

                    <p>
                      {securityError}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      fetchSecurityData
                    }
                  >
                    Retry
                  </button>

                </div>

              )}

              {/* STATS */}

              <div className="security-stats">

                <div className="security-stat-card">

                  <div className="stat-icon blue">
                    🖥️
                  </div>

                  <div>

                    <span>
                      Registered Devices
                    </span>

                    <strong>
                      {totalDevices}
                    </strong>

                    <small>
                      Unique browser devices
                    </small>

                  </div>

                </div>

                <div className="security-stat-card">

                  <div className="stat-icon green">
                    ●
                  </div>

                  <div>

                    <span>
                      Active Sessions
                    </span>

                    <strong>
                      {activeCount}
                    </strong>

                    <small>
                      Currently active
                    </small>

                  </div>

                </div>

                <div className="security-stat-card">

                  <div className="stat-icon orange">
                    🔐
                  </div>

                  <div>

                    <span>
                      Login Count
                    </span>

                    <strong>
                      {totalLoginCount}
                    </strong>

                    <small>
                      Total successful logins
                    </small>

                  </div>

                </div>

                <div className="security-stat-card">

                  <div className="stat-icon purple">
                    🚫
                  </div>

                  <div>

                    <span>
                      Blocked Devices
                    </span>

                    <strong>
                      {blockedCount}
                    </strong>

                    <small>
                      Access denied
                    </small>

                  </div>

                </div>

              </div>

              {/* CURRENT SESSION */}

              <div className="current-session-card">

                <div className="current-session-left">

                  <div className="current-device-icon">

                    {getDeviceIcon(
                      currentSession?.deviceType ||
                        lastLogin?.deviceType
                    )}

                  </div>

                  <div>

                    <div className="current-title-row">

                      <h3>
                        Current Session
                      </h3>

                      <span className="live-badge">
                        ● LIVE
                      </span>

                    </div>

                    <p>
                      {currentSession?.deviceName ||
                        lastLogin?.deviceName ||
                        "Current device"}
                    </p>

                    <div className="current-meta">

                      <span>
                        🌐{" "}
                        {getIpDisplay(
                          currentSession ||
                            lastLogin
                        )}
                        {getIpVersionLabel(
                          currentSession ||
                            lastLogin
                        )
                          ? ` (${getIpVersionLabel(
                              currentSession ||
                                lastLogin
                            )})`
                          : ""}
                      </span>

                      <span>
                        🌍{" "}
                        {currentSession?.browser ||
                          lastLogin?.browser ||
                          "Unknown browser"}
                      </span>

                      <span>
                        💿{" "}
                        {currentSession?.operatingSystem ||
                          lastLogin?.operatingSystem ||
                          "Unknown OS"}
                      </span>

                    </div>

                    {(currentSession ||
                      lastLogin) &&
                      (formatLocation(
                        currentSession ||
                          lastLogin
                      ) ||
                        getLocationFlag(
                          currentSession ||
                            lastLogin
                        )) && (

                      <div className="current-meta">

                        <span>
                          📍{" "}
                          {getLocationFlag(
                            currentSession ||
                              lastLogin
                          )}{" "}
                          {formatLocation(
                            currentSession ||
                              lastLogin
                          ) || "Unknown location"}
                        </span>

                      </div>

                    )}

                  </div>

                </div>

                <div className="current-session-right">

                  <span>
                    Last activity
                  </span>

                  <strong>
                    {currentLastActivity
                      ? getRelativeTime(
                          currentLastActivity
                        )
                      : "—"}
                  </strong>

                </div>

              </div>

              {/* ACTIVE DEVICES */}

              <div className="security-section">

                <div className="section-title-row">

                  <div>

                    <h3>
                      Active Devices
                    </h3>

                    <p>
                      Click a device to view
                      its security activity.
                    </p>

                  </div>

                  <span className="count-pill">
                    {activeCount}
                  </span>

                </div>

                {securityLoading ? (

                  <div className="security-loading">

                    <div className="security-spinner"></div>

                    <p>
                      Loading devices...
                    </p>

                  </div>

                ) : activeSessions.length ===
                  0 ? (

                  <div className="empty-security">

                    <div>
                      💤
                    </div>

                    <h4>
                      No active devices
                    </h4>

                    <p>
                      Active devices will
                      appear here after login.
                    </p>

                  </div>

                ) : (

                  <div className="active-session-list">

                    {activeSessions.map(
                      (
                        session,
                        index
                      ) => {

                        const sessionId =
                          session._id ||
                          session.id ||
                          session.sessionId;

                        const isCurrent =
                          session.isCurrent ===
                          true ||
                          isCurrentActivity(
                            session
                          );

                        const isSelected =
                          selectedSessionId &&
                          (
                            String(
                              selectedSessionId
                            ) ===
                              String(
                                session.deviceId
                              ) ||
                            String(
                              selectedSessionId
                            ) ===
                              String(
                                session.sessionId
                              )
                          );

                        return (

                          <div
                            key={
                              sessionId ||
                              index
                            }
                            className={
                              `active-session-item clickable-session ${
                                isCurrent
                                  ? "current-session-item"
                                  : ""
                              } ${
                                isSelected
                                  ? "selected-session-item"
                                  : ""
                              }`
                            }
                            onClick={() =>
                              selectSessionForHistory(
                                session
                              )
                            }
                          >

                            <div className="session-device-icon">

                              {getDeviceIcon(
                                session.deviceType
                              )}

                            </div>

                            <div className="session-main">

                              <div className="session-name-row">

                                <h4>
                                  {session.deviceName ||
                                    "Unknown Device"}
                                </h4>

                                {isCurrent ? (

                                  <span className="current-device-badge">
                                    ✓ This Device
                                  </span>

                                ) : (

                                  <span className="active-label">
                                    ● Active
                                  </span>

                                )}

                              </div>

                              <div className="session-details">

                                <span>
                                  Browser:{" "}
                                  <strong>
                                    {session.browser ||
                                      "Unknown"}
                                  </strong>
                                </span>

                                <span>
                                  OS:{" "}
                                  <strong>
                                    {session.operatingSystem ||
                                      "Unknown"}
                                  </strong>
                                </span>

                                <span>
                                  IP:{" "}
                                  <strong>
                                    {getIpDisplay(
                                      session
                                    )}
                                    {getIpVersionLabel(
                                      session
                                    )
                                      ? ` (${getIpVersionLabel(
                                          session
                                        )})`
                                      : ""}
                                  </strong>
                                </span>

                              </div>

                              {(formatLocation(
                                session
                              ) ||
                                getLocationFlag(
                                  session
                                )) && (

                                <div className="session-details">

                                  <span>
                                    📍 Location:{" "}
                                    <strong>
                                      {getLocationFlag(
                                        session
                                      )}{" "}
                                      {formatLocation(
                                        session
                                      ) ||
                                        "Unknown"}
                                    </strong>
                                  </span>

                                </div>

                              )}

                              <div className="session-details">

                                <span>
                                  Login Count:{" "}
                                  <strong>
                                    {session.loginCount ||
                                      1}
                                  </strong>
                                </span>

                                <span>
                                  Last Login:{" "}
                                  <strong>
                                    {getRelativeTime(
                                      session.lastLoginAt ||
                                        session.loginAt
                                    )}
                                  </strong>
                                </span>

                              </div>

                              {session.lastActive && (

                                <div className="session-last-active">

                                  Last active:{" "}

                                  <strong>
                                    {getRelativeTime(
                                      session.lastActive
                                    )}
                                  </strong>

                                </div>

                              )}

                            </div>

                            <div className="session-actions">

                              {isCurrent ? (

                                <span className="current-session-text">
                                  Current device
                                </span>

                              ) : (

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    gap:
                                      "8px",
                                    flexWrap:
                                      "wrap",
                                  }}
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >

                                  <button
                                    type="button"
                                    className="logout-session-btn"
                                    disabled={
                                      securityAction ===
                                        `logout-${sessionId}` ||
                                      securityAction ===
                                        `block-${sessionId}`
                                    }
                                    onClick={() =>
                                      logoutDevice(
                                        sessionId
                                      )
                                    }
                                  >
                                    {securityAction ===
                                    `logout-${sessionId}`
                                      ? "Logging out..."
                                      : "Logout"}
                                  </button>

                                  <button
                                    type="button"
                                    className="logout-session-btn"
                                    disabled={
                                      securityAction ===
                                      `block-${sessionId}`
                                    }
                                    onClick={() =>
                                      blockDevice(
                                        session
                                      )
                                    }
                                  >
                                    {securityAction ===
                                    `block-${sessionId}`
                                      ? "Blocking..."
                                      : "Block"}
                                  </button>

                                </div>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

              {/* BLOCKED DEVICES */}

              <div className="security-section">

                <div className="section-title-row">

                  <div>

                    <h3>
                      Blocked Devices
                    </h3>

                    <p>
                      These devices cannot
                      login until unblocked.
                    </p>

                  </div>

                  <span className="count-pill">
                    {blockedCount}
                  </span>

                </div>

                {blockedDevices.length ===
                0 ? (

                  <div className="empty-security">

                    <div>
                      🛡️
                    </div>

                    <h4>
                      No blocked devices
                    </h4>

                    <p>
                      Devices you block will
                      remain listed here.
                    </p>

                  </div>

                ) : (

                  <div className="active-session-list">

                    {blockedDevices.map(
                      (
                        device,
                        index
                      ) => {

                        const deviceId =
                          device._id ||
                          device.id;

                        return (

                          <div
                            key={
                              deviceId ||
                              index
                            }
                            className="active-session-item"
                          >

                            <div className="session-device-icon">

                              {getDeviceIcon(
                                device.deviceType
                              )}

                            </div>

                            <div className="session-main">

                              <div className="session-name-row">

                                <h4>
                                  {device.deviceName ||
                                    "Unknown Device"}
                                </h4>

                                <span className="history-status status-blocked">
                                  🚫 Blocked
                                </span>

                              </div>

                              <div className="session-details">

                                <span>
                                  Browser:{" "}
                                  <strong>
                                    {device.browser ||
                                      "Unknown"}
                                  </strong>
                                </span>

                                <span>
                                  OS:{" "}
                                  <strong>
                                    {device.operatingSystem ||
                                      "Unknown"}
                                  </strong>
                                </span>

                                <span>
                                  IP:{" "}
                                  <strong>
                                    {getIpDisplay(
                                      device
                                    )}
                                    {getIpVersionLabel(
                                      device
                                    )
                                      ? ` (${getIpVersionLabel(
                                          device
                                        )})`
                                      : ""}
                                  </strong>
                                </span>

                              </div>

                              {(formatLocation(
                                device
                              ) ||
                                getLocationFlag(
                                  device
                                )) && (

                                <div className="session-details">

                                  <span>
                                    📍 Location:{" "}
                                    <strong>
                                      {getLocationFlag(
                                        device
                                      )}{" "}
                                      {formatLocation(
                                        device
                                      ) ||
                                        "Unknown"}
                                    </strong>
                                  </span>

                                </div>

                              )}

                              <div className="session-details">

                                <span>
                                  Login Count:{" "}
                                  <strong>
                                    {device.loginCount ||
                                      1}
                                  </strong>
                                </span>

                                <span>
                                  Blocked At:{" "}
                                  <strong>
                                    {device.blockedAt
                                      ? formatDate(
                                          device.blockedAt
                                        )
                                      : "—"}
                                  </strong>
                                </span>

                              </div>

                            </div>

                            <div className="session-actions">

                              <button
                                type="button"
                                className="logout-session-btn"
                                disabled={
                                  securityAction ===
                                  `unblock-${deviceId}`
                                }
                                onClick={() =>
                                  unblockDevice(
                                    device
                                  )
                                }
                              >
                                {securityAction ===
                                `unblock-${deviceId}`
                                  ? "Unblocking..."
                                  : "Unblock"}
                              </button>

                              <button
                                type="button"
                                className="logout-session-btn"
                                disabled={
                                  securityAction ===
                                  `delete-${deviceId}`
                                }
                                onClick={() =>
                                  deleteActivity(
                                    device
                                  )
                                }
                              >
                                {securityAction ===
                                `delete-${deviceId}`
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

              {/* LOGIN HISTORY */}

              <div
                className="security-section"
                id="admin-login-history"
              >

                <div className="section-title-row">

                  <div>

                    <h3>
                      Login History
                    </h3>

                    <p>
                      Every registered device
                      is shown once. Login Count
                      tells how many times it has
                      logged in.
                    </p>

                  </div>

                  <div
                    className="history-header-actions"
                  >

                    {selectedSessionId && (

                      <button
                        type="button"
                        className="history-all-btn"
                        onClick={() =>
                          setSelectedSessionId(
                            null
                          )
                        }
                      >
                        ← All Devices
                      </button>

                    )}

                    <button
                      type="button"
                      className="history-hidden-btn"
                      onClick={() =>
                        setShowHiddenHistory(
                          !showHiddenHistory
                        )
                      }
                    >
                      {showHiddenHistory
                        ? "Hide Hidden"
                        : "Show Hidden"}
                    </button>

                    {hiddenLoginHistory.length >
                      0 && (

                      <button
                        type="button"
                        className="history-restore-btn"
                        onClick={
                          clearHiddenHistory
                        }
                      >
                        Restore All
                      </button>

                    )}

                    <span className="history-count">
                      {
                        getVisibleLoginHistory()
                          .length
                      }{" "}
                      devices
                    </span>

                  </div>

                </div>

                {selectedSessionId && (

                  <div className="selected-history-banner">

                    <div className="selected-history-icon">
                      🔐
                    </div>

                    <div>

                      <strong>
                        Device History Selected
                      </strong>

                      <p>
                        Showing activity for
                        the selected device.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSessionId(
                          null
                        )
                      }
                    >
                      Clear
                    </button>

                  </div>

                )}

                {securityLoading ? (

                  <div className="security-loading">

                    <div className="security-spinner"></div>

                    <p>
                      Loading login history...
                    </p>

                  </div>

                ) : getVisibleLoginHistory()
                    .length === 0 ? (

                  <div className="empty-security">

                    <div>
                      🔐
                    </div>

                    <h4>
                      No login activity found
                    </h4>

                    <p>
                      Login activity will
                      appear here after
                      administrator sign-in.
                    </p>

                  </div>

                ) : (

                  <div className="login-history">

                    {getVisibleLoginHistory().map(
                      (
                        activity,
                        index
                      ) => {

                        const status =
                          getActivityStatus(
                            activity
                          );

                        const historyId =
                          getHistoryId(
                            activity,
                            index
                          );

                        const current =
                          isCurrentActivity(
                            activity
                          );

                        const locationText =
                          formatLocation(
                            activity
                          );

                        const flag =
                          getLocationFlag(
                            activity
                          );

                        return (

                          <div
                            className={
                              `login-history-card ${
                                current
                                  ? "login-history-current"
                                  : ""
                              }`
                            }
                            key={
                              historyId
                            }
                          >

                            <div className="history-timeline">

                              <div
                                className={
                                  activity.isActive
                                    ? "timeline-dot active"
                                    : "timeline-dot"
                                }
                              ></div>

                              {index !==
                                getVisibleLoginHistory()
                                  .length -
                                  1 && (
                                <div className="timeline-line"></div>
                              )}

                            </div>

                            <div className="history-device">

                              <div className="history-device-icon">

                                {getDeviceIcon(
                                  activity.deviceType
                                )}

                              </div>

                            </div>

                            <div className="history-main">

                              <div className="history-top">

                                <div>

                                  <h4>
                                    {activity.deviceName ||
                                      "Unknown Device"}
                                  </h4>

                                  <span className="history-device-type">
                                    {activity.deviceType ||
                                      "Unknown Device"}
                                  </span>

                                  {current && (

                                    <span className="history-current-badge">
                                      This Device
                                    </span>

                                  )}

                                </div>

                                <div className="history-top-right">

                                  <span
                                    className={
                                      `history-status ${status.className}`
                                    }
                                  >
                                    {
                                      status.text
                                    }
                                  </span>

                                  {!current && (

                                    <button
                                      type="button"
                                      className="hide-history-btn"
                                      onClick={() =>
                                        hideLoginHistory(
                                          historyId
                                        )
                                      }
                                    >
                                      Hide
                                    </button>

                                  )}

                                </div>

                              </div>

                              <div className="history-info-grid">

                                <div className="history-info">

                                  <span>
                                    🌐 IP ADDRESS
                                  </span>

                                  <strong>
                                    {getIpDisplay(
                                      activity
                                    )}
                                    {getIpVersionLabel(
                                      activity
                                    )
                                      ? ` (${getIpVersionLabel(
                                          activity
                                        )})`
                                      : ""}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    🌍 BROWSER
                                  </span>

                                  <strong>
                                    {activity.browser ||
                                      "Unknown"}
                                    {activity.browserVersion &&
                                    activity.browserVersion !==
                                      "Unknown"
                                      ? ` ${activity.browserVersion}`
                                      : ""}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    💿 OPERATING SYSTEM
                                  </span>

                                  <strong>
                                    {activity.operatingSystem ||
                                      "Unknown"}
                                    {activity.osVersion &&
                                    activity.osVersion !==
                                      "Unknown"
                                      ? ` ${activity.osVersion}`
                                      : ""}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    📍 LOCATION
                                  </span>

                                  <strong>
                                    {flag
                                      ? `${flag} `
                                      : ""}
                                    {locationText ||
                                      "Unknown"}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    🏙️ CITY
                                  </span>

                                  <strong>
                                    {activity.city ||
                                      "Unknown"}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    🗺️ REGION
                                  </span>

                                  <strong>
                                    {activity.region ||
                                      "Unknown"}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    🌎 COUNTRY
                                  </span>

                                  <strong>
                                    {activity.country
                                      ? `${
                                          activity.country
                                        }${
                                          activity.countryCode
                                            ? ` (${String(
                                                activity.countryCode
                                              ).toUpperCase()})`
                                            : ""
                                        }`
                                      : "Unknown"}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    📮 COUNTRY CODE
                                  </span>

                                  <strong>
                                    {activity.countryCode
                                      ? String(
                                          activity.countryCode
                                        ).toUpperCase()
                                      : "—"}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    🔢 LOGIN COUNT
                                  </span>

                                  <strong>
                                    {activity.loginCount ||
                                      1}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    🕐 LAST LOGIN
                                  </span>

                                  <strong>
                                    {formatDate(
                                      activity.lastLoginAt ||
                                        activity.loginAt
                                    )}
                                  </strong>

                                </div>

                                <div className="history-info">

                                  <span>
                                    ⚡ LAST ACTIVE
                                  </span>

                                  <strong>
                                    {getRelativeTime(
                                      activity.lastActive ||
                                        activity.lastLoginAt ||
                                        activity.loginAt
                                    )}
                                  </strong>

                                </div>

                              </div>

                              {!current && (

                                <div
                                  style={{
                                    marginTop:
                                      "16px",
                                    display:
                                      "flex",
                                    gap:
                                      "8px",
                                    flexWrap:
                                      "wrap",
                                  }}
                                >

                                  {!activity.isBlocked && (

                                    <button
                                      type="button"
                                      className="logout-session-btn"
                                      disabled={
                                        securityAction ===
                                        `block-${historyId}`
                                      }
                                      onClick={() =>
                                        blockDevice(
                                          activity
                                        )
                                      }
                                    >
                                      {securityAction ===
                                      `block-${historyId}`
                                        ? "Blocking..."
                                        : "🚫 Block Device"}
                                    </button>

                                  )}

                                  {activity.isBlocked && (

                                    <button
                                      type="button"
                                      className="logout-session-btn"
                                      disabled={
                                        securityAction ===
                                        `unblock-${historyId}`
                                      }
                                      onClick={() =>
                                        unblockDevice(
                                          activity
                                        )
                                      }
                                    >
                                      {securityAction ===
                                      `unblock-${historyId}`
                                        ? "Unblocking..."
                                        : "✓ Unblock Device"}
                                    </button>

                                  )}

                                  <button
                                    type="button"
                                    className="logout-session-btn"
                                    disabled={
                                      securityAction ===
                                      `delete-${historyId}`
                                    }
                                    onClick={() =>
                                      deleteActivity(
                                        activity
                                      )
                                    }
                                  >
                                    {securityAction ===
                                    `delete-${historyId}`
                                      ? "Deleting..."
                                      : "Delete Record"}
                                  </button>

                                </div>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

              {/* SECURITY INFO */}

              <div className="security-info-box">

                <div className="security-info-icon">
                  🛡️
                </div>

                <div>

                  <h3>
                    Device Security
                  </h3>

                  <p>
                    Each browser/device gets a
                    unique device ID. Repeated
                    logins from the same device
                    increase its Login Count
                    instead of creating duplicate
                    device records.
                  </p>

                  <div className="security-info-points">

                    <span>
                      ✓ Unique device tracking
                    </span>

                    <span>
                      ✓ Login count tracking
                    </span>

                    <span>
                      ✓ Browser detection
                    </span>

                    <span>
                      ✓ Operating system
                    </span>

                    <span>
                      ✓ IP address
                    </span>

                    <span>
                      ✓ Location (city, region, country)
                    </span>

                    <span>
                      ✓ Remote logout
                    </span>

                    <span>
                      ✓ Device blocking
                    </span>

                    <span>
                      ✓ Device unblocking
                    </span>

                  </div>

                </div>

              </div>

            </div>

          )}

          {/* NOTIFICATIONS */}

          {activeTab ===
            "notifications" && (

            <div className="settings-panel">

              <div className="panel-heading">

                <div>

                  <span className="panel-label">
                    COMMUNICATION
                  </span>

                  <h2>
                    Notifications
                  </h2>

                  <p>
                    Choose how you want to
                    receive administrator
                    notifications.
                  </p>

                </div>

              </div>

              <div className="preference-list">

                <div className="preference-item">

                  <div className="preference-icon">
                    ✉
                  </div>

                  <div className="preference-text">

                    <h3>
                      Email Notifications
                    </h3>

                    <p>
                      Receive important account
                      and admin notifications
                      by email.
                    </p>

                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      checked={
                        notifications.emailNotifications
                      }
                      onChange={(e) =>
                        setNotifications(
                          (prev) => ({
                            ...prev,
                            emailNotifications:
                              e.target.checked,
                          })
                        )
                      }
                    />

                    <span></span>

                  </label>

                </div>

                <div className="preference-item">

                  <div className="preference-icon">
                    📱
                  </div>

                  <div className="preference-text">

                    <h3>
                      SMS Notifications
                    </h3>

                    <p>
                      Receive security and
                      service alerts on your
                      mobile.
                    </p>

                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      checked={
                        notifications.smsNotifications
                      }
                      onChange={(e) =>
                        setNotifications(
                          (prev) => ({
                            ...prev,
                            smsNotifications:
                              e.target.checked,
                          })
                        )
                      }
                    />

                    <span></span>

                  </label>

                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="primary-settings-btn"
                  onClick={
                    savePreferences
                  }
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : "Save Preferences"}
                </button>

              </div>

            </div>

          )}

          {/* PREFERENCES */}

          {activeTab ===
            "preferences" && (

            <div className="settings-panel">

              <div className="panel-heading">

                <div>

                  <span className="panel-label">
                    APPLICATION
                  </span>

                  <h2>
                    Preferences
                  </h2>

                  <p>
                    Customize your
                    administrator dashboard
                    experience.
                  </p>

                </div>

              </div>

              <div className="preference-list">

                <div className="preference-item">

                  <div className="preference-icon">
                    🌐
                  </div>

                  <div className="preference-text">

                    <h3>
                      Language
                    </h3>

                    <p>
                      Select the language used
                      throughout the dashboard.
                    </p>

                  </div>

                  <select
                    value={
                      language
                    }
                    onChange={(e) =>
                      setLanguage(
                        e.target.value
                      )
                    }
                    className="settings-select"
                  >

                    <option value="English">
                      English
                    </option>

                    <option value="Hindi">
                      Hindi
                    </option>

                  </select>

                </div>

                <div className="preference-item">

                  <div className="preference-icon">
                    🌙
                  </div>

                  <div className="preference-text">

                    <h3>
                      Dark Mode
                    </h3>

                    <p>
                      Use a darker appearance
                      for the administrator
                      interface.
                    </p>

                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      checked={
                        darkMode
                      }
                      onChange={(e) =>
                        setDarkMode(
                          e.target.checked
                        )
                      }
                    />

                    <span></span>

                  </label>

                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="primary-settings-btn"
                  onClick={
                    savePreferences
                  }
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : "Save Preferences"}
                </button>

              </div>

              {/* PASSWORD */}

              <div className="password-section">

                <div className="panel-heading small">

                  <div>

                    <span className="panel-label">
                      PASSWORD
                    </span>

                    <h2>
                      Change Password
                    </h2>

                    <p>
                      Use a strong password
                      that you do not use
                      elsewhere.
                    </p>

                  </div>

                </div>

                <form
                  className="settings-form"
                  onSubmit={
                    changePassword
                  }
                >

                  <div className="form-grid">

                    <div className="settings-field">

                      <label>
                        Current Password
                      </label>

                      <div className="password-input">

                        <input
                          type={
                            showCurrentPassword
                              ? "text"
                              : "password"
                          }
                          name="currentPassword"
                          value={
                            passwordData.currentPassword
                          }
                          onChange={
                            handlePasswordChange
                          }
                          placeholder="Current password"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(
                              !showCurrentPassword
                            )
                          }
                        >
                          {showCurrentPassword
                            ? "Hide"
                            : "Show"}
                        </button>

                      </div>

                    </div>

                    <div className="settings-field">

                      <label>
                        New Password
                      </label>

                      <div className="password-input">

                        <input
                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }
                          name="newPassword"
                          value={
                            passwordData.newPassword
                          }
                          onChange={
                            handlePasswordChange
                          }
                          placeholder="New password"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(
                              !showNewPassword
                            )
                          }
                        >
                          {showNewPassword
                            ? "Hide"
                            : "Show"}
                        </button>

                      </div>

                    </div>

                    <div className="settings-field">

                      <label>
                        Confirm Password
                      </label>

                      <div className="password-input">

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="confirmPassword"
                          value={
                            passwordData.confirmPassword
                          }
                          onChange={
                            handlePasswordChange
                          }
                          placeholder="Confirm new password"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                        >
                          {showConfirmPassword
                            ? "Hide"
                            : "Show"}
                        </button>

                      </div>

                    </div>

                  </div>

                  <div className="form-actions">

                    <button
                      type="submit"
                      className="primary-settings-btn"
                      disabled={loading}
                    >
                      {loading
                        ? "Updating..."
                        : "Update Password"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default AdminSettings;