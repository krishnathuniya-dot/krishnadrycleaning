
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";
import "../css/AdminLayout.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

function Adminlayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // =========================================
  // LOAD SAVED ADMIN
  // =========================================

  useEffect(() => {
    const loadAdmin = () => {
      const savedAdmin = localStorage.getItem("admin");

      if (!savedAdmin) {
        setAdmin(null);
        return;
      }

      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        console.error("Admin parse error:", error);
        setAdmin(null);
      }
    };

    loadAdmin();
  }, []);

  // =========================================
  // FETCH ADMIN PROFILE
  // =========================================

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setAdmin(null);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Admin profile error:",
          data?.message || response.status
        );
        return;
      }

      const adminData =
        data?.admin ||
        data?.data?.admin ||
        data?.data ||
        null;

      if (adminData) {
        localStorage.setItem(
          "admin",
          JSON.stringify(adminData)
        );

        setAdmin(adminData);
      }
    } catch (error) {
      console.error("Admin profile fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // =========================================
  // NOTIFICATION COUNT
  // =========================================

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setNotificationCount(0);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        setNotificationCount(Number(data?.count) || 0);
      }
    } catch (error) {
      console.error("Notification count error:", error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    fetchNotificationCount();
  }, [location.pathname]);

  // =========================================
  // CLOUDINARY / BACKEND PROFILE IMAGE
  // =========================================

  const getProfileImage = () => {
    const image =
      admin?.profileImage ||
      localStorage.getItem("adminProfileImage") ||
      "";

    if (!image || typeof image !== "string") {
      return "";
    }

    // Cloudinary ya koi complete image URL
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    // Temporary browser preview
    if (image.startsWith("blob:")) {
      return image;
    }

    // Old backend upload path
    return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const profileImage = getProfileImage();

  // =========================================
  // ADMIN DETAILS
  // =========================================

  const adminName =
    admin?.fullName ||
    admin?.name ||
    localStorage.getItem("adminName") ||
    "Krishna Admin";

  const adminEmail =
    admin?.email ||
    localStorage.getItem("adminEmail") ||
    "Administrator";

  const adminRole = admin?.role || "admin";

  const avatarLetter = adminName?.charAt(0)?.toUpperCase() || "K";

  // =========================================
  // MENU
  // =========================================

  const menuItems = [
    {
      section: "OVERVIEW",
      items: [
        { name: "Dashboard", path: "/dash", icon: "▦" },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { name: "Customers", path: "/admin/customers", icon: "♙" },
        { name: "Reviews", path: "/admin/reviews", icon: "★" },
        { name: "Services", path: "/admin/shopmanage", icon: "◇" },
        { name: "Rate List", path: "/admin/rates", icon: "₹" },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        {
          name: "Notifications",
          path: "/admin/notifications",
          icon: "♢",
        },
        { name: "Reports", path: "/admin/reports", icon: "▥" },
        { name: "Settings", path: "/admin/settings", icon: "⚙" },
      ],
    },
  ];

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminSessionId");
    localStorage.removeItem("loginActivity");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminProfileImage");

    // adminDeviceId ko intentionally preserve kar rahe hain.
    setAdmin(null);
    setProfileOpen(false);
    setMobileOpen(false);
    setNotificationCount(0);

    navigate("/admin", { replace: true });
  };

  // =========================================
  // PAGE TITLE
  // =========================================

  const getPageTitle = () => {
    if (location.pathname === "/dash") {
      return "Dashboard";
    }

    const currentItem = menuItems
      .flatMap((section) => section.items)
      .find((item) => location.pathname === item.path);

    return currentItem?.name || "Admin Panel";
  };

  // =========================================
  // REUSABLE PROFILE AVATAR
  // =========================================

  const ProfileAvatar = ({ className = "", large = false }) => (
    <div className="admin-avatar-container">
      {profileImage && (
        <img
          src={profileImage}
          alt={adminName}
          className={`${className} ${large ? "profile-avatar-large" : ""}`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      <div
        className={`${className} ${
          large ? "profile-avatar-large" : ""
        } profile-letter-avatar`}
        style={{ display: profileImage ? "none" : "flex" }}
      >
        {avatarLetter}
      </div>
    </div>
  );

  const openNotifications = () => {
    setProfileOpen(false);
    navigate("/admin/notifications");
  };

  const openSettings = () => {
    setProfileOpen(false);
    navigate("/admin/settings");
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div
      className={`admin-layout ${
        collapsed ? "sidebar-collapsed" : ""
      } ${mobileOpen ? "mobile-sidebar-open" : ""}`}
    >
      {mobileOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <NavLink
            to="/dash"
            className="admin-brand"
            onClick={() => setMobileOpen(false)}
          >
            <div className="admin-logo-icon">K</div>

            <div className="admin-logo-text">
              <strong>KRISHNA</strong>
              <span>DRY CLEANING</span>
            </div>
          </NavLink>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* ADMIN STATUS */}
        <div className="admin-status-card">
          <div className="status-avatar-wrapper">
            <ProfileAvatar
              className="status-avatar status-avatar-image"
            />
          </div>

          <div className="status-info">
            <strong>{adminName}</strong>
            <span>
              <i></i>
              Online
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="admin-navigation">
          {menuItems.map((section) => (
            <div
              className="admin-menu-section"
              key={section.section}
            >
              <div className="admin-section-title">
                {section.section}
              </div>

              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dash"}
                  className={({ isActive }) =>
                    isActive
                      ? "admin-menu-item active"
                      : "admin-menu-item"
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="admin-menu-icon">
                    {item.icon}
                  </span>

                  <span className="admin-menu-name">
                    {item.name}
                  </span>

                  {item.path === "/admin/notifications" &&
                    notificationCount > 0 && (
                      <span className="admin-menu-badge">
                        {notificationCount > 99
                          ? "99+"
                          : notificationCount}
                      </span>
                    )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="admin-sidebar-footer">
          <div className="admin-help-card">
            <div className="help-icon">?</div>
            <div className="help-content">
              <strong>Need Help?</strong>
              <span>Contact support</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <span className="logout-icon">↪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              ☰
            </button>

            <div className="breadcrumb-area">
              <div className="breadcrumb">
                <span>Admin</span>
                <b>/</b>
                <strong>{getPageTitle()}</strong>
              </div>

              <h1>{getPageTitle()}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="topbar-icon-btn"
              title="Search"
            >
              ⌕
            </button>

            <button
              type="button"
              className="topbar-icon-btn notification-btn"
              title="Notifications"
              onClick={openNotifications}
            >
              ♢

              {notificationCount > 0 && (
                <span className="notification-count">
                  {notificationCount > 99
                    ? "99+"
                    : notificationCount}
                </span>
              )}
            </button>

            <div className="topbar-divider"></div>

            {/* PROFILE DROPDOWN */}
            <div className="topbar-profile-container">
              <button
                type="button"
                className="topbar-profile"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <div className="topbar-avatar-wrapper">
                  <ProfileAvatar
                    className="topbar-avatar topbar-avatar-image"
                  />
                </div>

                <div className="topbar-profile-info">
                  <strong>{adminName}</strong>
                  <span>{adminRole}</span>
                </div>

                <span
                  className={
                    profileOpen
                      ? "topbar-profile-arrow rotate"
                      : "topbar-profile-arrow"
                  }
                >
                  ▾
                </span>
              </button>

              {profileOpen && (
                <div className="admin-profile-dropdown">
                  <div className="profile-dropdown-user">
                    <div className="dropdown-big-avatar-wrapper">
                      <ProfileAvatar
                        className="dropdown-big-avatar dropdown-profile-image"
                        large
                      />
                    </div>

                    <div>
                      <strong>{adminName}</strong>
                      <span>{adminEmail}</span>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider"></div>

                  <button type="button" onClick={openSettings}>
                    <span>⚙</span>
                    Account Settings
                  </button>

                  <button
                    type="button"
                    onClick={openNotifications}
                  >
                    <span>♢</span>
                    Notifications

                    {notificationCount > 0 && (
                      <span
                        className="dropdown-notification-count"
                        style={{ marginLeft: "auto" }}
                      >
                        {notificationCount > 99
                          ? "99+"
                          : notificationCount}
                      </span>
                    )}
                  </button>

                  <div className="profile-dropdown-divider"></div>

                  <button
                    type="button"
                    className="dropdown-logout"
                    onClick={handleLogout}
                  >
                    <span>↪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="admin-content">
          <Outlet />
        </section>

        {/* FOOTER */}
        <footer className="admin-footer">
          <span>
            © {new Date().getFullYear()} Krishna Dry Cleaning
          </span>
          <span>Admin Panel</span>
        </footer>
      </main>
    </div>
  );
}

export default Adminlayout;
