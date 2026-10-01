import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Customers.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

function Customers() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  // =====================================================
  // GET USERS
  // =====================================================

  const getUsers = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/users`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      console.log("Users API Response:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch users");
      }

      let userData = [];

      if (Array.isArray(data)) {
        userData = data;
      } else if (Array.isArray(data?.data)) {
        userData = data.data;
      } else if (Array.isArray(data?.users)) {
        userData = data.users;
      } else if (Array.isArray(data?.result)) {
        userData = data.result;
      }

      setUsers(userData);
    } catch (error) {
      console.error("Get users error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD USERS
  // =====================================================

  useEffect(() => {
    getUsers();
  }, []);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  // =====================================================
  // USER NAME
  // =====================================================

  const getUserName = (user) => {
    return (
      user?.fullName ||
      user?.name ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      "Unknown User"
    );
  };

  // =====================================================
  // AVATAR LETTER
  // =====================================================

  const getAvatarLetter = (user) => {
    return getUserName(user)?.charAt(0)?.toUpperCase() || "U";
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getUserStatus = (user) => {
    if (
      user?.status?.toLowerCase() === "inactive" ||
      user?.status?.toLowerCase() === "blocked"
    ) {
      return "Inactive";
    }

    return "Active";
  };

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = getUserName(user).toLowerCase();

      const email = (user?.email || "").toLowerCase();

      const mobile = (
        user?.mobile ||
        user?.phone ||
        ""
      ).toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        mobile.includes(searchValue);

      const userStatus = getUserStatus(user);

      const matchesStatus =
        statusFilter === "all" ||
        userStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalUsers = users.length;

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  const startIndex =
    (currentPage - 1) * usersPerPage;

  const endIndex =
    startIndex + usersPerPage;

  const paginatedUsers =
    filteredUsers.slice(startIndex, endIndex);

  // =====================================================
  // RESET PAGE
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // =====================================================
  // KEEP PAGE VALID
  // =====================================================

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }

    if (
      totalPages === 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // =====================================================
  // PAGINATION PAGES
  // =====================================================

  const getPaginationPages = () => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }

    if (currentPage <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        totalPages,
      ];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  // =====================================================
  // STATS
  // =====================================================

  const activeUsers = users.filter(
    (user) =>
      getUserStatus(user) === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) =>
      getUserStatus(user) === "Inactive"
  ).length;

  const usersWithEmail = users.filter(
    (user) => user?.email
  ).length;

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // VIEW USER
  // =====================================================

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const handleDeleteUser = async (user) => {
    const userId =
      user?._id || user?.id;

    if (!userId) {
      alert("User ID not found.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${getUserName(
        user
      )}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleteLoading(true);

      const token = getToken();

      if (!token) {
        alert(
          "Authorization token not found. Please login again."
        );
        return;
      }

      console.log(
        "Deleting User ID:",
        userId
      );

      const response = await fetch(
        `${API_URL}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "Delete User Response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete user"
        );
      }

      // ================================================
      // REMOVE USER FROM FRONTEND
      // ================================================

      setUsers((prevUsers) =>
        prevUsers.filter(
          (item) =>
            (item?._id || item?.id) !==
            userId
        )
      );

      // ================================================
      // CLOSE MODAL
      // ================================================

      setShowViewModal(false);
      setSelectedUser(null);

      alert(
        "User deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete user."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    getUsers();
  };

  // =====================================================
  // CLEAR FILTER
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="customers-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="customers-header">

        <div className="customers-heading">

          <div className="heading-icon">
            ♙
          </div>

          <div>
            <h2>
              Customers
            </h2>

            <p>
              Manage and monitor all
              registered customers.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <span
            className={
              loading
                ? "refresh-icon spinning"
                : "refresh-icon"
            }
          >
            ↻
          </span>

          Refresh
        </button>

      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="customer-stats">

        <div className="customer-stat-card">

          <div className="stat-card-left">

            <span className="stat-label">
              Total Customers
            </span>

            <strong className="stat-number">
              {totalUsers}
            </strong>

            <span className="stat-description">
              Registered accounts
            </span>

          </div>

          <div className="stat-icon total">
            ♙
          </div>

        </div>

        <div className="customer-stat-card">

          <div className="stat-card-left">

            <span className="stat-label">
              Active Customers
            </span>

            <strong className="stat-number">
              {activeUsers}
            </strong>

            <span className="stat-description">
              Currently active
            </span>

          </div>

          <div className="stat-icon active">
            ✓
          </div>

        </div>

        <div className="customer-stat-card">

          <div className="stat-card-left">

            <span className="stat-label">
              Inactive
            </span>

            <strong className="stat-number">
              {inactiveUsers}
            </strong>

            <span className="stat-description">
              Inactive accounts
            </span>

          </div>

          <div className="stat-icon inactive">
            ○
          </div>

        </div>

        <div className="customer-stat-card">

          <div className="stat-card-left">

            <span className="stat-label">
              Email Accounts
            </span>

            <strong className="stat-number">
              {usersWithEmail}
            </strong>

            <span className="stat-description">
              With email registered
            </span>

          </div>

          <div className="stat-icon email">
            @
          </div>

        </div>

      </div>

      {/* =================================================
          CUSTOMER TABLE CARD
      ================================================= */}

      <div className="customers-card">

        <div className="customers-card-header">

          <div>

            <h3>
              All Customers
            </h3>

            <p>
              {filteredUsers.length} customer
              {filteredUsers.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

          <div className="customer-header-right">

            <span className="live-status">
              <i></i>
              Live Data
            </span>

          </div>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="customer-filter-bar">

          <div className="customer-search">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="filter-right">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="status-filter"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

            {(search ||
              statusFilter !== "all") && (
              <button
                type="button"
                className="clear-filter-btn"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="customers-table-wrapper">

          {loading ? (

            <div className="customers-loading">

              <div className="loading-spinner"></div>

              <h4>
                Loading customers...
              </h4>

              <p>
                Please wait while we fetch
                customer data.
              </p>

            </div>

          ) : filteredUsers.length === 0 ? (

            <div className="customers-empty">

              <div className="empty-icon">
                ♙
              </div>

              <h4>
                No customers found
              </h4>

              <p>
                {search
                  ? "Try changing your search or filters."
                  : "There are no registered customers yet."}
              </p>

              {(search ||
                statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <table className="customers-table">

              <thead>

                <tr>

                  <th>
                    CUSTOMER
                  </th>

                  <th>
                    CONTACT
                  </th>

                  <th>
                    MOBILE
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    JOINED
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginatedUsers.map(
                  (user, index) => {

                    const image =
                      getImageUrl(
                        user?.profileImage
                      );

                    const name =
                      getUserName(user);

                    const status =
                      getUserStatus(user);

                    const userId =
                      user?._id ||
                      user?.id ||
                      index;

                    return (

                      <tr key={userId}>

                        {/* CUSTOMER */}

                        <td>

                          <div className="customer-user">

                            <div className="customer-avatar">

                              {image ? (

                                <img
                                  src={image}
                                  alt={name}
                                  onError={(e) => {

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

                              ) : null}

                              <div
                                className="customer-avatar-fallback"
                                style={{
                                  display:
                                    image
                                      ? "none"
                                      : "flex",
                                }}
                              >
                                {getAvatarLetter(
                                  user
                                )}
                              </div>

                            </div>

                            <div className="customer-user-info">

                              <strong>
                                {name}
                              </strong>

                              <span>
                                {user?.email ||
                                  "No email"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td>

                          <div className="contact-cell">

                            <span className="contact-icon">
                              @
                            </span>

                            <span>
                              {user?.email ||
                                "—"}
                            </span>

                          </div>

                        </td>

                        {/* MOBILE */}

                        <td>

                          <div className="mobile-cell">

                            <span className="phone-icon">
                              ☎
                            </span>

                            <span>
                              {user?.mobile ||
                                user?.phone ||
                                "—"}
                            </span>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              status ===
                              "Active"
                                ? "customer-status active"
                                : "customer-status inactive"
                            }
                          >
                            <i></i>

                            {status}
                          </span>

                        </td>

                        {/* JOINED */}

                        <td>

                          <span className="joined-date">
                            {formatDate(
                              user?.createdAt ||
                                user?.date
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="customer-actions">

                            <button
                              type="button"
                              className="action-btn view"
                              title="View Customer"
                              onClick={() =>
                                handleViewUser(
                                  user
                                )
                              }
                            >
                              👁
                            </button>

                            <button
                              type="button"
                              className="action-btn delete"
                              title="Delete Customer"
                              onClick={() =>
                                handleDeleteUser(
                                  user
                                )
                              }
                              disabled={
                                deleteLoading
                              }
                            >
                              {deleteLoading
                                ? "..."
                                : "🗑"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          )}

        </div>

        {/* =================================================
            FOOTER + PAGINATION
        ================================================= */}

        {!loading &&
          filteredUsers.length > 0 && (

            <div className="customers-card-footer">

              <div className="customers-pagination-info">

                Showing{" "}

                <strong>
                  {startIndex + 1}
                </strong>

                {" - "}

                <strong>
                  {Math.min(
                    endIndex,
                    filteredUsers.length
                  )}
                </strong>

                {" of "}

                <strong>
                  {filteredUsers.length}
                </strong>

                {" customers"}

              </div>

              {totalPages > 1 && (

                <div className="customers-pagination">

                  <button
                    type="button"
                    className="customers-pagination-arrow"
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.max(
                            prev - 1,
                            1
                          )
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  {getPaginationPages().map(
                    (page, index) =>
                      page === "..." ? (

                        <span
                          key={`dots-${index}`}
                          className="customers-pagination-dots"
                        >
                          …
                        </span>

                      ) : (

                        <button
                          key={page}
                          type="button"
                          className={`customers-pagination-page ${
                            currentPage ===
                            page
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                        >
                          {page}
                        </button>

                      )
                  )}

                  <button
                    type="button"
                    className="customers-pagination-arrow"
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.min(
                            prev + 1,
                            totalPages
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    aria-label="Next page"
                  >
                    ›
                  </button>

                </div>

              )}

              <span className="footer-info">
                Customer management
              </span>

            </div>

          )}

      </div>

      {/* =================================================
          VIEW CUSTOMER MODAL
      ================================================= */}

      {showViewModal &&
        selectedUser && (

          <div
            className="customer-modal-overlay"
            onClick={(e) => {

              if (
                e.target ===
                e.currentTarget
              ) {
                setShowViewModal(false);
              }

            }}
          >

            <div className="customer-modal">

              {/* MODAL HEADER */}

              <div className="customer-modal-header">

                <div>

                  <span>
                    CUSTOMER DETAILS
                  </span>

                  <h3>
                    Customer Profile
                  </h3>

                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setShowViewModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              {/* PROFILE */}

              <div className="modal-profile">

                <div className="modal-avatar">

                  {getImageUrl(
                    selectedUser.profileImage
                  ) ? (

                    <img
                      src={getImageUrl(
                        selectedUser.profileImage
                      )}
                      alt={getUserName(
                        selectedUser
                      )}
                    />

                  ) : (

                    <span>
                      {getAvatarLetter(
                        selectedUser
                      )}
                    </span>

                  )}

                </div>

                <div>

                  <h4>
                    {getUserName(
                      selectedUser
                    )}
                  </h4>

                  <p>
                    {selectedUser?.email ||
                      "No email available"}
                  </p>

                  <span
                    className={
                      getUserStatus(
                        selectedUser
                      ) === "Active"
                        ? "modal-status active"
                        : "modal-status inactive"
                    }
                  >
                    <i></i>

                    {getUserStatus(
                      selectedUser
                    )}
                  </span>

                </div>

              </div>

              {/* DETAILS */}

              <div className="modal-details">

                <div className="detail-item">

                  <span>
                    Full Name
                  </span>

                  <strong>
                    {getUserName(
                      selectedUser
                    )}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Email Address
                  </span>

                  <strong>
                    {selectedUser?.email ||
                      "—"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Mobile Number
                  </span>

                  <strong>
                    {selectedUser?.mobile ||
                      selectedUser?.phone ||
                      "—"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Language
                  </span>

                  <strong>
                    {selectedUser?.language ||
                      "English"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Email Notifications
                  </span>

                  <strong>
                    {selectedUser?.emailNotifications ===
                    false
                      ? "Disabled"
                      : "Enabled"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    SMS Notifications
                  </span>

                  <strong>
                    {selectedUser?.smsNotifications ===
                    false
                      ? "Disabled"
                      : "Enabled"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Joined Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedUser?.createdAt
                    )}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Customer ID
                  </span>

                  <strong>
                    {selectedUser?._id ||
                      selectedUser?.id ||
                      "—"}
                  </strong>

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="customer-modal-footer">

                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() =>
                    setShowViewModal(
                      false
                    )
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  className="modal-delete-btn"
                  onClick={() =>
                    handleDeleteUser(
                      selectedUser
                    )
                  }
                  disabled={
                    deleteLoading
                  }
                >
                  {deleteLoading
                    ? "Deleting..."
                    : "Delete Customer"}
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Customers;