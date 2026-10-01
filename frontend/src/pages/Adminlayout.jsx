
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import "../css/AdminLayout.css";

const API_URL = "http://localhost:2340";

function Adminlayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // STATES
  // =====================================================

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [admin, setAdmin] = useState(null);

  const [notificationCount, setNotificationCount] = useState(0);

  // =====================================================
  // LOAD ADMIN DATA
  // =====================================================

  useEffect(() => {
    const loadAdmin = () => {
      const savedAdmin = localStorage.getItem("admin");

      if (!savedAdmin) {
        setAdmin(null);
        return;
      }

      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        setAdmin(parsedAdmin);
      } catch (error) {
        console.error("Admin parse error:", error);
        setAdmin(null);
      }
    };

    loadAdmin();
  }, []);

  // =====================================================
  // GET ADMIN PROFILE FROM BACKEND
  // =====================================================

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
            "Content-Type": "application/json",
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch (error) {
        data = {};
      }

      if (!response.ok) {
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
      console.error(
        "Admin profile fetch error:",
        error
      );
    }
  };

  // =====================================================
  // LOAD ADMIN PROFILE ON MOUNT
  // =====================================================

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // =====================================================
  // NOTIFICATION COUNT
  // =====================================================

  const fetchNotificationCount = async () => {
    try {
      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        setNotificationCount(0);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/unread-count`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch (error) {
        data = {};
      }

      if (response.ok) {
        setNotificationCount(
          Number(data?.count) || 0
        );
      } else {
        console.log(
          "Notification count error:",
          data?.message
        );
      }
    } catch (error) {
      console.error(
        "Notification count fetch error:",
        error
      );
    }
  };

  // =====================================================
  // NOTIFICATION COUNT ON LOAD
  // =====================================================

  useEffect(() => {
    fetchNotificationCount();

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =====================================================
  // CLOSE MOBILE SIDEBAR / PROFILE
  // =====================================================

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);

    fetchNotificationCount();
  }, [location.pathname]);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const getProfileImage = () => {
    const image =
      admin?.profileImage ||
      localStorage.getItem("adminProfileImage") ||
      "";

    if (!image) {
      return "";
    }

    // Full URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    // Backend relative path
    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  const profileImage = getProfileImage();

  // =====================================================
  // ADMIN NAME
  // =====================================================

  const adminName =
    admin?.fullName ||
    admin?.name ||
    localStorage.getItem("adminName") ||
    "Krishna Admin";

  // =====================================================
  // ADMIN EMAIL
  // =====================================================

  const adminEmail =
    admin?.email ||
    localStorage.getItem("adminEmail") ||
    "Administrator";

  // =====================================================
  // ADMIN ROLE
  // =====================================================

  const adminRole =
    admin?.role ||
    "admin";

  // =====================================================
  // AVATAR LETTER
  // =====================================================

  const avatarLetter =
    adminName?.charAt(0)?.toUpperCase() || "K";

  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = [
    {
      section: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          path: "/dash",
          icon: "▦",
        },
      ],
    },

    {
      section: "MANAGEMENT",
      items: [
        {
          name: "Customers",
          path: "/admin/customers",
          icon: "♙",
        },

        {
          name: "Reviews",
          path: "/admin/reviews",
          icon: "★",
        },

        {
          name: "Services",
          path: "/admin/shopmanage",
          icon: "◇",
        },

        {
          name: "Rate List",
          path: "/admin/rates",
          icon: "₹",
        },
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

        {
          name: "Reports",
          path: "/admin/reports",
          icon: "▥",
        },

        {
          name: "Settings",
          path: "/admin/settings",
          icon: "⚙",
        },
      ],
    },
  ];

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

    // =================================================
    // REMOVE ADMIN AUTH DATA
    // =================================================

    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminSessionId");
    localStorage.removeItem("loginActivity");

    // Admin profile data
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminProfileImage");

    // =================================================
    // IMPORTANT
    // =================================================
    // adminDeviceId ko remove nahi karna.
    // Ye permanent browser/device identity hai.

    setAdmin(null);
    setProfileOpen(false);
    setMobileOpen(false);
    setNotificationCount(0);

    // Admin login page
    navigate("/admin", {
      replace: true,
    });
  };

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const getPageTitle = () => {
    if (location.pathname === "/dash") {
      return "Dashboard";
    }

    const currentItem = menuItems
      .flatMap((section) => section.items)
      .find(
        (item) =>
          location.pathname === item.path
      );

    return (
      currentItem?.name ||
      "Admin Panel"
    );
  };

  // =====================================================
  // PROFILE AVATAR COMPONENT
  // =====================================================

  const ProfileAvatar = ({
    className = "",
    large = false,
  }) => {
    if (profileImage) {
      return (
        <>
          <img
            src={profileImage}
            alt={adminName}
            className={`${className} ${
              large
                ? "profile-avatar-large"
                : ""
            }`}
            onError={(e) => {
              e.currentTarget.style.display =
                "none";

              const fallback =
                e.currentTarget
                  .nextElementSibling;

              if (fallback) {
                fallback.style.display =
                  "flex";
              }
            }}
          />

          <div
            className={`${className} ${
              large
                ? "profile-avatar-large"
                : ""
            } profile-letter-avatar`}
            style={{
              display: "none",
            }}
          >
            {avatarLetter}
          </div>
        </>
      );
    }

    return (
      <div
        className={`${className} ${
          large
            ? "profile-avatar-large"
            : ""
        } profile-letter-avatar`}
      >
        {avatarLetter}
      </div>
    );
  };

  // =====================================================
  // OPEN NOTIFICATIONS
  // =====================================================

  const openNotifications = () => {
    setProfileOpen(false);

    navigate(
      "/admin/notifications"
    );
  };

  // =====================================================
  // ACCOUNT SETTINGS
  // =====================================================

  const openSettings = () => {
    setProfileOpen(false);

    navigate(
      "/admin/settings"
    );
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div
      className={`
        admin-layout
        ${collapsed ? "sidebar-collapsed" : ""}
        ${
          mobileOpen
            ? "mobile-sidebar-open"
            : ""
        }
      `}
    >

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}

        <div className="admin-sidebar-header">

          <NavLink
            to="/dash"
            className="admin-brand"
            onClick={() =>
              setMobileOpen(false)
            }
          >

            <div className="admin-logo-icon">
              K
            </div>

            <div className="admin-logo-text">
              <strong>
                KRISHNA
              </strong>

              <span>
                DRY CLEANING
              </span>
            </div>

          </NavLink>

          {/* DESKTOP COLLAPSE */}

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() =>
              setCollapsed(
                !collapsed
              )
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed
              ? "›"
              : "‹"}
          </button>

        </div>

        {/* =================================================
            ADMIN STATUS
        ================================================= */}

        <div className="admin-status-card">

          <div className="status-avatar-wrapper">

            {profileImage ? (
              <>

                <img
                  src={profileImage}
                  alt={adminName}
                  className="status-avatar status-avatar-image"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";

                    const fallback =
                      e.currentTarget
                        .nextElementSibling;

                    if (fallback) {
                      fallback.style.display =
                        "flex";
                    }
                  }}
                />

                <div
                  className="status-avatar status-avatar-fallback"
                  style={{
                    display: "none",
                  }}
                >
                  {avatarLetter}
                </div>

              </>
            ) : (

              <div
                className="status-avatar status-avatar-fallback"
                style={{
                  display: "flex",
                }}
              >
                {avatarLetter}
              </div>

            )}

          </div>

          <div className="status-info">

            <strong>
              {adminName}
            </strong>

            <span>
              <i></i>
              Online
            </span>

          </div>

        </div>

        {/* =================================================
            MENU
        ================================================= */}

        <nav className="admin-navigation">

          {menuItems.map(
            (section) => (

              <div
                className="admin-menu-section"
                key={section.section}
              >

                <div className="admin-section-title">
                  {section.section}
                </div>

                {section.items.map(
                  (item) => (

                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={
                        item.path ===
                        "/dash"
                      }
                      className={({
                        isActive,
                      }) =>
                        isActive
                          ? "admin-menu-item active"
                          : "admin-menu-item"
                      }
                      onClick={() =>
                        setMobileOpen(
                          false
                        )
                      }
                    >

                      <span className="admin-menu-icon">
                        {item.icon}
                      </span>

                      <span className="admin-menu-name">
                        {item.name}
                      </span>

                      {/* NOTIFICATION COUNT */}

                      {item.path ===
                        "/admin/notifications" &&
                        notificationCount >
                          0 && (
                          <span className="admin-menu-badge">

                            {notificationCount >
                            99
                              ? "99+"
                              : notificationCount}

                          </span>
                        )}

                    </NavLink>

                  )
                )}

              </div>

            )
          )}

        </nav>

        {/* =================================================
            SIDEBAR FOOTER
        ================================================= */}

        <div className="admin-sidebar-footer">

          {/* HELP */}

          <div className="admin-help-card">

            <div className="help-icon">
              ?
            </div>

            <div className="help-content">

              <strong>
                Need Help?
              </strong>

              <span>
                Contact support
              </span>

            </div>

          </div>

          {/* LOGOUT */}

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >

            <span className="logout-icon">
              ↪
            </span>

            <span className="logout-text">
              Logout
            </span>

          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="admin-main">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="admin-topbar">

          {/* LEFT */}

          <div className="topbar-left">

            {/* MOBILE MENU */}

            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setMobileOpen(
                  !mobileOpen
                )
              }
            >
              ☰
            </button>

            <div className="breadcrumb-area">

              <div className="breadcrumb">

                <span>
                  Admin
                </span>

                <b>
                  /
                </b>

                <strong>
                  {getPageTitle()}
                </strong>

              </div>

              <h1>
                {getPageTitle()}
              </h1>

            </div>

          </div>

          {/* RIGHT */}

          <div className="topbar-right">

            {/* SEARCH */}

            <button
              type="button"
              className="topbar-icon-btn"
              title="Search"
            >
              ⌕
            </button>

            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <button
              type="button"
              className="topbar-icon-btn notification-btn"
              title="Notifications"
              onClick={
                openNotifications
              }
            >

              ♢

              {notificationCount >
                0 && (
                <span className="notification-count">

                  {notificationCount >
                  99
                    ? "99+"
                    : notificationCount}

                </span>
              )}

            </button>

            {/* DIVIDER */}

            <div className="topbar-divider"></div>

            {/* =================================================
                ADMIN PROFILE
            ================================================= */}

            <div className="topbar-profile-container">

              <button
                type="button"
                className="topbar-profile"
                onClick={() =>
                  setProfileOpen(
                    !profileOpen
                  )
                }
              >

                <div className="topbar-avatar-wrapper">

                  {profileImage ? (
                    <>

                      <img
                        src={profileImage}
                        alt={adminName}
                        className="topbar-avatar topbar-avatar-image"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";

                          const fallback =
                            e.currentTarget
                              .nextElementSibling;

                          if (fallback) {
                            fallback.style.display =
                              "flex";
                          }
                        }}
                      />

                      <div
                        className="topbar-avatar topbar-avatar-fallback"
                        style={{
                          display:
                            "none",
                        }}
                      >
                        {avatarLetter}
                      </div>

                    </>
                  ) : (

                    <div
                      className="topbar-avatar topbar-avatar-fallback"
                      style={{
                        display:
                          "flex",
                      }}
                    >
                      {avatarLetter}
                    </div>

                  )}

                </div>

                <div className="topbar-profile-info">

                  <strong>
                    {adminName}
                  </strong>

                  <span>
                    {adminRole}
                  </span>

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

              {/* =================================================
                  PROFILE DROPDOWN
              ================================================= */}

              {profileOpen && (

                <div className="admin-profile-dropdown">

                  {/* USER */}

                  <div className="profile-dropdown-user">

                    <div className="dropdown-big-avatar-wrapper">

                      {profileImage ? (
                        <>

                          <img
                            src={
                              profileImage
                            }
                            alt={
                              adminName
                            }
                            className="dropdown-big-avatar dropdown-profile-image"
                            onError={(
                              e
                            ) => {
                              e.currentTarget.style.display =
                                "none";

                              const fallback =
                                e.currentTarget
                                  .nextElementSibling;

                              if (
                                fallback
                              ) {
                                fallback.style.display =
                                  "flex";
                              }
                            }}
                          />

                          <div
                            className="dropdown-big-avatar dropdown-avatar-fallback"
                            style={{
                              display:
                                "none",
                            }}
                          >
                            {
                              avatarLetter
                            }
                          </div>

                        </>
                      ) : (

                        <div
                          className="dropdown-big-avatar dropdown-avatar-fallback"
                          style={{
                            display:
                              "flex",
                          }}
                        >
                          {
                            avatarLetter
                          }
                        </div>

                      )}

                    </div>

                    <div>

                      <strong>
                        {adminName}
                      </strong>

                      <span>
                        {adminEmail}
                      </span>

                    </div>

                  </div>

                  <div className="profile-dropdown-divider"></div>

                  {/* ACCOUNT SETTINGS */}

                  <button
                    type="button"
                    onClick={
                      openSettings
                    }
                  >

                    <span>
                      ⚙
                    </span>

                    Account Settings

                  </button>

                  {/* NOTIFICATIONS */}

                  <button
                    type="button"
                    onClick={
                      openNotifications
                    }
                  >

                    <span>
                      ♢
                    </span>

                    Notifications

                    {notificationCount >
                      0 && (

                      <span
                        className="dropdown-notification-count"
                        style={{
                          marginLeft:
                            "auto",
                        }}
                      >
                        {notificationCount >
                        99
                          ? "99+"
                          : notificationCount}
                      </span>

                    )}

                  </button>

                  <div className="profile-dropdown-divider"></div>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    className="dropdown-logout"
                    onClick={
                      handleLogout
                    }
                  >

                    <span>
                      ↪
                    </span>

                    Logout

                  </button>

                </div>

              )}

            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <section className="admin-content">
          <Outlet />
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="admin-footer">

          <span>
            ©{" "}
            {new Date().getFullYear()}{" "}
            Krishna Dry Cleaning
          </span>

          <span>
            Admin Panel
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Adminlayout;

