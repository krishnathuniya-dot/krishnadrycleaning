
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminNotifications.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

function AdminNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const token = localStorage.getItem("token");

  // =====================================================
  // GET ADMIN NOTIFICATIONS
  // GET /api/notifications
  // =====================================================

  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API_URL}/api/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch notifications"
        );
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(
        "FETCH NOTIFICATIONS ERROR:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // GET UNREAD COUNT
  // GET /api/notifications/unread-count
  // =====================================================

  const fetchUnreadCount = async () => {
    try {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to get unread count"
        );
      }

      return data.unreadCount || 0;
    } catch (error) {
      console.error(
        "UNREAD COUNT ERROR:",
        error
      );

      return 0;
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!token) {
      console.error("Admin token not found");
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, []);

  // =====================================================
  // MARK SINGLE NOTIFICATION AS READ
  // PUT /api/notifications/:id/read
  // =====================================================

  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read"
        );
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      window.dispatchEvent(
        new Event("adminNotificationUpdated")
      );
    } catch (error) {
      console.error(
        "MARK READ ERROR:",
        error
      );
    }
  };

  // =====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // PUT /api/notifications/read-all
  // =====================================================

  const markAllAsRead = async () => {
    try {
      if (unreadNotifications === 0) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark all notifications as read"
        );
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      window.dispatchEvent(
        new Event("adminNotificationUpdated")
      );
    } catch (error) {
      console.error(
        "MARK ALL READ ERROR:",
        error
      );
    }
  };

  // =====================================================
  // DELETE NOTIFICATION
  // DELETE /api/notifications/:id
  // =====================================================

  const deleteNotification = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete notification"
        );
      }

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !== id
        )
      );

      if (
        selectedNotification &&
        selectedNotification._id === id
      ) {
        setSelectedNotification(null);
      }

      window.dispatchEvent(
        new Event("adminNotificationUpdated")
      );
    } catch (error) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        error
      );
    }
  };

  // =====================================================
  // OPEN NOTIFICATION
  // =====================================================

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setSelectedNotification({
      ...notification,
      isRead: true,
    });
  };

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (notification) => {
        const senderName =
          notification.sender?.fullName || "";

        const senderEmail =
          notification.sender?.email || "";

        const title =
          notification.title || "";

        const message =
          notification.message || "";

        const type =
          notification.type || "";

        const searchText = `
          ${senderName}
          ${senderEmail}
          ${title}
          ${message}
          ${type}
        `.toLowerCase();

        const matchesSearch =
          searchText.includes(
            search.toLowerCase()
          );

        let matchesFilter = true;

        switch (filter) {
          case "unread":
            matchesFilter =
              notification.isRead === false;
            break;

          case "user_registered":
            matchesFilter =
              notification.type ===
              "user_registered";
            break;

          case "review":
            matchesFilter =
              notification.type === "review";
            break;

          case "service":
            matchesFilter =
              notification.type === "service";
            break;

          case "system":
            matchesFilter =
              notification.type === "system";
            break;

          default:
            matchesFilter = true;
        }

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    notifications,
    search,
    filter,
  ]);

  // =====================================================
  // STATS
  // =====================================================

  const totalNotifications =
    notifications.length;

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  const userNotifications =
    notifications.filter(
      (notification) =>
        notification.type ===
        "user_registered"
    ).length;

  const reviewNotifications =
    notifications.filter(
      (notification) =>
        notification.type === "review"
    ).length;

  const todayNotifications =
    notifications.filter(
      (notification) => {
        if (!notification.createdAt) {
          return false;
        }

        const notificationDate =
          new Date(
            notification.createdAt
          );

        const today = new Date();

        return (
          notificationDate.toDateString() ===
          today.toDateString()
        );
      }
    ).length;

  // =====================================================
  // TIME AGO
  // =====================================================

  const getTimeAgo = (date) => {
    if (!date) {
      return "";
    }

    const now = new Date();
    const created = new Date(date);

    const seconds = Math.floor(
      (now - created) / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes} min${
        minutes > 1 ? "s" : ""
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours > 1 ? "s" : ""
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days > 1 ? "s" : ""
      } ago`;
    }

    return created.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  // =====================================================
  // NOTIFICATION TYPE
  // =====================================================

  const getTypeDetails = (type) => {
    switch (type) {
      case "user_registered":
        return {
          icon: "👤",
          label: "New User",
          className: "user",
        };

      case "review":
        return {
          icon: "⭐",
          label: "Review",
          className: "review",
        };

      case "service":
        return {
          icon: "🧺",
          label: "Service",
          className: "service",
        };

      case "system":
        return {
          icon: "⚙️",
          label: "System",
          className: "system",
        };

      default:
        return {
          icon: "🔔",
          label: "Notification",
          className: "default",
        };
    }
  };

  // =====================================================
  // VIEW NOTIFICATION LINK
  // =====================================================

  const handleViewLink = () => {
    if (!selectedNotification) {
      return;
    }

    if (selectedNotification.link) {
      setSelectedNotification(null);

      navigate(
        selectedNotification.link
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-notifications-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="notifications-header">

        <div>
          <span className="page-eyebrow">
            ADMIN CENTER
          </span>

          <h1>
            Notifications
          </h1>

          <p>
            Manage and monitor all admin
            notifications.
          </p>
        </div>

        <div className="header-actions">

          <button
            className="refresh-btn"
            onClick={() =>
              fetchNotifications(true)
            }
            disabled={refreshing}
          >
            <span
              className={
                refreshing
                  ? "refresh-icon spinning"
                  : "refresh-icon"
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
            disabled={
              unreadNotifications === 0
            }
          >
            ✓ Mark all as read
          </button>

        </div>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="notification-stats">

        <div className="notification-stat-card">

          <div className="stat-icon blue">
            🔔
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              {totalNotifications}
            </strong>
          </div>

        </div>

        <div className="notification-stat-card">

          <div className="stat-icon orange">
            ●
          </div>

          <div>
            <span>
              Unread
            </span>

            <strong>
              {unreadNotifications}
            </strong>
          </div>

        </div>

        <div className="notification-stat-card">

          <div className="stat-icon green">
            👤
          </div>

          <div>
            <span>
              Users
            </span>

            <strong>
              {userNotifications}
            </strong>
          </div>

        </div>

        <div className="notification-stat-card">

          <div className="stat-icon purple">
            ⭐
          </div>

          <div>
            <span>
              Reviews
            </span>

            <strong>
              {reviewNotifications}
            </strong>
          </div>

        </div>

        <div className="notification-stat-card">

          <div className="stat-icon dark">
            📅
          </div>

          <div>
            <span>
              Today
            </span>

            <strong>
              {todayNotifications}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="notification-toolbar">

        <div className="notification-search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search notifications, users, email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

        <div className="notification-filters">

          <button
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All
          </button>

          <button
            className={
              filter === "unread"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("unread")
            }
          >
            Unread
          </button>

          <button
            className={
              filter === "user_registered"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "user_registered"
              )
            }
          >
            Users
          </button>

          <button
            className={
              filter === "review"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("review")
            }
          >
            Reviews
          </button>

          <button
            className={
              filter === "service"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("service")
            }
          >
            Services
          </button>

          <button
            className={
              filter === "system"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("system")
            }
          >
            System
          </button>

        </div>

      </div>

      {/* =================================================
          NOTIFICATIONS CARD
      ================================================= */}

      <div className="notifications-card">

        <div className="notifications-card-header">

          <div>

            <h2>
              Recent Notifications
            </h2>

            <p>
              {filteredNotifications.length}{" "}
              notifications found
            </p>

          </div>

          {unreadNotifications > 0 && (
            <span className="unread-badge">
              {unreadNotifications} unread
            </span>
          )}

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="notifications-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading notifications...
            </p>

          </div>

        ) : filteredNotifications.length ===
          0 ? (

          /* EMPTY */

          <div className="empty-notifications">

            <div className="empty-icon">
              🔔
            </div>

            <h3>
              No notifications found
            </h3>

            <p>
              There are no notifications
              matching your current filter.
            </p>

            {(search ||
              filter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            )}

          </div>

        ) : (

          /* LIST */

          <div className="notifications-list">

            {filteredNotifications.map(
              (notification) => {

                const typeDetails =
                  getTypeDetails(
                    notification.type
                  );

                const sender =
                  notification.sender;

                return (
                  <div
                    key={notification._id}
                    className={`notification-item ${
                      notification.isRead
                        ? "read"
                        : "unread"
                    }`}
                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }
                  >

                    {/* UNREAD DOT */}

                    {!notification.isRead && (
                      <span className="unread-dot"></span>
                    )}

                    {/* AVATAR */}

                    <div className="notification-avatar">

                      {sender?.profileImage ? (

                        <img
                          src={getImageUrl(
                            sender.profileImage
                          )}
                          alt={
                            sender.fullName ||
                            "User"
                          }
                        />

                      ) : (

                        <span>
                          {sender?.fullName
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            typeDetails.icon}
                        </span>

                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="notification-content">

                      <div className="notification-title-row">

                        <div className="notification-title-wrap">

                          <span
                            className={`notification-type ${typeDetails.className}`}
                          >
                            {typeDetails.icon}{" "}
                            {typeDetails.label}
                          </span>

                          <h3>
                            {notification.title}
                          </h3>

                        </div>

                        <span className="notification-time">
                          {getTimeAgo(
                            notification.createdAt
                          )}
                        </span>

                      </div>

                      <p className="notification-message">
                        {notification.message}
                      </p>

                      {/* SENDER */}

                      {sender && (
                        <div className="notification-sender">

                          <strong>
                            {sender.fullName ||
                              "Unknown User"}
                          </strong>

                          {sender.email && (
                            <span>
                              {sender.email}
                            </span>
                          )}

                          <span className="sender-role">
                            {sender.role ===
                            "admin"
                              ? "Admin"
                              : "User"}
                          </span>

                        </div>
                      )}

                      {/* ACTIONS */}

                      <div
                        className="notification-actions"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        {!notification.isRead && (
                          <button
                            className="read-btn"
                            onClick={() =>
                              markAsRead(
                                notification._id
                              )
                            }
                          >
                            ✓ Mark as read
                          </button>
                        )}

                        {notification.link && (
                          <button
                            className="view-btn"
                            onClick={() => {
                              markAsRead(
                                notification._id
                              );

                              navigate(
                                notification.link
                              );
                            }}
                          >
                            View
                          </button>
                        )}

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteNotification(
                              notification._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      {selectedNotification && (

        <div
          className="notification-modal-overlay"
          onClick={() =>
            setSelectedNotification(null)
          }
        >

          <div
            className="notification-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelectedNotification(null)
              }
            >
              ×
            </button>

            <div className="modal-icon">

              {
                getTypeDetails(
                  selectedNotification.type
                ).icon
              }

            </div>

            <span
              className={`modal-type ${
                getTypeDetails(
                  selectedNotification.type
                ).className
              }`}
            >
              {
                getTypeDetails(
                  selectedNotification.type
                ).label
              }
            </span>

            <h2>
              {selectedNotification.title}
            </h2>

            <p className="modal-message">
              {selectedNotification.message}
            </p>

            {/* SENDER */}

            {selectedNotification.sender && (

              <div className="modal-user">

                <div className="modal-user-avatar">

                  {selectedNotification
                    .sender
                    .profileImage ? (

                    <img
                      src={getImageUrl(
                        selectedNotification
                          .sender
                          .profileImage
                      )}
                      alt={
                        selectedNotification
                          .sender
                          .fullName || ""
                      }
                    />

                  ) : (

                    selectedNotification
                      .sender
                      .fullName
                      ?.charAt(0)
                      ?.toUpperCase()

                  )}

                </div>

                <div>

                  <strong>
                    {
                      selectedNotification
                        .sender
                        .fullName
                    }
                  </strong>

                  <span>
                    {
                      selectedNotification
                        .sender
                        .email
                    }
                  </span>

                  <small>
                    {selectedNotification
                      .sender
                      .role === "admin"
                      ? "Admin"
                      : "User"}
                  </small>

                </div>

              </div>

            )}

            {/* DATE */}

            <div className="modal-date">

              <span>
                Notification time
              </span>

              <strong>
                {selectedNotification.createdAt
                  ? new Date(
                      selectedNotification.createdAt
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "N/A"}
              </strong>

            </div>

            {/* FOOTER */}

            <div className="modal-footer">

              {selectedNotification.link && (
                <button
                  className="modal-view-btn"
                  onClick={
                    handleViewLink
                  }
                >
                  View Details
                </button>
              )}

              <button
                className="modal-delete-btn"
                onClick={() =>
                  deleteNotification(
                    selectedNotification._id
                  )
                }
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminNotifications;

