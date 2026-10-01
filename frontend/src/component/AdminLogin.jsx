
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminLogin.css";

const API_URL = "http://localhost:2340";

// =====================================================
// CREATE / GET PERMANENT DEVICE ID
// =====================================================

const getDeviceId = () => {
  let deviceId = localStorage.getItem(
    "adminDeviceId"
  );

  // Agar pehle se device ID hai to wahi use karo
  if (deviceId) {
    return deviceId;
  }

  // Nayi device ID create karo
  const newDeviceId =
    "admin-" +
    crypto.randomUUID();

  localStorage.setItem(
    "adminDeviceId",
    newDeviceId
  );

  return newDeviceId;
};

function AdminLogin() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // CLEAR OLD ADMIN SESSION
  // IMPORTANT:
  // adminDeviceId KO KABHI DELETE NAHI KARNA
  // =====================================================

  const clearOldSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    localStorage.removeItem("user");
    localStorage.removeItem("admin");

    localStorage.removeItem("userId");

    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("mobile");
    localStorage.removeItem("profileImage");

    localStorage.removeItem("loginActivity");

    localStorage.removeItem("adminSessionId");

    localStorage.removeItem("lastLogin");
    localStorage.removeItem("lastLoginIP");
    localStorage.removeItem("lastLoginDevice");
    localStorage.removeItem(
      "lastLoginDeviceType"
    );
    localStorage.removeItem(
      "lastLoginBrowser"
    );
    localStorage.removeItem(
      "lastLoginOS"
    );

    // =================================================
    // DO NOT REMOVE:
    //
    // localStorage.removeItem("adminDeviceId");
    //
    // Ye device ki permanent identity hai.
    // =================================================
  };

  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // GET PERMANENT DEVICE ID
      // =================================================

      const deviceId =
        getDeviceId();

      console.log(
        "ADMIN DEVICE ID:",
        deviceId
      );

      // =================================================
      // REMOVE OLD LOGIN SESSION
      // IMPORTANT:
      // DEVICE ID SAFE RAHEGI
      // =================================================

      clearOldSession();

      // =================================================
      // LOGIN API
      // =================================================

      const response =
        await fetch(
          `${API_URL}/api/admin/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password,

              // =========================================
              // MOST IMPORTANT
              // =========================================

              deviceId,
            }),
          }
        );

      // =================================================
      // SAFE RESPONSE
      // =================================================

      let data;

      try {
        data =
          await response.json();
      } catch (jsonError) {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      console.log(
        "ADMIN LOGIN RESPONSE:",
        data
      );

      // =================================================
      // BLOCKED DEVICE
      // =================================================

      if (
        response.status === 403 &&
        data.blocked === true
      ) {
        throw new Error(
          "This device has been blocked by the administrator. Please use another authorized device or contact the administrator."
        );
      }

      // =================================================
      // API ERROR
      // =================================================

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ||
            "Invalid email or password."
        );
      }

      // =================================================
      // TOKEN CHECK
      // =================================================

      if (!data.token) {
        throw new Error(
          "Login successful but token was not received."
        );
      }

      // =================================================
      // ADMIN DATA
      // =================================================

      const admin =
        data.admin ||
        data.user;

      if (!admin) {
        throw new Error(
          "Admin information was not received."
        );
      }

      // =================================================
      // SAVE JWT TOKEN
      // =================================================

      localStorage.setItem(
        "token",
        data.token
      );

      // Compatibility
      localStorage.setItem(
        "adminToken",
        data.token
      );

      // =================================================
      // SAVE ADMIN OBJECT
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(admin)
      );

      // =================================================
      // ADMIN FLAG
      // =================================================

      localStorage.setItem(
        "admin",
        "true"
      );

      // =================================================
      // ADMIN ID
      // =================================================

      if (admin._id) {
        localStorage.setItem(
          "userId",
          admin._id
        );
      }

      // =================================================
      // ADMIN NAME
      // =================================================

      if (admin.fullName) {
        localStorage.setItem(
          "name",
          admin.fullName
        );
      }

      // =================================================
      // ADMIN EMAIL
      // =================================================

      if (admin.email) {
        localStorage.setItem(
          "email",
          admin.email
        );
      }

      // =================================================
      // ADMIN MOBILE
      // =================================================

      if (admin.mobile) {
        localStorage.setItem(
          "mobile",
          admin.mobile
        );
      }

      // =================================================
      // PROFILE IMAGE
      // =================================================

      if (admin.profileImage) {
        localStorage.setItem(
          "profileImage",
          admin.profileImage
        );
      }

      // =================================================
      // LOGIN ACTIVITY
      // =================================================

      if (data.loginActivity) {
        localStorage.setItem(
          "loginActivity",
          JSON.stringify(
            data.loginActivity
          )
        );
      }

      // =================================================
      // SESSION ID
      // =================================================

      if (
        data.sessionId
      ) {
        localStorage.setItem(
          "adminSessionId",
          data.sessionId
        );
      } else if (
        data.loginActivity &&
        data.loginActivity.sessionId
      ) {
        localStorage.setItem(
          "adminSessionId",
          data.loginActivity.sessionId
        );
      }

      // =================================================
      // DEVICE ID
      // =================================================

      // Backend se deviceId aaye to update kar do
      // warna existing permanent ID safe rahegi.

      if (
        data.loginActivity &&
        data.loginActivity.deviceId
      ) {
        localStorage.setItem(
          "adminDeviceId",
          data.loginActivity.deviceId
        );
      }

      // =================================================
      // LAST LOGIN
      // =================================================

      if (admin.lastLogin) {
        localStorage.setItem(
          "lastLogin",
          admin.lastLogin
        );
      }

      if (admin.lastLoginIP) {
        localStorage.setItem(
          "lastLoginIP",
          admin.lastLoginIP
        );
      }

      if (
        admin.lastLoginDevice
      ) {
        localStorage.setItem(
          "lastLoginDevice",
          admin.lastLoginDevice
        );
      }

      if (
        admin.lastLoginDeviceType
      ) {
        localStorage.setItem(
          "lastLoginDeviceType",
          admin.lastLoginDeviceType
        );
      }

      if (
        admin.lastLoginBrowser
      ) {
        localStorage.setItem(
          "lastLoginBrowser",
          admin.lastLoginBrowser
        );
      }

      if (
        admin.lastLoginOS
      ) {
        localStorage.setItem(
          "lastLoginOS",
          admin.lastLoginOS
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Login successful! Opening dashboard..."
      );

      // =================================================
      // GO TO DASHBOARD
      // =================================================

      setTimeout(() => {
        navigate("/dash", {
          replace: true,
        });
      }, 500);

    } catch (error) {
      console.error(
        "Admin Login Error:",
        error
      );

      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="admin-login-page">

      {/* =================================================
          LEFT BRAND SECTION
      ================================================= */}

      <div className="admin-login-brand">

        <div className="brand-content">

          <div className="brand-logo">
            K
          </div>

          <h1>
            KRISHNA
          </h1>

          <span>
            DRY CLEANING
          </span>

          <div className="brand-line"></div>

          <p>
            Professional cleaning,
            <br />
            trusted service.
          </p>

        </div>

        <div className="brand-footer">
          © {new Date().getFullYear()} Krishna
          Dry Cleaning
        </div>

      </div>

      {/* =================================================
          LOGIN SECTION
      ================================================= */}

      <div className="admin-login-section">

        <div className="admin-login-card">

          {/* HEADER */}

          <div className="login-header">

            <div className="mobile-logo">
              K
            </div>

            <span className="login-eyebrow">
              ADMIN PORTAL
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to access your
              administration dashboard.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="login-alert error">

              <span>
                !
              </span>

              <p>
                {error}
              </p>

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="login-alert success">

              <span>
                ✓
              </span>

              <p>
                {success}
              </p>

            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleLogin}
            className="admin-login-form"
          >

            {/* EMAIL */}

            <div className="login-form-group">

              <label>
                Email Address
              </label>

              <div className="login-input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="login-form-group">

              <div className="password-label-row">

                <label>
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => {
                    alert(
                      "Please contact the system administrator to reset your password."
                    );
                  }}
                  disabled={loading}
                >
                  Forgot password?
                </button>

              </div>

              <div className="login-input-wrapper">

                <span className="input-icon">
                  ♢
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "◉"
                    : "◌"}
                </button>

              </div>

            </div>

            {/* REMEMBER ME */}

            <div className="login-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                  disabled={loading}
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="login-spinner"></span>

                  Signing in...
                </>
              ) : (
                <>
                  Sign In

                  <span>
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* SECURITY */}

          <div className="login-security">

            <span>
              ♢
            </span>

            <p>
              Secure administrator access
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;

