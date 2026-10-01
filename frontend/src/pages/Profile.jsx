import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/profile.css";

const API_URL = "http://localhost:2340";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [profileImage, setProfileImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD PROFILE FROM BACKEND
  // =====================================================

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Unable to load profile");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/");
          return;
        }

        const backendUser = data.user;

        setUser(backendUser);

        setName(backendUser.fullName || "");
        setEmail(backendUser.email || "");
        setMobile(backendUser.mobile || "");

        setProfileImage(
          backendUser.profileImage
            ? `${API_URL}${backendUser.profileImage}`
            : ""
        );

        // Save latest user
        localStorage.setItem(
          "user",
          JSON.stringify(backendUser)
        );
      } catch (error) {
        console.log("Profile Load Error:", error);

        alert(
          "Server se connect nahi ho pa raha. Backend check karo."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // =====================================================
  // PROFILE IMAGE SELECT
  // =====================================================

  const handleImageClick = () => {
    if (!isEditing) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Image validation
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    // 2 MB frontend limit
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2 MB.");
      return;
    }

    setSelectedFile(file);

    // Preview
    const previewUrl = URL.createObjectURL(file);

    setProfileImage(previewUrl);
  };

  // =====================================================
  // REMOVE PROFILE IMAGE
  // =====================================================

  const handleRemoveImage = () => {
    if (!isEditing) {
      return;
    }

    const confirmRemove = window.confirm(
      "Remove your profile picture?"
    );

    if (!confirmRemove) {
      return;
    }

    setProfileImage("");
    setSelectedFile(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      alert(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("fullName", name.trim());
      formData.append("mobile", mobile);
      formData.append("email", email);

      // New image selected
      if (selectedFile) {
        formData.append(
          "profileImage",
          selectedFile
        );
      }

      // Image removed
      if (!profileImage && !selectedFile) {
        formData.append(
          "removeProfileImage",
          "true"
        );
      }

      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Profile update failed"
        );

        return;
      }

      const updatedUser = data.user;

      setUser(updatedUser);

      setName(updatedUser.fullName || "");
      setEmail(updatedUser.email || "");
      setMobile(updatedUser.mobile || "");

      setProfileImage(
        updatedUser.profileImage
          ? `${API_URL}${updatedUser.profileImage}`
          : ""
      );

      setSelectedFile(null);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setIsEditing(false);

      alert(
        "Profile updated successfully."
      );
    } catch (error) {
      console.log(
        "Update Profile Error:",
        error
      );

      alert(
        "Server error. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    if (!user) {
      return;
    }

    setName(user.fullName || "");
    setEmail(user.email || "");
    setMobile(user.mobile || "");

    setProfileImage(
      user.profileImage
        ? `${API_URL}${user.profileImage}`
        : ""
    );

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsEditing(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(
          `${API_URL}/api/logout`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.log(
        "Logout API Error:",
        error
      );
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("mobile");
    localStorage.removeItem("profileImage");

    navigate("/");

    window.location.reload();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loader"></div>

        <p>
          Loading profile...
        </p>
      </div>
    );
  }

  // =====================================================
  // USER CHECK
  // =====================================================

  if (!user) {
    return null;
  }

  // =====================================================
  // AVATAR LETTER
  // =====================================================

  const avatarLetter = user.fullName
    ? user.fullName
        .charAt(0)
        .toUpperCase()
    : "U";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="profile-page">

      <div className="profile-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="profile-page-header">

          <div className="profile-heading">

            <span className="profile-label">
              MY ACCOUNT
            </span>

            <h1>
              Profile
            </h1>

            <p>
              Manage your personal information and
              account settings.
            </p>

          </div>

          <button
            className="profile-back-btn"
            onClick={() => navigate("/")}
          >
            <span>
              ←
            </span>

            Back to Home
          </button>

        </div>

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <div className="profile-hero">

          <div className="profile-hero-left">

            {/* PROFILE IMAGE */}

            <div className="profile-image-section">

              <div
                className={`profile-avatar ${
                  isEditing
                    ? "profile-avatar-editable"
                    : ""
                }`}
                onClick={handleImageClick}
              >

                {profileImage ? (

                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-avatar-image"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                ) : (

                  <span>
                    {avatarLetter}
                  </span>

                )}

                {/* CAMERA ICON */}

                {isEditing && (
                  <div
                    className="avatar-camera"
                    title="Change profile photo"
                  >
                    <span className="camera-icon">
                      📷
                    </span>
                  </div>
                )}

              </div>

              {/* Hidden file input */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                style={{
                  display: "none",
                }}
              />

              {/* =================================================
                  IMAGE ACTIONS
              ================================================= */}

              {isEditing && (

                <div className="profile-image-actions">

                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={handleImageClick}
                  >

                    <span className="photo-btn-icon">
                      📷
                    </span>

                    <span>
                      Change Photo
                    </span>

                  </button>

                  {profileImage && (

                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={handleRemoveImage}
                    >

                      <span className="remove-photo-icon">
                        🗑
                      </span>

                      <span>
                        Remove
                      </span>

                    </button>

                  )}

                </div>

              )}

              {isEditing && (
                <small className="photo-help-text">
                  JPG, PNG or WEBP • Max 2 MB
                </small>
              )}

            </div>

            {/* USER INFO */}

            <div className="profile-hero-info">

              <h2>
                {user.fullName || "User"}
              </h2>

              <p>
                {user.email}
              </p>

              <div className="verified-account">

                <span className="verified-icon">
                  ✓
                </span>

                <span>
                  Verified Account
                </span>

              </div>

            </div>

          </div>

          {/* EDIT BUTTON */}

          {!isEditing && (

            <button
              className="edit-profile-btn"
              onClick={() =>
                setIsEditing(true)
              }
            >

              <span>
                ✎
              </span>

              Edit Profile

            </button>

          )}

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="profile-grid">

          {/* PERSONAL INFORMATION */}

          <div className="profile-card personal-card">

            <div className="card-header">

              <div>

                <h3>
                  Personal Information
                </h3>

                <p>
                  Your basic account information
                </p>

              </div>

              <div className="card-header-icon">
                👤
              </div>

            </div>

            <div className="profile-form">

              {/* FULL NAME */}

              <div className="profile-field">

                <label>
                  Full Name
                </label>

                {isEditing ? (

                  <div className="input-wrapper">

                    <span className="field-icon">
                      👤
                    </span>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                    />

                  </div>

                ) : (

                  <div className="field-display">

                    <span className="field-display-icon">
                      👤
                    </span>

                    <span>
                      {user.fullName ||
                        "Not available"}
                    </span>

                  </div>

                )}

              </div>

              {/* EMAIL */}

              <div className="profile-field">

                <label>
                  Email Address
                </label>

                {isEditing ? (

                  <>
                    <div className="input-wrapper disabled-input">

                      <span className="field-icon">
                        ✉
                      </span>

                      <input
                        type="email"
                        value={email}
                        disabled
                      />

                    </div>

                    <small className="field-note">
                      Email address cannot be changed.
                    </small>
                  </>

                ) : (

                  <div className="field-display">

                    <span className="field-display-icon">
                      ✉
                    </span>

                    <span>
                      {user.email ||
                        "Not available"}
                    </span>

                  </div>

                )}

              </div>

              {/* MOBILE */}

              <div className="profile-field">

                <label>
                  Mobile Number
                </label>

                {isEditing ? (

                  <div className="mobile-input-wrapper">

                    <span className="mobile-code">
                      +91
                    </span>

                    <input
                      type="tel"
                      maxLength="10"
                      placeholder="Enter mobile number"
                      value={mobile}
                      onChange={(e) => {

                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setMobile(value);

                      }}
                    />

                  </div>

                ) : (

                  <div className="field-display">

                    <span className="field-display-icon">
                      📱
                    </span>

                    <span>
                      +91{" "}
                      {user.mobile ||
                        "Not available"}
                    </span>

                  </div>

                )}

              </div>

              {/* SAVE / CANCEL */}

              {isEditing && (

                <div className="profile-action-buttons">

                  <button
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    className="save-btn"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >

                    <span>
                      ✓
                    </span>

                    {saving
                      ? "Saving..."
                      : "Save Changes"}

                  </button>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="profile-right">

            {/* ACCOUNT STATUS */}

            <div className="profile-card status-card">

              <div className="side-card-header">

                <div>

                  <h3>
                    Account Status
                  </h3>

                  <p>
                    Current account status
                  </p>

                </div>

                <div className="status-header-icon">
                  ✓
                </div>

              </div>

              <div className="active-account">

                <div className="active-dot"></div>

                <div>

                  <strong>
                    Active Account
                  </strong>

                  <span>
                    Your account is active and secure.
                  </span>

                </div>

              </div>

            </div>

            {/* SECURITY */}

            <div className="profile-card security-card">

              <div className="security-top">

                <div className="security-icon">
                  🔒
                </div>

                <div>

                  <h3>
                    Account Security
                  </h3>

                  <p>
                    Your account is protected with
                    secure authentication.
                  </p>

                </div>

              </div>

              <div className="security-info">

                <div className="security-row">

                  <span>
                    Authentication
                  </span>

                  <strong>
                    Secure
                  </strong>

                </div>

                <div className="security-row">

                  <span>
                    Password
                  </span>

                  <strong>
                    ••••••••
                  </strong>

                </div>

              </div>

              {/* CHANGE PASSWORD */}

              <button
                className="change-password-btn"
                onClick={() =>
                  navigate("/settings")
                }
              >

                <span className="password-btn-icon">
                  🔒
                </span>

                <span className="password-btn-text">
                  Change Password
                </span>

                <span className="password-btn-arrow">
                  →
                </span>

              </button>

            </div>

            {/* LOGOUT */}

            <div className="logout-card">

              <div>

                <h3>
                  Sign out
                </h3>

                <p>
                  Sign out from your Krishna Dry
                  Cleaning account.
                </p>

              </div>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >

                <span>
                  ↪
                </span>

                Logout

              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            BOTTOM NOTE
        ================================================= */}

        <div className="profile-bottom-note">

          <span>
            🔐
          </span>

          Your personal information is kept secure
          and private.

        </div>

      </div>

    </div>
  );
}

export default Profile;