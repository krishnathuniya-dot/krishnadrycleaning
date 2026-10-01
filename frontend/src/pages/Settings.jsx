
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/setting.css";

function Settings() {
  const navigate = useNavigate();

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );

  // =====================================================
  // PASSWORD
  // =====================================================

  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);

  // =====================================================
  // SETTINGS
  // =====================================================

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [smsNotifications, setSmsNotifications] =
    useState(true);

  const [language, setLanguage] = useState("English");

  const [darkMode, setDarkMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // GET SETTINGS
  // =====================================================

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        "http://localhost:2340/api/settings",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        return;
      }

      if (data.success && data.user) {
        const userData = data.user;

        setUser(userData);

        setEmailNotifications(
          userData.emailNotifications ?? true
        );

        setSmsNotifications(
          userData.smsNotifications ?? true
        );

        setLanguage(
          userData.language || "English"
        );

        setDarkMode(
          userData.darkMode ?? false
        );

        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );
      }
    } catch (error) {
      console.log("Settings Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:2340/api/change-password",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to change password."
        );
        return;
      }

      alert(
        data.message ||
          "Password changed successfully."
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    } catch (error) {
      console.log("Password Error:", error);

      alert(
        "Server se connection nahi ho raha."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  const savePreferences = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:2340/api/settings",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            emailNotifications,
            smsNotifications,
            language,
            darkMode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to save settings."
        );
        return;
      }

      if (data.success && data.user) {
        setUser(data.user);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "name",
          data.user.fullName || ""
        );

        localStorage.setItem(
          "email",
          data.user.email || ""
        );

        localStorage.setItem(
          "mobile",
          data.user.mobile || ""
        );
      }

      alert(
        data.message ||
          "Settings saved successfully."
      );
    } catch (error) {
      console.log("Save Settings Error:", error);

      alert(
        "Server se connection nahi ho raha."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("mobile");

    localStorage.removeItem(
      "emailNotifications"
    );

    localStorage.removeItem(
      "smsNotifications"
    );

    localStorage.removeItem("language");
    localStorage.removeItem("darkMode");

    navigate("/");

    window.location.reload();
  };

  // =====================================================
  // DELETE ACCOUNT
  // =====================================================

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm(
      "This action cannot be undone. Delete your account permanently?"
    );

    if (!secondConfirm) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:2340/api/profile",
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to delete account."
        );
        return;
      }

      localStorage.clear();

      alert(
        data.message ||
          "Your account has been deleted."
      );

      navigate("/");

      window.location.reload();
    } catch (error) {
      console.log(
        "Delete Account Error:",
        error
      );

      alert(
        "Server se connection nahi ho raha."
      );
    }
  };

  // =====================================================
  // PROFILE IMAGE URL
  // =====================================================

  const profileImage = user.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `http://localhost:2340${user.profileImage}`
    : "";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-loading">
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className={`settings-page ${
        darkMode ? "settings-dark" : ""
      }`}
    >
      <div className="settings-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="settings-header">
          <div>
            <span className="settings-small-title">
              ACCOUNT
            </span>

            <h1>Settings</h1>

            <p>
              Manage your account preferences and security.
            </p>
          </div>

          <button
            type="button"
            className="settings-back-btn"
            onClick={() => navigate("/profile")}
          >
            ← Back to Profile
          </button>
        </div>

        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <div className="settings-card account-settings">

          <div className="settings-card-heading">

            <div className="settings-heading-icon">
              👤
            </div>

            <div>
              <h2>
                Account Information
              </h2>

              <p>
                Your registered account details.
              </p>
            </div>

          </div>

          <div className="settings-account-info">

            <div className="settings-user-avatar">

              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                />
              ) : (
                <span>
                  {user.fullName
                    ? user.fullName
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </span>
              )}

            </div>

            <div className="settings-user-details">

              <h3>
                {user.fullName || "User"}
              </h3>

              <p>
                {user.email || "No email"}
              </p>

              <span>
                +91{" "}
                {user.mobile ||
                  "No mobile number"}
              </span>

            </div>

            <button
              type="button"
              className="settings-profile-btn"
              onClick={() =>
                navigate("/profile")
              }
            >
              Edit Profile →
            </button>

          </div>
        </div>

        {/* =================================================
            SECURITY
        ================================================= */}

        <div className="settings-card">

          <div className="settings-card-heading">

            <div className="settings-heading-icon">
              🔒
            </div>

            <div>
              <h2>Security</h2>

              <p>
                Keep your account secure.
              </p>
            </div>

          </div>

          <form
            className="password-form"
            onSubmit={handleChangePassword}
          >

            {/* CURRENT PASSWORD */}

            <div className="settings-input-group">

              <label>
                Current Password
              </label>

              <div className="settings-input-wrapper">

                <span>🔒</span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) =>
                    setOldPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                />

              </div>
            </div>

            {/* NEW PASSWORD */}

            <div className="settings-input-group">

              <label>
                New Password
              </label>

              <div className="settings-input-wrapper">

                <span>🔐</span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="settings-input-group">

              <label>
                Confirm New Password
              </label>

              <div className="settings-input-wrapper">

                <span>🔐</span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

              </div>
            </div>

            {/* SHOW PASSWORD */}

            <label className="show-password">

              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) =>
                  setShowPassword(
                    e.target.checked
                  )
                }
              />

              <span>
                Show passwords
              </span>

            </label>

            {/* CHANGE PASSWORD */}

            <button
              type="submit"
              className="change-password-submit"
              disabled={passwordLoading}
            >
              {passwordLoading
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </form>
        </div>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <div className="settings-card">

          <div className="settings-card-heading">

            <div className="settings-heading-icon">
              🔔
            </div>

            <div>
              <h2>
                Notifications
              </h2>

              <p>
                Choose how you want to receive updates.
              </p>
            </div>

          </div>

          <div className="settings-options">

            {/* EMAIL */}

            <div className="setting-option">

              <div className="setting-option-left">

                <div className="option-icon">
                  ✉
                </div>

                <div>
                  <h3>
                    Email Notifications
                  </h3>

                  <p>
                    Receive important updates by email.
                  </p>
                </div>

              </div>

              <label className="toggle">

                <input
                  type="checkbox"
                  checked={
                    emailNotifications
                  }
                  onChange={(e) =>
                    setEmailNotifications(
                      e.target.checked
                    )
                  }
                />

                <span></span>

              </label>

            </div>

            {/* SMS */}

            <div className="setting-option">

              <div className="setting-option-left">

                <div className="option-icon">
                  📱
                </div>

                <div>
                  <h3>
                    SMS Notifications
                  </h3>

                  <p>
                    Receive account updates on your mobile.
                  </p>
                </div>

              </div>

              <label className="toggle">

                <input
                  type="checkbox"
                  checked={
                    smsNotifications
                  }
                  onChange={(e) =>
                    setSmsNotifications(
                      e.target.checked
                    )
                  }
                />

                <span></span>

              </label>

            </div>

          </div>
        </div>

        {/* =================================================
            PREFERENCES
        ================================================= */}

        <div className="settings-card">

          <div className="settings-card-heading">

            <div className="settings-heading-icon">
              ⚙
            </div>

            <div>
              <h2>
                Preferences
              </h2>

              <p>
                Customize your experience.
              </p>
            </div>

          </div>

          <div className="preference-grid">

            {/* LANGUAGE */}

            <div className="preference-item">

              <label>
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value
                  )
                }
              >
                <option value="English">
                  English
                </option>

                <option value="Hindi">
                  Hindi
                </option>
              </select>

            </div>

            {/* APPEARANCE */}

            <div className="preference-item">

              <label>
                Appearance
              </label>

              <button
                type="button"
                className={`appearance-btn ${
                  darkMode
                    ? "dark-active"
                    : ""
                }`}
                onClick={() =>
                  setDarkMode(
                    !darkMode
                  )
                }
              >
                <span>
                  {darkMode
                    ? "🌙 Dark"
                    : "☀ Light"}
                </span>

                <span>→</span>
              </button>

            </div>

          </div>

          <button
            type="button"
            className="save-preferences-btn"
            onClick={savePreferences}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Preferences"}
          </button>

        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="settings-danger-card logout-settings">

          <div>
            <h2>
              Sign Out
            </h2>

            <p>
              Sign out from your Krishna Dry Cleaning
              account on this device.
            </p>
          </div>

          <button
            type="button"
            className="settings-logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

        

        <div className="settings-footer">

          <span>🔐</span>

          Your account information is protected and
          handled securely.

        </div>

      </div>
    </div>
  );
}

export default Settings;

