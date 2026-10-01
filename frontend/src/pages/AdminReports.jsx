import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../css/AdminReports.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

function AdminReports() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState([]);

  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =====================================================
  // AUTH
  // =====================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // =====================================================
  // NORMALIZE API DATA
  // =====================================================

  const extractArray = (result) => {
    if (Array.isArray(result)) return result;

    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.users)) return result.users;
    if (Array.isArray(result?.reviews)) return result.reviews;
    if (Array.isArray(result?.gallery)) return result.gallery;
    if (Array.isArray(result?.categories)) return result.categories;
    if (Array.isArray(result?.rateCategories)) {
      return result.rateCategories;
    }

    return [];
  };

  // =====================================================
  // FETCH
  // =====================================================

  const fetchReports = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const headers = getAuthHeaders();

      const [usersRes, reviewsRes, galleryRes, categoriesRes] =
        await Promise.all([
          fetch(`${API_URL}/api/users`, {
            headers,
          }),
          fetch(`${API_URL}/api/reviews`, {
            headers,
          }),
          fetch(`${API_URL}/api/gallery`, {
            headers,
          }),
          fetch(`${API_URL}/api/rate-categories`, {
            headers,
          }),
        ]);

      // =================================================
      // AUTH ERROR
      // =================================================

      if (
        usersRes.status === 401 ||
        usersRes.status === 403 ||
        reviewsRes.status === 401 ||
        reviewsRes.status === 403
      ) {
        localStorage.clear();
        navigate("/admin-login");
        return;
      }

      // =================================================
      // SAFE JSON
      // =================================================

      const readResponse = async (response) => {
        try {
          return await response.json();
        } catch {
          return [];
        }
      };

      const usersData = await readResponse(usersRes);
      const reviewsData = await readResponse(reviewsRes);
      const galleryData = await readResponse(galleryRes);
      const categoriesData = await readResponse(categoriesRes);

      setUsers(extractArray(usersData));
      setReviews(extractArray(reviewsData));
      setGallery(extractArray(galleryData));
      setCategories(extractArray(categoriesData));
    } catch (error) {
      console.error("Reports Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // =====================================================
  // DATE FILTER
  // =====================================================

  const filteredUsers = useMemo(() => {
    if (period === "all") return users;

    const now = new Date();
    const days =
      period === "7"
        ? 7
        : period === "30"
        ? 30
        : 90;

    const start = new Date(now);
    start.setDate(start.getDate() - days);

    return users.filter((user) => {
      const date = new Date(user.createdAt);
      return !isNaN(date) && date >= start;
    });
  }, [users, period]);

  const filteredReviews = useMemo(() => {
    if (period === "all") return reviews;

    const now = new Date();

    const days =
      period === "7"
        ? 7
        : period === "30"
        ? 30
        : 90;

    const start = new Date(now);
    start.setDate(start.getDate() - days);

    return reviews.filter((review) => {
      const date = new Date(
        review.createdAt || review.updatedAt
      );

      return !isNaN(date) && date >= start;
    });
  }, [reviews, period]);

  // =====================================================
  // TOTALS
  // =====================================================

  const totalUsers = users.length;
  const totalReviews = reviews.length;
  const totalGallery = gallery.length;
  const totalCategories = categories.length;

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";

    const validRatings = reviews
      .map((review) => Number(review.rating))
      .filter((rating) => rating >= 1 && rating <= 5);

    if (!validRatings.length) return "0.0";

    const total = validRatings.reduce(
      (sum, rating) => sum + rating,
      0
    );

    return (total / validRatings.length).toFixed(1);
  }, [reviews]);

  // =====================================================
  // CUSTOMER GROWTH
  // =====================================================

  const customerGrowth = useMemo(() => {
    const months = [];

    const monthCount =
      period === "7"
        ? 7
        : period === "30"
        ? 30
        : period === "90"
        ? 3
        : 12;

    if (period === "7") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const label = date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });

        months.push({
          key: date.toISOString().slice(0, 10),
          label,
          customers: 0,
        });
      }

      users.forEach((user) => {
        const date = new Date(user.createdAt);

        if (isNaN(date)) return;

        const key = date.toISOString().slice(0, 10);

        const found = months.find((item) => item.key === key);

        if (found) {
          found.customers++;
        }
      });

      return months;
    }

    if (period === "30") {
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const label = date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });

        months.push({
          key: date.toISOString().slice(0, 10),
          label,
          customers: 0,
        });
      }

      users.forEach((user) => {
        const date = new Date(user.createdAt);

        if (isNaN(date)) return;

        const key = date.toISOString().slice(0, 10);

        const found = months.find((item) => item.key === key);

        if (found) {
          found.customers++;
        }
      });

      return months;
    }

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date();

      date.setMonth(date.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth();

      const label = date.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });

      months.push({
        year,
        month,
        label,
        customers: 0,
      });
    }

    users.forEach((user) => {
      const date = new Date(user.createdAt);

      if (isNaN(date)) return;

      const found = months.find(
        (item) =>
          item.year === date.getFullYear() &&
          item.month === date.getMonth()
      );

      if (found) {
        found.customers++;
      }
    });

    return months;
  }, [users, period]);

  // =====================================================
  // RATING DISTRIBUTION
  // =====================================================

  const ratingData = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating: `${rating} Star`,
      count: filteredReviews.filter(
        (review) => Number(review.rating) === rating
      ).length,
    }));
  }, [filteredReviews]);

  // =====================================================
  // RATING PIE
  // =====================================================

  const ratingPieData = useMemo(() => {
    return [5, 4, 3, 2, 1]
      .map((rating) => ({
        name: `${rating} Star`,
        value: filteredReviews.filter(
          (review) => Number(review.rating) === rating
        ).length,
      }))
      .filter((item) => item.value > 0);
  }, [filteredReviews]);

  // =====================================================
  // CATEGORY DATA
  // =====================================================

  const categoryData = useMemo(() => {
    return categories
      .map((category) => ({
        name:
          category.name ||
          category.title ||
          "Unnamed",
        count:
          Number(category.garmentCount) ||
          Number(category.count) ||
          0,
      }))
      .slice(0, 12);
  }, [categories]);

  // =====================================================
  // RECENT USERS
  // =====================================================

  const recentUsers = useMemo(() => {
    return [...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 8);
  }, [users]);

  // =====================================================
  // RECENT REVIEWS
  // =====================================================

  const recentReviews = useMemo(() => {
    return [...reviews]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || b.updatedAt || 0
          ) -
          new Date(
            a.createdAt || a.updatedAt || 0
          )
      )
      .slice(0, 8);
  }, [reviews]);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (isNaN(parsed)) return "—";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // NAME
  // =====================================================

  const getUserName = (user) => {
    return (
      user.fullName ||
      user.name ||
      user.username ||
      user.email ||
      "Customer"
    );
  };

  // =====================================================
  // INITIAL
  // =====================================================

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "C";
  };

  // =====================================================
  // PRINT
  // =====================================================

  const printReport = () => {
    window.print();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="reports-loading-page">
        <div className="reports-spinner"></div>
        <h3>Preparing reports...</h3>
        <p>Fetching live data from your system</p>
      </div>
    );
  }

  return (
    <div className="admin-reports">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">

        <div>
          <div className="reports-breadcrumb">
            Admin / Reports
          </div>

          <h1>Reports & Analytics</h1>

          <p>
            Real-time overview of your cleaning business
            data and customer activity.
          </p>
        </div>

        <div className="reports-header-actions">

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="period-select"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>

          <button
            className="report-refresh"
            onClick={() => fetchReports(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>

          <button
            className="report-print"
            onClick={printReport}
          >
            🖨 Print
          </button>

        </div>
      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="report-kpis">

        <div className="kpi-card">
          <div className="kpi-icon users-icon">👥</div>

          <div>
            <span>Total Customers</span>
            <strong>{totalUsers}</strong>
            <small>
              {filteredUsers.length} in selected period
            </small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon review-icon">★</div>

          <div>
            <span>Total Reviews</span>
            <strong>{totalReviews}</strong>
            <small>
              {filteredReviews.length} in selected period
            </small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon rating-icon">⭐</div>

          <div>
            <span>Average Rating</span>
            <strong>{averageRating}</strong>
            <small>Based on real reviews</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon gallery-icon">▣</div>

          <div>
            <span>Gallery Images</span>
            <strong>{totalGallery}</strong>
            <small>Uploaded media</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon category-icon">◫</div>

          <div>
            <span>Rate Categories</span>
            <strong>{totalCategories}</strong>
            <small>Active pricing groups</small>
          </div>
        </div>

      </div>

      {/* =================================================
          CUSTOMER GROWTH
      ================================================= */}

      <section className="report-panel">

        <div className="panel-header">

          <div>
            <span className="panel-label">
              CUSTOMER ANALYTICS
            </span>

            <h2>Customer Growth</h2>

            <p>
              New customer registrations based on actual
              account creation dates.
            </p>
          </div>

          <div className="live-indicator">
            <span></span>
            Live Data
          </div>

        </div>

        <div className="chart-container">

          {customerGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={330}>
              <LineChart data={customerGrowth}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="customers"
                  name="New Customers"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />

              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-chart-data">
              No customer registration data available.
            </div>
          )}

        </div>

      </section>

      {/* =================================================
          TWO CHARTS
      ================================================= */}

      <div className="reports-two-column">

        {/* RATING */}

        <section className="report-panel">

          <div className="panel-header compact">

            <div>
              <span className="panel-label">
                REVIEW ANALYTICS
              </span>

              <h2>Rating Distribution</h2>
            </div>

          </div>

          <div className="chart-container small-chart">

            {filteredReviews.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={ratingData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="rating"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Reviews"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-chart-data">
                No reviews available.
              </div>
            )}

          </div>

        </section>

        {/* PIE */}

        <section className="report-panel">

          <div className="panel-header compact">

            <div>
              <span className="panel-label">
                CUSTOMER FEEDBACK
              </span>

              <h2>Review Share</h2>
            </div>

          </div>

          <div className="pie-chart-area">

            {ratingPieData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={290}
              >
                <PieChart>

                  <Pie
                    data={ratingPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {ratingPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-chart-data">
                No rating data available.
              </div>
            )}

          </div>

        </section>

      </div>

      {/* =================================================
          CATEGORY REPORT
      ================================================= */}

      <section className="report-panel">

        <div className="panel-header">

          <div>
            <span className="panel-label">
              RATE MANAGEMENT
            </span>

            <h2>Rate Categories</h2>

            <p>
              Categories currently available in your
              rate management system.
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate("/admin/rate-categories")
            }
          >
            Manage Categories →
          </button>

        </div>

        {categories.length > 0 ? (
          <div className="category-grid">

            {categories.map((category, index) => (

              <div
                className="category-card"
                key={
                  category._id ||
                  category.id ||
                  index
                }
              >

                <div className="category-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="category-info">
                  <h3>
                    {category.name ||
                      category.title ||
                      "Unnamed Category"}
                  </h3>

                  <span>
                    {category.isActive === false
                      ? "Inactive"
                      : "Active"}
                  </span>
                </div>

                <div className="category-arrow">
                  →
                </div>

              </div>

            ))}

          </div>
        ) : (
          <div className="empty-report">
            No rate categories found.
          </div>
        )}

      </section>

      {/* =================================================
          RECENT CUSTOMERS
      ================================================= */}

      <section className="report-panel">

        <div className="panel-header">

          <div>
            <span className="panel-label">
              CUSTOMER REPORT
            </span>

            <h2>Recent Customers</h2>

            <p>
              Latest customers registered on the website.
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate("/admin/customers")
            }
          >
            View Customers →
          </button>

        </div>

        {recentUsers.length > 0 ? (

          <div className="table-scroll">

            <table className="professional-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {recentUsers.map((user, index) => {

                  const name = getUserName(user);

                  return (
                    <tr
                      key={
                        user._id ||
                        user.id ||
                        index
                      }
                    >

                      <td>
                        <div className="customer-cell">

                          <div className="customer-avatar">
                            {getInitial(name)}
                          </div>

                          <div>
                            <strong>{name}</strong>
                            <span>
                              Customer #{index + 1}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        {user.mobile ||
                          user.phone ||
                          "—"}
                      </td>

                      <td>
                        {user.email || "—"}
                      </td>

                      <td>
                        {formatDate(user.createdAt)}
                      </td>

                      <td>
                        <span className="status-badge">
                          Active
                        </span>
                      </td>

                    </tr>
                  );

                })}

              </tbody>

            </table>

          </div>

        ) : (
          <div className="empty-report">
            No customers found.
          </div>
        )}

      </section>

      {/* =================================================
          RECENT REVIEWS
      ================================================= */}

      <section className="report-panel">

        <div className="panel-header">

          <div>
            <span className="panel-label">
              CUSTOMER FEEDBACK
            </span>

            <h2>Recent Reviews</h2>

            <p>
              Latest reviews received from customers.
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate("/admin/reviews")
            }
          >
            View Reviews →
          </button>

        </div>

        {recentReviews.length > 0 ? (

          <div className="review-list">

            {recentReviews.map((review, index) => {

              const rating =
                Number(review.rating) || 0;

              const name =
                review.fullName ||
                review.name ||
                review.username ||
                "Customer";

              return (
                <div
                  className="review-row"
                  key={
                    review._id ||
                    review.id ||
                    index
                  }
                >

                  <div className="review-avatar">
                    {getInitial(name)}
                  </div>

                  <div className="review-main">

                    <div className="review-top">

                      <strong>{name}</strong>

                      <div className="review-stars">

                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <span
                              key={star}
                              className={
                                star <= rating
                                  ? "star active"
                                  : "star"
                              }
                            >
                              ★
                            </span>
                          )
                        )}

                      </div>

                    </div>

                    <p>
                      {review.review ||
                        review.comment ||
                        "No review text available."}
                    </p>

                    <small>
                      {formatDate(
                        review.createdAt ||
                          review.updatedAt
                      )}
                    </small>

                  </div>

                </div>
              );
            })}

          </div>

        ) : (
          <div className="empty-report">
            No reviews found.
          </div>
        )}

      </section>

      {/* =================================================
          REPORT FOOTER
      ================================================= */}

      <div className="report-footer">

        <div>
          <strong>KRISHNA DRY CLEANING</strong>
          <span>
            Administrative Reports
          </span>
        </div>

        <div>
          Generated on{" "}
          {new Date().toLocaleString("en-IN")}
        </div>

      </div>

    </div>
  );
}

export default AdminReports;