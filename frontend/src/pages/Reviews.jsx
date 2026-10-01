import { useEffect, useMemo, useState } from "react";
import "../css/AdminReviews.css";

const API_URL = "http://localhost:2340";

function Reviews() {
  // =====================================================
  // STATES
  // =====================================================

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken") ||
      ""
    );
  };

  // =====================================================
  // GET REVIEWS
  // =====================================================

  const getReviews = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/reviews`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await response.json();

      console.log("Reviews API Response:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch reviews"
        );
      }

      let reviewData = [];

      if (Array.isArray(data)) {
        reviewData = data;
      } else if (
        Array.isArray(data?.data)
      ) {
        reviewData = data.data;
      } else if (
        Array.isArray(data?.reviews)
      ) {
        reviewData = data.reviews;
      } else if (
        Array.isArray(data?.result)
      ) {
        reviewData = data.result;
      }

      setReviews(reviewData);
    } catch (error) {
      console.error(
        "Get reviews error:",
        error
      );

      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    getReviews();
  }, []);

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

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  // =====================================================
  // CUSTOMER NAME
  // =====================================================

  const getName = (review) => {
    return (
      review?.fullName ||
      review?.name ||
      review?.user?.fullName ||
      review?.user?.name ||
      "Anonymous Customer"
    );
  };

  // =====================================================
  // EMAIL
  // =====================================================

  const getEmail = (review) => {
    return (
      review?.email ||
      review?.user?.email ||
      ""
    );
  };

  // =====================================================
  // LOCATION
  // =====================================================

  const getLocation = (review) => {
    return (
      review?.location ||
      review?.city ||
      review?.user?.city ||
      "India"
    );
  };

  // =====================================================
  // RATING
  // =====================================================

  const getRating = (review) => {
    const rating = Number(
      review?.rating
    );

    if (isNaN(rating)) {
      return 0;
    }

    return Math.min(
      5,
      Math.max(0, rating)
    );
  };

  // =====================================================
  // REVIEW TEXT
  // =====================================================

  const getReviewText = (review) => {
    return (
      review?.review ||
      review?.comment ||
      review?.message ||
      "No review text available."
    );
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (review) => {
    const status =
      review?.status ||
      review?.reviewStatus;

    if (!status) {
      return "Approved";
    }

    const normalized =
      String(status).toLowerCase();

    if (normalized === "pending") {
      return "Pending";
    }

    if (normalized === "rejected") {
      return "Rejected";
    }

    return "Approved";
  };

  // =====================================================
  // DATE
  // =====================================================

  const getDate = (review) => {
    return (
      review?.createdAt ||
      review?.date ||
      review?.updatedAt
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

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
  // AVATAR LETTER
  // =====================================================

  const getAvatarLetter = (review) => {
    return (
      getName(review)
        .charAt(0)
        .toUpperCase() || "A"
    );
  };

  // =====================================================
  // FILTER REVIEWS
  // =====================================================

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const name =
        getName(review).toLowerCase();

      const email =
        getEmail(review).toLowerCase();

      const reviewText =
        getReviewText(
          review
        ).toLowerCase();

      const location =
        getLocation(
          review
        ).toLowerCase();

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        name.includes(searchText) ||
        email.includes(searchText) ||
        reviewText.includes(searchText) ||
        location.includes(searchText);

      const rating =
        getRating(review);

      const matchesRating =
        ratingFilter === "all" ||
        rating ===
          Number(ratingFilter);

      const status =
        getStatus(review);

      const matchesStatus =
        statusFilter === "all" ||
        status.toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesRating &&
        matchesStatus
      );
    });
  }, [
    reviews,
    search,
    ratingFilter,
    statusFilter,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalFilteredReviews =
    filteredReviews.length;

  const totalPages = Math.ceil(
    totalFilteredReviews /
      reviewsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    reviewsPerPage;

  const endIndex =
    startIndex +
    reviewsPerPage;

  const paginatedReviews =
    filteredReviews.slice(
      startIndex,
      endIndex
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    ratingFilter,
    statusFilter,
  ]);

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const getPaginationPages = () => {
    if (totalPages <= 5) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, i) => i + 1
      );
    }

    if (currentPage <= 3) {
      return [
        1,
        2,
        3,
        4,
        "...",
        totalPages,
      ];
    }

    if (
      currentPage >=
      totalPages - 2
    ) {
      return [
        1,
        "...",
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

  const totalReviews =
    reviews.length;

  const fiveStarReviews =
    reviews.filter(
      (review) =>
        getRating(review) === 5
    ).length;

  const pendingReviews =
    reviews.filter(
      (review) =>
        getStatus(review) ===
        "Pending"
    ).length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum +
              getRating(review),
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  // =====================================================
  // VIEW
  // =====================================================

  const handleView = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  // =====================================================
  // DELETE REVIEW
  // =====================================================

  const handleDelete = async (review) => {
    const reviewId =
      review?._id ||
      review?.id;

    if (!reviewId) {
      alert(
        "Review ID not found."
      );
      return;
    }

    const confirmDelete =
      window.confirm(
        `Delete review from ${getName(
          review
        )}?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleteLoading(true);

      // ================================================
      // GET ADMIN TOKEN
      // ================================================

      const token =
        getToken();

      if (!token) {
        throw new Error(
          "Authorization token not found. Please login again."
        );
      }

      console.log(
        "Deleting Review:",
        reviewId
      );

      console.log(
        "Authorization token available:",
        Boolean(token)
      );

      // ================================================
      // DELETE API
      // ================================================

      const response =
        await fetch(
          `${API_URL}/api/admin/reviews/${reviewId}`,
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      // ================================================
      // READ RESPONSE
      // ================================================

      let data = {};

      try {
        data =
          await response.json();
      } catch (jsonError) {
        console.error(
          "Delete response JSON error:",
          jsonError
        );
      }

      console.log(
        "Delete Review Response:",
        data
      );

      // ================================================
      // ERROR
      // ================================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to delete review (${response.status})`
        );
      }

      // ================================================
      // REMOVE REVIEW FROM STATE
      // ================================================

      setReviews((prev) =>
        prev.filter(
          (item) =>
            String(
              item?._id ||
                item?.id
            ) !==
            String(reviewId)
        )
      );

      // ================================================
      // CLOSE MODAL
      // ================================================

      setShowModal(false);
      setSelectedReview(null);

      alert(
        "Review deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete review."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setRatingFilter("all");
    setStatusFilter("all");
  };

  // =====================================================
  // RATING STARS
  // =====================================================

  const RatingStars = ({
    rating,
    size = "normal",
  }) => {
    return (
      <div
        className={`review-stars ${size}`}
      >
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <span
              key={star}
              className={
                star <= rating
                  ? "filled"
                  : "empty"
              }
            >
              ★
            </span>
          )
        )}
      </div>
    );
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="admin-reviews-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reviews-page-header">

        <div className="reviews-title-area">

          <div className="reviews-title-icon">
            ★
          </div>

          <div>
            <h2>
              Reviews
            </h2>

            <p>
              Manage customer feedback and
              ratings.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="reviews-refresh-btn"
          onClick={getReviews}
          disabled={loading}
        >
          <span
            className={
              loading
                ? "reviews-refresh-icon spinning"
                : "reviews-refresh-icon"
            }
          >
            ↻
          </span>

          Refresh
        </button>

      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="reviews-stats">

        {/* TOTAL */}

        <div className="review-stat-card">

          <div>
            <span>
              Total Reviews
            </span>

            <strong>
              {totalReviews}
            </strong>

            <small>
              Customer feedback
            </small>
          </div>

          <div className="review-stat-icon total">
            ★
          </div>

        </div>

        {/* AVERAGE */}

        <div className="review-stat-card">

          <div>
            <span>
              Average Rating
            </span>

            <strong>
              {averageRating}
              <em>/5</em>
            </strong>

            <small className="average-small">
              <RatingStars
                rating={Math.round(
                  Number(
                    averageRating
                  )
                )}
                size="small"
              />
            </small>
          </div>

          <div className="review-stat-icon rating">
            ★
          </div>

        </div>

        {/* FIVE STAR */}

        <div className="review-stat-card">

          <div>
            <span>
              5 Star Reviews
            </span>

            <strong>
              {fiveStarReviews}
            </strong>

            <small>
              Excellent ratings
            </small>
          </div>

          <div className="review-stat-icon five">
            ★
          </div>

        </div>

        {/* PENDING */}

        <div className="review-stat-card">

          <div>
            <span>
              Pending Reviews
            </span>

            <strong>
              {pendingReviews}
            </strong>

            <small>
              Need attention
            </small>
          </div>

          <div className="review-stat-icon pending">
            !
          </div>

        </div>

      </div>

      {/* =================================================
          MAIN REVIEWS CARD
      ================================================= */}

      <div className="reviews-main-card">

        {/* CARD HEADER */}

        <div className="reviews-card-header">

          <div>
            <h3>
              Customer Reviews
            </h3>

            <p>
              {filteredReviews.length} review
              {filteredReviews.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          <div className="reviews-live">
            <i></i>
            Live Data
          </div>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="reviews-filter-bar">

          <div className="reviews-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search customer, email, review..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="reviews-filters">

            <select
              value={
                ratingFilter
              }
              onChange={(e) =>
                setRatingFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Ratings
              </option>

              <option value="5">
                ★ 5 Stars
              </option>

              <option value="4">
                ★ 4 Stars
              </option>

              <option value="3">
                ★ 3 Stars
              </option>

              <option value="2">
                ★ 2 Stars
              </option>

              <option value="1">
                ★ 1 Star
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>

            {(search ||
              ratingFilter !==
                "all" ||
              statusFilter !==
                "all") && (
              <button
                type="button"
                className="reviews-clear-btn"
                onClick={
                  clearFilters
                }
              >
                Clear
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="reviews-table-wrapper">

          {loading ? (

            <div className="reviews-loading">

              <div className="reviews-loader"></div>

              <h4>
                Loading reviews...
              </h4>

              <p>
                Fetching customer feedback.
              </p>

            </div>

          ) : filteredReviews.length ===
            0 ? (

            <div className="reviews-empty">

              <div className="reviews-empty-icon">
                ★
              </div>

              <h4>
                No reviews found
              </h4>

              <p>
                {search ||
                ratingFilter !==
                  "all" ||
                statusFilter !==
                  "all"
                  ? "Try changing your search or filters."
                  : "No customer reviews are available yet."}
              </p>

              {(search ||
                ratingFilter !==
                  "all" ||
                statusFilter !==
                  "all") && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <table className="reviews-table">

              <thead>
                <tr>

                  <th>
                    CUSTOMER
                  </th>

                  <th>
                    RATING
                  </th>

                  <th>
                    REVIEW
                  </th>

                  <th>
                    LOCATION
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    DATE
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>
              </thead>

              <tbody>

                {paginatedReviews.map(
                  (review, index) => {

                    const image =
                      getImageUrl(
                        review?.profileImage ||
                          review?.user
                            ?.profileImage
                      );

                    const rating =
                      getRating(
                        review
                      );

                    const status =
                      getStatus(
                        review
                      );

                    const id =
                      review?._id ||
                      review?.id ||
                      index;

                    return (
                      <tr
                        key={id}
                      >

                        {/* CUSTOMER */}

                        <td>

                          <div className="review-customer">

                            <div className="review-avatar">

                              {image ? (
                                <img
                                  src={image}
                                  alt={getName(
                                    review
                                  )}
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
                              ) : null}

                              <div
                                className="review-avatar-fallback"
                                style={{
                                  display:
                                    image
                                      ? "none"
                                      : "flex",
                                }}
                              >
                                {getAvatarLetter(
                                  review
                                )}
                              </div>

                            </div>

                            <div className="review-customer-info">

                              <strong>
                                {getName(
                                  review
                                )}
                              </strong>

                              <span>
                                {getEmail(
                                  review
                                ) ||
                                  "Customer"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* RATING */}

                        <td>

                          <div className="rating-cell">

                            <RatingStars
                              rating={
                                rating
                              }
                            />

                            <span>
                              {rating.toFixed(
                                1
                              )}
                            </span>

                          </div>

                        </td>

                        {/* REVIEW */}

                        <td>

                          <div className="review-text-cell">

                            <p>
                              {getReviewText(
                                review
                              )}
                            </p>

                          </div>

                        </td>

                        {/* LOCATION */}

                        <td>

                          <div className="location-cell">

                            <span>
                              ◉
                            </span>

                            {getLocation(
                              review
                            )}

                          </div>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`review-status ${status.toLowerCase()}`}
                          >
                            <i></i>
                            {status}
                          </span>

                        </td>

                        {/* DATE */}

                        <td>

                          <span className="review-date">
                            {formatDate(
                              getDate(
                                review
                              )
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="review-actions">

                            <button
                              type="button"
                              className="review-action view"
                              title="View Review"
                              onClick={() =>
                                handleView(
                                  review
                                )
                              }
                            >
                              👁
                            </button>

                            <button
                              type="button"
                              className="review-action delete"
                              title="Delete Review"
                              disabled={
                                deleteLoading
                              }
                              onClick={() =>
                                handleDelete(
                                  review
                                )
                              }
                            >
                              🗑
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
            FOOTER
        ================================================= */}

        {!loading &&
          filteredReviews.length >
            0 && (

          <div className="reviews-card-footer">

            <div className="reviews-pagination-info">

              Showing{" "}
              <strong>
                {startIndex + 1}
              </strong>{" "}
              -{" "}
              <strong>
                {Math.min(
                  endIndex,
                  totalFilteredReviews
                )}
              </strong>{" "}
              of{" "}
              <strong>
                {totalFilteredReviews}
              </strong>{" "}
              reviews

            </div>

            {totalPages > 1 && (

              <div className="reviews-pagination">

                <button
                  type="button"
                  className="pagination-arrow"
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
                    currentPage ===
                    1
                  }
                >
                  ‹
                </button>

                {getPaginationPages().map(
                  (
                    page,
                    index
                  ) =>
                    page === "..." ? (
                      <span
                        key={`dots-${index}`}
                        className="pagination-dots"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        className={`pagination-page ${
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
                  className="pagination-arrow"
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
                >
                  ›
                </button>

              </div>

            )}

            <span className="reviews-footer-brand">
              Krishna Dry Cleaning
            </span>

          </div>

        )}

      </div>

      {/* =================================================
          VIEW REVIEW MODAL
      ================================================= */}

      {showModal &&
        selectedReview && (

          <div
            className="review-modal-overlay"
            onClick={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowModal(
                  false
                );
              }
            }}
          >

            <div className="review-modal">

              {/* HEADER */}

              <div className="review-modal-header">

                <div>

                  <span>
                    CUSTOMER FEEDBACK
                  </span>

                  <h3>
                    Review Details
                  </h3>

                </div>

                <button
                  type="button"
                  className="review-modal-close"
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              {/* CUSTOMER */}

              <div className="review-modal-customer">

                <div className="review-modal-avatar">

                  {getImageUrl(
                    selectedReview?.profileImage ||
                      selectedReview?.user
                        ?.profileImage
                  ) ? (

                    <img
                      src={getImageUrl(
                        selectedReview?.profileImage ||
                          selectedReview?.user
                            ?.profileImage
                      )}
                      alt={getName(
                        selectedReview
                      )}
                    />

                  ) : (

                    <span>
                      {getAvatarLetter(
                        selectedReview
                      )}
                    </span>

                  )}

                </div>

                <div>

                  <h4>
                    {getName(
                      selectedReview
                    )}
                  </h4>

                  <p>
                    {getEmail(
                      selectedReview
                    ) ||
                      "Customer"}
                  </p>

                  <div className="modal-rating">

                    <RatingStars
                      rating={getRating(
                        selectedReview
                      )}
                    />

                    <strong>
                      {getRating(
                        selectedReview
                      ).toFixed(1)}
                      /5
                    </strong>

                  </div>

                </div>

              </div>

              {/* REVIEW BOX */}

              <div className="modal-review-box">

                <span>
                  CUSTOMER REVIEW
                </span>

                <p>
                  “
                  {getReviewText(
                    selectedReview
                  )}
                  ”
                </p>

              </div>

              {/* DETAILS */}

              <div className="review-modal-details">

                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {getLocation(
                      selectedReview
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {getStatus(
                      selectedReview
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Review Date
                  </span>

                  <strong>
                    {formatDate(
                      getDate(
                        selectedReview
                      )
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Review ID
                  </span>

                  <strong>
                    {selectedReview?._id ||
                      selectedReview?.id ||
                      "—"}
                  </strong>

                </div>

              </div>

              {/* FOOTER */}

              <div className="review-modal-footer">

                <button
                  type="button"
                  className="review-modal-secondary"
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  className="review-modal-delete"
                  disabled={
                    deleteLoading
                  }
                  onClick={() =>
                    handleDelete(
                      selectedReview
                    )
                  }
                >
                  {deleteLoading
                    ? "Deleting..."
                    : "Delete Review"}
                </button>

              </div>

            </div>

          </div>
        )}
        

    </div>
  );
}

export default Reviews;