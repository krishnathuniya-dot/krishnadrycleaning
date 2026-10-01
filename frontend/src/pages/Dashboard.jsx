
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/AdminDashboard.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

function Dashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState(0);
  const [userList, setUserList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [galleryCount, setGalleryCount] = useState(0);
  const [rateCategories, setRateCategories] = useState(0);
  const [latestLogin, setLatestLogin] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // ADMIN AUTHENTICATION
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const savedAdmin = localStorage.getItem("admin");

    // No admin token
    if (!token) {
      navigate("/admin", {
        replace: true,
      });
      return;
    }

    // Check saved admin data
    if (!savedAdmin) {
      navigate("/admin", {
        replace: true,
      });
      return;
    }

    try {
      const admin = JSON.parse(savedAdmin);

      const role = String(
        admin?.role || ""
      ).toLowerCase();

      if (
        !["admin", "superadmin"].includes(role)
      ) {
        handleUnauthorized();
        return;
      }
    } catch (error) {
      console.error(
        "Admin data parse error:",
        error
      );

      handleUnauthorized();
      return;
    }

    fetchDashboardData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("adminToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // =====================================================
  // GET DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        handleUnauthorized();
        return;
      }

      // =================================================
      // USERS
      // =================================================

      try {
        const response = await fetch(
          `${API_URL}/api/users`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleUnauthorized();
          return;
        }

        let data = {};

        try {
          data = await response.json();
        } catch (error) {
          data = {};
        }

        if (response.ok) {
          const list =
            Array.isArray(data?.users)
              ? data.users
              : Array.isArray(data?.data)
              ? data.data
              : [];

          setUserList(list);

          setUsers(
            Number(
              data?.total ??
                data?.count ??
                list.length
            )
          );

          // ---------------------------------------------
          // FIND LATEST LOGIN
          // ---------------------------------------------

          const loggedInUsers = list
            .filter(
              (user) =>
                user?.lastLogin
            )
            .sort(
              (a, b) =>
                new Date(
                  b.lastLogin
                ) -
                new Date(
                  a.lastLogin
                )
            );

          setLatestLogin(
            loggedInUsers.length > 0
              ? loggedInUsers[0]
              : null
          );
        } else {
          setUserList([]);
          setUsers(0);
          setLatestLogin(null);
        }
      } catch (error) {
        console.log(
          "Users API Error:",
          error
        );
      }

      // =================================================
      // REVIEWS
      // =================================================

      try {
        const response = await fetch(
          `${API_URL}/api/reviews`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleUnauthorized();
          return;
        }

        let data = {};

        try {
          data = await response.json();
        } catch (error) {
          data = {};
        }

        if (response.ok) {
          const reviewList =
            Array.isArray(data?.reviews)
              ? data.reviews
              : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data)
              ? data
              : [];

          setReviews(reviewList);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.log(
          "Reviews API Error:",
          error
        );
      }

      // =================================================
      // GALLERY
      // =================================================

      try {
        const response = await fetch(
          `${API_URL}/api/gallery`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleUnauthorized();
          return;
        }

        let data = {};

        try {
          data = await response.json();
        } catch (error) {
          data = {};
        }

        if (response.ok) {
          const gallery =
            Array.isArray(
              data?.gallery
            )
              ? data.gallery
              : Array.isArray(
                  data?.data
                )
              ? data.data
              : Array.isArray(data)
              ? data
              : [];

          setGalleryCount(
            Number(
              data?.total ??
                data?.count ??
                gallery.length
            )
          );
        } else {
          setGalleryCount(0);
        }
      } catch (error) {
        console.log(
          "Gallery API Error:",
          error
        );

        setGalleryCount(0);
      }

      // =================================================
      // RATE CATEGORIES
      // =================================================

      try {
        const response = await fetch(
          `${API_URL}/api/rate-categories`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleUnauthorized();
          return;
        }

        let data = {};

        try {
          data = await response.json();
        } catch (error) {
          data = {};
        }

        if (response.ok) {
          const categories =
            Array.isArray(
              data?.categories
            )
              ? data.categories
              : Array.isArray(
                  data?.data
                )
              ? data.data
              : Array.isArray(data)
              ? data
              : [];

          setRateCategories(
            Number(
              data?.total ??
                data?.count ??
                categories.length
            )
          );
        } else {
          setRateCategories(0);
        }
      } catch (error) {
        console.log(
          "Rate Category API Error:",
          error
        );

        setRateCategories(0);
      }
    } catch (error) {
      console.log(
        "Dashboard Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UNAUTHORIZED
  // =====================================================

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminSessionId");
    localStorage.removeItem("loginActivity");

    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem(
      "adminProfileImage"
    );

    // IMPORTANT:
    // adminDeviceId ko remove nahi karna hai.

    navigate("/admin", {
      replace: true,
    });
  };

  // =====================================================
  // AVERAGE RATING
  // =====================================================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, item) =>
              sum +
              Number(
                item?.rating || 0
              ),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT DATE TIME
  // =====================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "Never";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "Never";
    }

    return d.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // =====================================================
  // GET REVIEW NAME
  // =====================================================

  const getName = (review) => {
    return (
      review?.fullName ||
      review?.name ||
      review?.username ||
      review?.userName ||
      review?.user?.fullName ||
      review?.user?.name ||
      review?.user?.username ||
      "Customer"
    );
  };

  // =====================================================
  // GET REVIEW IMAGE
  // =====================================================

  const getImage = (review) => {
    const image =
      review?.profileImage ||
      review?.image ||
      review?.user?.profileImage ||
      review?.user?.image ||
      "";

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

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  // =====================================================
  // GET USER IMAGE
  // =====================================================

  const getUserImage = (user) => {
    const image =
      user?.profileImage || "";

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

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  // =====================================================
  // CALL CUSTOMER
  // =====================================================

  const callCustomer = (mobile) => {
    if (!mobile) {
      alert(
        "Customer mobile number not available."
      );

      return;
    }

    window.location.href =
      `tel:${mobile}`;
  };

  // =====================================================
  // DASHBOARD UI
  // =====================================================

  return (
    <div className="admin-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-top">

        <div className="dashboard-title-area">

          <span className="dashboard-eyebrow">
            KRISHNA DRYCLEANING
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back, Admin. Here's what's
            happening with your business today.
          </p>

        </div>

        <button
          className="refresh-btn"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <span
            className={
              loading
                ? "spin"
                : ""
            }
          >
            ↻
          </span>

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="dashboard-stats">

        {/* USERS */}

        <div className="stat-card">

          <div className="stat-icon user-icon">
            👥
          </div>

          <div className="stat-content">

            <span>
              TOTAL CUSTOMERS
            </span>

            <strong>
              {loading
                ? "..."
                : users}
            </strong>

            <small>
              Registered customers
            </small>

          </div>

          <div className="stat-arrow">
            →
          </div>

        </div>


        {/* REVIEWS */}

        <div className="stat-card">

          <div className="stat-icon review-icon">
            ★
          </div>

          <div className="stat-content">

            <span>
              TOTAL REVIEWS
            </span>

            <strong>
              {loading
                ? "..."
                : reviews.length}
            </strong>

            <small>
              Customer feedback
            </small>

          </div>

          <div className="stat-arrow">
            →
          </div>

        </div>


        {/* RATING */}

        <div className="stat-card">

          <div className="stat-icon rating-icon">
            ⭐
          </div>

          <div className="stat-content">

            <span>
              AVERAGE RATING
            </span>

            <strong>
              {loading
                ? "..."
                : averageRating}
            </strong>

            <small>
              Out of 5.0
            </small>

          </div>

          <div className="stat-arrow">
            →
          </div>

        </div>


        {/* CATEGORIES */}

        <div className="stat-card">

          <div className="stat-icon rate-icon">
            ₹
          </div>

          <div className="stat-content">

            <span>
              RATE CATEGORIES
            </span>

            <strong>
              {loading
                ? "..."
                : rateCategories}
            </strong>

            <small>
              Service categories
            </small>

          </div>

          <div className="stat-arrow">
            →
          </div>

        </div>


        {/* LATEST LOGIN */}

        <div className="stat-card latest-login-card">

          <div className="stat-icon login-icon">
            🕐
          </div>

          <div className="stat-content">

            <span>
              LATEST LOGIN
            </span>

            <strong>
              {loading
                ? "..."
                : latestLogin?.fullName ||
                  "No Login"}
            </strong>

            <small>
              {latestLogin
                ? formatDateTime(
                    latestLogin.lastLogin
                  )
                : "No login activity"}
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="dashboard-grid">

        {/* QUICK ACTIONS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span>
                QUICK ACTIONS
              </span>

              <h2>
                Manage your website
              </h2>

            </div>

          </div>


          <div className="quick-actions">

            <button
              onClick={() =>
                navigate(
                  "/admin/rates"
                )
              }
              className="quick-action"
            >

              <div className="quick-icon">
                ₹
              </div>

              <div>

                <strong>
                  Rate List
                </strong>

                <span>
                  Manage service prices
                </span>

              </div>

              <b>
                →
              </b>

            </button>


            <button
              onClick={() =>
                navigate(
                  "/admin/rate-categories"
                )
              }
              className="quick-action"
            >

              <div className="quick-icon">
                ▦
              </div>

              <div>

                <strong>
                  Categories
                </strong>

                <span>
                  Manage rate categories
                </span>

              </div>

              <b>
                →
              </b>

            </button>


            <button
              onClick={() =>
                navigate(
                  "/admin/gallery"
                )
              }
              className="quick-action"
            >

              <div className="quick-icon">
                ▣
              </div>

              <div>

                <strong>
                  Gallery
                </strong>

                <span>
                  Manage gallery images
                </span>

              </div>

              <b>
                →
              </b>

            </button>


            <button
              onClick={() =>
                navigate(
                  "/admin/reviews"
                )
              }
              className="quick-action"
            >

              <div className="quick-icon">
                ★
              </div>

              <div>

                <strong>
                  Reviews
                </strong>

                <span>
                  View customer reviews
                </span>

              </div>

              <b>
                →
              </b>

            </button>


            <button
              onClick={() =>
                navigate(
                  "/admin/customers"
                )
              }
              className="quick-action"
            >

              <div className="quick-icon">
                👤
              </div>

              <div>

                <strong>
                  Customers
                </strong>

                <span>
                  View customer details
                </span>

              </div>

              <b>
                →
              </b>

            </button>

          </div>

        </div>


        {/* BUSINESS STATUS */}

        <div className="dashboard-panel business-panel">

          <div className="panel-heading">

            <div>

              <span>
                BUSINESS STATUS
              </span>

              <h2>
                Krishna Drycleaning
              </h2>

            </div>

            <div className="online-status">
              <i></i>
              Active
            </div>

          </div>


          <div className="business-info">

            <div className="business-info-row">

              <span>
                Service
              </span>

              <strong>
                Dry Cleaning & Garment Care
              </strong>

            </div>


            <div className="business-info-row">

              <span>
                Customer Contact
              </span>

              <strong>
                Phone Calls
              </strong>

            </div>


            <div className="business-info-row">

              <span>
                Online Orders
              </span>

              <strong className="disabled-text">
                Not Available
              </strong>

            </div>


            <div className="business-info-row">

              <span>
                Customer Reviews
              </span>

              <strong>
                {reviews.length} Reviews
              </strong>

            </div>


            <div className="business-info-row">

              <span>
                Gallery Images
              </span>

              <strong>
                {galleryCount} Images
              </strong>

            </div>


            <div className="business-info-row">

              <span>
                Rate Categories
              </span>

              <strong>
                {rateCategories} Categories
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          CUSTOMER ACTIVITY
      ================================================= */}

      <div className="dashboard-panel login-panel">

        <div className="panel-heading">

          <div>

            <span>
              CUSTOMER ACTIVITY
            </span>

            <h2>
              Latest Login
            </h2>

          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate(
                "/admin/customers"
              )
            }
          >
            View Customers →
          </button>

        </div>


        {loading ? (

          <div className="dashboard-loading">

            <div className="loading-circle"></div>

            Loading login activity...

          </div>

        ) : !latestLogin ? (

          <div className="empty-dashboard">

            <div className="empty-icon">
              🕐
            </div>

            <h3>
              No login activity
            </h3>

            <p>
              Customer login activity will
              appear here.
            </p>

          </div>

        ) : (

          <div className="latest-login-content">

            {/* USER */}

            <div className="latest-login-user">

              <div className="latest-login-avatar">

                {getUserImage(
                  latestLogin
                ) ? (

                  <img
                    src={getUserImage(
                      latestLogin
                    )}
                    alt={
                      latestLogin.fullName ||
                      "Customer"
                    }
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                ) : (

                  <span>
                    {latestLogin.fullName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "C"}
                  </span>

                )}

              </div>

              <div>

                <strong>
                  {latestLogin.fullName ||
                    "Customer"}
                </strong>

                <span>
                  {latestLogin.email ||
                    "Email not available"}
                </span>

              </div>

            </div>


            {/* LOGIN TIME */}

            <div className="latest-login-time">

              <span>
                LAST LOGIN
              </span>

              <strong>
                {formatDateTime(
                  latestLogin.lastLogin
                )}
              </strong>

            </div>


            {/* MOBILE */}

            <div className="latest-login-mobile">

              <span>
                MOBILE
              </span>

              <strong>
                {latestLogin.mobile ||
                  "Not available"}
              </strong>

            </div>


            {/* CALL */}

            <button
              className="call-customer-btn"
              onClick={() =>
                callCustomer(
                  latestLogin.mobile
                )
              }
            >
              ☎

              <span>
                Call Customer
              </span>

            </button>

          </div>

        )}

      </div>


      {/* =================================================
          RECENT REVIEWS
      ================================================= */}

      <div className="dashboard-panel recent-reviews-panel">

        <div className="panel-heading">

          <div>

            <span>
              CUSTOMER FEEDBACK
            </span>

            <h2>
              Recent Reviews
            </h2>

          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate(
                "/admin/reviews"
              )
            }
          >
            View All →
          </button>

        </div>


        {loading ? (

          <div className="dashboard-loading">
            Loading reviews...
          </div>

        ) : reviews.length === 0 ? (

          <div className="empty-dashboard">

            <div className="empty-icon">
              ★
            </div>

            <h3>
              No reviews yet
            </h3>

            <p>
              Customer reviews will appear here.
            </p>

          </div>

        ) : (

          <div className="recent-review-list">

            {reviews
              .slice(0, 5)
              .map(
                (review, index) => {

                  const name =
                    getName(review);

                  const image =
                    getImage(review);

                  return (
                    <div
                      className="recent-review"
                      key={
                        review?._id ||
                        `review-${index}`
                      }
                    >

                      {/* USER */}

                      <div className="recent-user">

                        {image ? (

                          <img
                            src={image}
                            alt={name}
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />

                        ) : (

                          <div className="recent-avatar-letter">

                            {name
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                        )}

                        <div>

                          <strong>
                            {name}
                          </strong>

                          <span>
                            {formatDate(
                              review?.createdAt ||
                                review?.updatedAt
                            )}
                          </span>

                        </div>

                      </div>


                      {/* RATING */}

                      <div className="recent-rating">

                        <div>

                          {Array.from({
                            length: 5,
                          }).map(
                            (_, star) => (

                              <span
                                key={star}
                                className={
                                  star <
                                  Number(
                                    review?.rating ||
                                      0
                                  )
                                    ? "star-active"
                                    : "star-inactive"
                                }
                              >
                                ★
                              </span>

                            )
                          )}

                        </div>

                        <span>
                          {review?.rating ||
                            0}/5
                        </span>

                      </div>


                      {/* REVIEW */}

                      <p>
                        {review?.review ||
                          review?.comment ||
                          review?.message ||
                          "Excellent service."}
                      </p>

                    </div>
                  );
                }
              )}

          </div>

        )}

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="dashboard-footer">

        <div>

          <strong>
            Krishna Drycleaning
          </strong>

          <span>
            Professional garment care management
          </span>

        </div>

        <div className="dashboard-footer-right">

          <span>
            ● Admin Panel
          </span>

          <span>
            {new Date().getFullYear()}
          </span>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;

