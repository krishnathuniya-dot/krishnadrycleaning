
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/profile.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [profileImage, setProfileImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // CLOUDINARY + BACKEND IMAGE URL
  // =====================================================

  const getMediaUrl = (image) => {
    if (!image || typeof image !== "string") {
      return "";
    }

    // Cloudinary ya complete image URL
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    // Temporary browser preview
    if (image.startsWith("blob:")) {
      return image;
    }

    // Purana backend upload path
    return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // =====================================================
  // CLEAN UP TEMPORARY IMAGE PREVIEW
  // =====================================================

  const clearPreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
  };

  // =====================================================
  // LOAD PROFILE FROM BACKEND
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          if (isMounted) {
            alert(data.message || "Unable to load profile");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/", { replace: true });
          }
          return;
        }

        const backendUser =
          data?.user ||
          data?.data?.user ||
          data?.data;

        if (!backendUser) {
          throw new Error("User data was not returned by the server.");
        }

        if (!isMounted) return;

        setUser(backendUser);
        setName(backendUser.fullName || "");
        setEmail(backendUser.email || "");
        setMobile(String(backendUser.mobile || ""));

        const imageUrl = getMediaUrl(backendUser.profileImage);

        setProfileImage(imageUrl);

        localStorage.setItem("user", JSON.stringify(backendUser));

        if (backendUser.profileImage) {
          localStorage.setItem(
            "profileImage",
            backendUser.profileImage
          );
        } else {
          localStorage.removeItem("profileImage");
        }
      } catch (error) {
        console.error("Profile Load Error:", error);

        if (isMounted) {
          alert(
            "Server se connect nahi ho pa raha. Backend check karo."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
      clearPreviewUrl();
    };
  }, [navigate]);

  // =====================================================
  // PROFILE IMAGE SELECT
  // =====================================================

  const handleImageClick = () => {
    if (!isEditing || saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2 MB.");
      e.target.value = "";
      return;
    }

    clearPreviewUrl();

    const previewUrl = URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setSelectedFile(file);
    setProfileImage(previewUrl);
    setRemoveImage(false);
  };

  // =====================================================
  // REMOVE PROFILE IMAGE
  // =====================================================

  const handleRemoveImage = () => {
    if (!isEditing || saving || !profileImage) {
      return;
    }

    const confirmRemove = window.confirm(
      "Remove your profile picture?"
    );

    if (!confirmRemove) {
      return;
    }

    clearPreviewUrl();

    setProfileImage("");
    setSelectedFile(null);
    setRemoveImage(true);

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
      navigate("/", { replace: true });
      return;
    }

    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("fullName", name.trim());
      formData.append("mobile", mobile);
      formData.append("email", email);

      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      if (removeImage) {
        formData.append("removeProfileImage", "true");
      }

      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(data.message || "Profile update failed");
        return;
      }

      const updatedUser =
        data?.user ||
        data?.data?.user ||
        data?.data;

      if (!updatedUser) {
        alert(
          "Profile update response mein user data nahi mila. Backend response check karo."
        );
        return;
      }

      clearPreviewUrl();

      setUser(updatedUser);
      setName(updatedUser.fullName || "");
      setEmail(updatedUser.email || "");
      setMobile(String(updatedUser.mobile || ""));

      const imageUrl = getMediaUrl(updatedUser.profileImage);

      setProfileImage(imageUrl);
      setSelectedFile(null);
      setRemoveImage(false);
      setIsEditing(false);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (updatedUser.profileImage) {
        localStorage.setItem(
          "profileImage",
          updatedUser.profileImage
        );
      } else {
        localStorage.removeItem("profileImage");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Update Profile Error:", error);
      alert("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    if (!user || saving) {
      return;
    }

    clearPreviewUrl();

    setName(user.fullName || "");
    setEmail(user.email || "");
    setMobile(String(user.mobile || ""));

    setProfileImage(getMediaUrl(user.profileImage));
    setSelectedFile(null);
    setRemoveImage(false);

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
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API Error:", error);
    }

    clearPreviewUrl();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("mobile");
    localStorage.removeItem("profileImage");

    navigate("/", { replace: true });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loader"></div>
        <p>Loading profile...</p>
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
    ? user.fullName.charAt(0).toUpperCase()
    : "U";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* PAGE HEADER */}
        <div className="profile-page-header">
          <div className="profile-heading">
            <span className="profile-label">MY ACCOUNT</span>

            <h1>Profile</h1>

            <p>
              Manage your personal information and account settings.
            </p>
          </div>

          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate("/")}
          >
            <span>←</span>
            Back to Home
          </button>
        </div>

        {/* PROFILE HERO */}
        <div className="profile-hero">
          <div className="profile-hero-left">
            <div className="profile-image-section">
              <div
                className={`profile-avatar ${
                  isEditing ? "profile-avatar-editable" : ""
                }`}
                onClick={handleImageClick}
                role={isEditing ? "button" : undefined}
                tabIndex={isEditing ? 0 : undefined}
                onKeyDown={(e) => {
                  if (
                    isEditing &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    e.preventDefault();
                    handleImageClick();
                  }
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-avatar-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span>{avatarLetter}</span>
                )}

                {isEditing && (
                  <div
                    className="avatar-camera"
                    title="Change profile photo"
                  >
                    <span className="camera-icon">📷</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              {isEditing && (
                <div className="profile-image-actions">
                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={handleImageClick}
                    disabled={saving}
                  >
                    <span className="photo-btn-icon">📷</span>
                    <span>Change Photo</span>
                  </button>

                  {profileImage && (
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={handleRemoveImage}
                      disabled={saving}
                    >
                      <span className="remove-photo-icon">🗑</span>
                      <span>Remove</span>
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

            <div className="profile-hero-info">
              <h2>{user.fullName || "User"}</h2>
              <p>{user.email}</p>

              <div className="verified-account">
                <span className="verified-icon">✓</span>
                <span>Verified Account</span>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              <span>✎</span>
              Edit Profile
            </button>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="profile-grid">
          {/* PERSONAL INFORMATION */}
          <div className="profile-card personal-card">
            <div className="card-header">
              <div>
                <h3>Personal Information</h3>
                <p>Your basic account information</p>
              </div>

              <div className="card-header-icon">👤</div>
            </div>

            <div className="profile-form">
              {/* FULL NAME */}
              <div className="profile-field">
                <label>Full Name</label>

                {isEditing ? (
                  <div className="input-wrapper">
                    <span className="field-icon">👤</span>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                ) : (
                  <div className="field-display">
                    <span className="field-display-icon">👤</span>
                    <span>{user.fullName || "Not available"}</span>
                  </div>
                )}
              </div>

              {/* EMAIL */}
              <div className="profile-field">
                <label>Email Address</label>

                {isEditing ? (
                  <>
                    <div className="input-wrapper disabled-input">
                      <span className="field-icon">✉</span>

                      <input
                        type="email"
                        value={email}
                        disabled
                        readOnly
                      />
                    </div>

                    <small className="field-note">
                      Email address cannot be changed.
                    </small>
                  </>
                ) : (
                  <div className="field-display">
                    <span className="field-display-icon">✉</span>
                    <span>{user.email || "Not available"}</span>
                  </div>
                )}
              </div>

              {/* MOBILE */}
              <div className="profile-field">
                <label>Mobile Number</label>

                {isEditing ? (
                  <div className="mobile-input-wrapper">
                    <span className="mobile-code">+91</span>

                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Enter mobile number"
                      value={mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setMobile(value);
                      }}
                      disabled={saving}
                    />
                  </div>
                ) : (
                  <div className="field-display">
                    <span className="field-display-icon">📱</span>
                    <span>
                      +91 {user.mobile || "Not available"}
                    </span>
                  </div>
                )}
              </div>

              {/* SAVE / CANCEL */}
              {isEditing && (
                <div className="profile-action-buttons">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="save-btn"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    <span>✓</span>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="profile-right">
            {/* ACCOUNT STATUS */}
            <div className="profile-card status-card">
              <div className="side-card-header">
                <div>
                  <h3>Account Status</h3>
                  <p>Current account status</p>
                </div>

                <div className="status-header-icon">✓</div>
              </div>

              <div className="active-account">
                <div className="active-dot"></div>

                <div>
                  <strong>Active Account</strong>
                  <span>Your account is active and secure.</span>
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="profile-card security-card">
              <div className="security-top">
                <div className="security-icon">🔒</div>

                <div>
                  <h3>Account Security</h3>
                  <p>
                    Your account is protected with secure
                    authentication.
                  </p>
                </div>
              </div>

              <div className="security-info">
                <div className="security-row">
                  <span>Authentication</span>
                  <strong>Secure</strong>
                </div>

                <div className="security-row">
                  <span>Password</span>
                  <strong>••••••••</strong>
                </div>
              </div>

              <button
                type="button"
                className="change-password-btn"
                onClick={() => navigate("/settings")}
              >
                <span className="password-btn-icon">🔒</span>
                <span className="password-btn-text">
                  Change Password
                </span>
                <span className="password-btn-arrow">→</span>
              </button>
            </div>

            {/* LOGOUT */}
            <div className="logout-card">
              <div>
                <h3>Sign out</h3>
                <p>
                  Sign out from your Krishna Dry Cleaning account.
                </p>
              </div>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                <span>↪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM NOTE */}
        <div className="profile-bottom-note">
          <span>🔐</span>
          Your personal information is kept secure and private.
        </div>
      </div>
    </div>
  );
}

export default Profile;
