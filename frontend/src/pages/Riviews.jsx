
import { useEffect, useMemo, useState } from "react";
import "../css/Allreview.css";

const API_URL = "https://krishnadrycleaning.onrender.com/api";
const BACKEND_URL = "https://krishnadrycleaning.onrender.com";

function Riviews() {
  const [backendReviews, setBackendReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [myReview, setMyReview] = useState(null);
  const [editing, setEditing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // DUMMY REVIEWS
  // =====================================================

  const dummyReviews = [
    {
      _id: "dummy-01",
      name: "Aarav Sharma",
      rating: 5,
      review:
        "Excellent dry cleaning service. My clothes came back fresh, spotless and perfectly packed.",
      profileImage: "https://i.pravatar.cc/150?img=12",
      createdAt: "2026-08-20",
    },
    {
      _id: "dummy-02",
      name: "Priya Verma",
      rating: 5,
      review:
        "Really impressed with the quality. The finishing of my dresses was absolutely perfect.",
      profileImage: "https://i.pravatar.cc/150?img=47",
      createdAt: "2026-08-18",
    },
    {
      _id: "dummy-03",
      name: "Rohan Mehta",
      rating: 4,
      review:
        "Very professional service and timely delivery. My formal clothes looked fresh and neat.",
      profileImage: "https://i.pravatar.cc/150?img=11",
      createdAt: "2026-08-17",
    },
    {
      _id: "dummy-04",
      name: "Ananya Gupta",
      rating: 5,
      review:
        "I loved the way they handled my expensive clothes. Everything looked beautifully finished.",
      profileImage: "https://i.pravatar.cc/150?img=32",
      createdAt: "2026-08-15",
    },
    {
      _id: "dummy-05",
      name: "Karan Malhotra",
      rating: 5,
      review:
        "Amazing steam press service. My shirts were perfectly crisp and completely wrinkle free.",
      profileImage: "https://i.pravatar.cc/150?img=68",
      createdAt: "2026-08-13",
    },
    {
      _id: "dummy-06",
      name: "Neha Kapoor",
      rating: 5,
      review:
        "Very clean work and beautiful packaging. The entire experience was smooth and professional.",
      profileImage: "https://i.pravatar.cc/150?img=44",
      createdAt: "2026-08-12",
    },
    {
      _id: "dummy-07",
      name: "Aditya Singh",
      rating: 4,
      review:
        "Good service and friendly staff. My clothes were delivered exactly when promised.",
      profileImage: "https://i.pravatar.cc/150?img=53",
      createdAt: "2026-08-10",
    },
    {
      _id: "dummy-08",
      name: "Simran Kaur",
      rating: 5,
      review:
        "One of the best dry cleaning experiences I have had. The clothes looked fresh and premium.",
      profileImage: "https://i.pravatar.cc/150?img=49",
      createdAt: "2026-08-09",
    },
    {
      _id: "dummy-09",
      name: "Rahul Khanna",
      rating: 5,
      review:
        "My wedding suit was handled with great care. The final finish was excellent.",
      profileImage: "https://i.pravatar.cc/150?img=15",
      createdAt: "2026-08-08",
    },
    {
      _id: "dummy-10",
      name: "Isha Bansal",
      rating: 5,
      review:
        "Quick pickup, excellent cleaning and perfect delivery. Very happy with the service.",
      profileImage: "https://i.pravatar.cc/150?img=45",
      createdAt: "2026-08-06",
    },
    {
      _id: "dummy-11",
      name: "Vikram Arora",
      rating: 4,
      review:
        "Professional team and very good quality. My formal clothes looked fresh again.",
      profileImage: "https://i.pravatar.cc/150?img=13",
      createdAt: "2026-08-05",
    },
    {
      _id: "dummy-12",
      name: "Mehak Jain",
      rating: 5,
      review:
        "Loved the premium packaging. My clothes were spotless and nicely finished.",
      profileImage: "https://i.pravatar.cc/150?img=25",
      createdAt: "2026-08-04",
    },
    {
      _id: "dummy-13",
      name: "Sahil Gupta",
      rating: 5,
      review:
        "Their stain removal service worked really well. Very satisfied with the results.",
      profileImage: "https://i.pravatar.cc/150?img=51",
      createdAt: "2026-08-03",
    },
    {
      _id: "dummy-14",
      name: "Tanya Sethi",
      rating: 5,
      review:
        "Excellent customer service and great attention to detail. I will definitely use them again.",
      profileImage: "https://i.pravatar.cc/150?img=36",
      createdAt: "2026-08-02",
    },
    {
      _id: "dummy-15",
      name: "Mohit Tiwari",
      rating: 4,
      review:
        "Good quality dry cleaning and very convenient service. Delivery was also on time.",
      profileImage: "https://i.pravatar.cc/150?img=60",
      createdAt: "2026-08-01",
    },
    {
      _id: "dummy-16",
      name: "Ritika Sharma",
      rating: 5,
      review:
        "My sarees were cleaned beautifully. The fabric still looks fresh and elegant.",
      profileImage: "https://i.pravatar.cc/150?img=29",
      createdAt: "2026-07-30",
    },
    {
      _id: "dummy-17",
      name: "Arjun Kapoor",
      rating: 5,
      review:
        "Very reliable service. I especially liked the professional packaging and finishing.",
      profileImage: "https://i.pravatar.cc/150?img=70",
      createdAt: "2026-07-29",
    },
    {
      _id: "dummy-18",
      name: "Kavya Arora",
      rating: 5,
      review:
        "Superb experience from pickup to delivery. Everything was handled professionally.",
      profileImage: "https://i.pravatar.cc/150?img=38",
      createdAt: "2026-07-28",
    },
    {
      _id: "dummy-19",
      name: "Nitin Sharma",
      rating: 4,
      review:
        "The clothes smelled fresh and looked properly pressed. Good service overall.",
      profileImage: "https://i.pravatar.cc/150?img=8",
      createdAt: "2026-07-27",
    },
    {
      _id: "dummy-20",
      name: "Pooja Mehra",
      rating: 5,
      review:
        "Amazing quality and very professional service. I will definitely recommend it.",
      profileImage: "https://i.pravatar.cc/150?img=48",
      createdAt: "2026-07-26",
    },
  ];

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // =====================================================
  // CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      const user =
        localStorage.getItem("user") ||
        localStorage.getItem("User");

      if (user) {
        return JSON.parse(user);
      }
    } catch (error) {
      console.error("User Parse Error:", error);
    }

    return null;
  };

  // =====================================================
  // CLOUDINARY + BACKEND IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
      return "";
    }

    const value = image.trim();

    if (!value) {
      return "";
    }

    // Cloudinary or other absolute image URLs
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    // Temporary browser preview
    if (value.startsWith("blob:")) {
      return value;
    }

    // Old backend upload paths
    return `${BACKEND_URL}${value.startsWith("/") ? "" : "/"}${value}`;
  };

  // =====================================================
  // RESPONSE JSON HELPER
  // =====================================================

  const readResponse = async (response) => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  // =====================================================
  // GET REVIEWS
  // =====================================================

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/reviews`);
      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to fetch reviews."
        );
      }

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.reviews)) {
        list = data.reviews;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.data?.reviews)) {
        list = data.data.reviews;
      } else if (Array.isArray(data?.result)) {
        list = data.result;
      }

      setBackendReviews(list);
    } catch (error) {
      console.error("Get Reviews Error:", error);
      setBackendReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET MY REVIEW
  // =====================================================

  const fetchMyReview = async () => {
    const token = getToken();

    if (!token) {
      setMyReview(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reviews/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (response.ok && data?.success && data?.exists) {
        setMyReview(data.review || null);
      } else {
        setMyReview(null);
      }
    } catch (error) {
      console.error("My Review Error:", error);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchReviews();
    fetchMyReview();
  }, []);

  // =====================================================
  // MERGE BACKEND REVIEWS
  // =====================================================

  const allReviews = useMemo(() => {
    const backendData = backendReviews.map((item) => ({
      ...item,

      name:
        item?.name ||
        item?.fullName ||
        item?.user?.name ||
        item?.user?.fullName ||
        "Customer",

      profileImage:
        item?.profileImage ||
        item?.user?.profileImage ||
        item?.customer?.profileImage ||
        "",

      rating: Math.min(
        5,
        Math.max(1, Number(item?.rating) || 5)
      ),

      review:
        item?.review ||
        item?.comment ||
        item?.message ||
        "Excellent service.",

      createdAt:
        item?.createdAt ||
        item?.date ||
        item?.updatedAt ||
        null,

      isBackend: true,
    }));

    backendData.sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA;
    });

    const dummyData = dummyReviews.map((item) => ({
      ...item,
      isBackend: false,
    }));

    return [...backendData, ...dummyData];
  }, [backendReviews]);

  // =====================================================
  // SLIDER
  // =====================================================

  const cardsPerPage = 3;

  const totalPages = Math.ceil(
    allReviews.length / cardsPerPage
  );

  // Keep current slide valid when the list changes
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(0);
    } else if (currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

  // =====================================================
  // AUTO SLIDER
  // =====================================================

  useEffect(() => {
    if (totalPages <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentPage((previous) =>
        previous >= totalPages - 1 ? 0 : previous + 1
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [totalPages]);

  // =====================================================
  // NEXT / PREVIOUS
  // =====================================================

  const nextSlide = () => {
    if (totalPages <= 1) return;

    setCurrentPage((previous) =>
      previous >= totalPages - 1 ? 0 : previous + 1
    );
  };

  const previousSlide = () => {
    if (totalPages <= 1) return;

    setCurrentPage((previous) =>
      previous <= 0 ? totalPages - 1 : previous - 1
    );
  };

  // =====================================================
  // VISIBLE REVIEWS
  // =====================================================

  const startIndex = currentPage * cardsPerPage;

  const visibleReviews = allReviews.slice(
    startIndex,
    startIndex + cardsPerPage
  );

  // =====================================================
  // AVERAGE RATING
  // =====================================================

  const averageRating = useMemo(() => {
    if (!allReviews.length) return "0.0";

    const total = allReviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0
    );

    return (total / allReviews.length).toFixed(1);
  }, [allReviews]);

  // =====================================================
  // OPEN REVIEW FORM
  // =====================================================

  const openReviewForm = () => {
    const token = getToken();

    if (!token) {
      window.dispatchEvent(new Event("openLoginPopup"));
      return;
    }

    setError("");
    setMessage("");
    setEditing(false);
    setRating(5);
    setReviewText("");
    setHoverRating(0);
    setShowForm(true);
  };

  // =====================================================
  // EDIT MY REVIEW
  // =====================================================

  const editMyReview = () => {
    if (!myReview) return;

    setError("");
    setMessage("");
    setEditing(true);
    setRating(Number(myReview.rating) || 5);
    setReviewText(
      myReview.review ||
      myReview.comment ||
      myReview.message ||
      ""
    );
    setHoverRating(0);
    setShowForm(true);
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      window.dispatchEvent(new Event("openLoginPopup"));
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write your review.");
      return;
    }

    if (reviewText.trim().length < 3) {
      setError("Review must be at least 3 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const url = editing
        ? `${API_URL}/reviews/${encodeURIComponent(myReview._id)}`
        : `${API_URL}/reviews`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          review: reviewText.trim(),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to submit review."
        );
      }

      setMessage(
        editing
          ? "Review updated successfully!"
          : "Thank you! Your review has been added."
      );

      setReviewText("");
      setRating(5);
      setHoverRating(0);
      setShowForm(false);
      setEditing(false);

      await Promise.all([fetchReviews(), fetchMyReview()]);
      setCurrentPage(0);

      setTimeout(() => setMessage(""), 3500);
    } catch (error) {
      console.error("Submit Review Error:", error);
      setError(error.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE MY REVIEW
  // =====================================================

  const deleteMyReview = async () => {
    if (!myReview?._id) {
      setError("Review ID not found.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmDelete) return;

    const token = getToken();

    if (!token) {
      window.dispatchEvent(new Event("openLoginPopup"));
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/reviews/${encodeURIComponent(myReview._id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to delete review."
        );
      }

      setMessage("Your review has been deleted.");
      setMyReview(null);

      await fetchReviews();
      setCurrentPage(0);

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Delete Review Error:", error);
      setError(error.message || "Unable to delete review.");
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // STARS
  // =====================================================

  const renderStars = (value, interactive = false) => {
    return (
      <div
        className={
          interactive
            ? "review-stars interactive"
            : "review-stars"
        }
        aria-label={`${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={
              star <=
              (interactive ? hoverRating || rating : value)
                ? "star active"
                : "star"
            }
            onMouseEnter={() => {
              if (interactive) setHoverRating(star);
            }}
            onMouseLeave={() => {
              if (interactive) setHoverRating(0);
            }}
            onClick={() => {
              if (interactive) setRating(star);
            }}
            disabled={!interactive}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        {/* HEADER */}
        <div className="reviews-header">
          <div className="reviews-heading">
            <span className="reviews-eyebrow">
              CUSTOMER EXPERIENCES
            </span>

            <h2>
              Loved by customers.
              <br />
              <span>Trusted for every garment.</span>
            </h2>

            <p>
              Real experiences from customers who trust us
              with their favourite clothes.
            </p>
          </div>

          {/* RATING */}
          <div className="rating-summary">
            <div className="rating-main">
              <strong>{averageRating}</strong>

              <div>
                {renderStars(
                  Math.round(Number(averageRating))
                )}
                <span>Customer Rating</span>
              </div>
            </div>

            <div className="rating-line"></div>

            <div className="rating-trust">
              <span className="trust-check">✓</span>

              <div>
                <strong>Customer feedback</strong>
                <small>
                  Customer reviews and experiences.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="review-success" role="status">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="review-error" role="alert">
            <span>!</span>
            {error}
          </div>
        )}

        {/* WRITE REVIEW */}
        <div className="review-action-bar">
          <div>
            <span className="action-small">
              YOUR EXPERIENCE MATTERS
            </span>

            <h3>Had your clothes cleaned with us?</h3>

            <p>
              Share your experience and help other customers
              choose confidently.
            </p>
          </div>

          {!myReview ? (
            <button
              type="button"
              className="write-review-btn"
              onClick={openReviewForm}
            >
              <span>✦</span>
              Write a Review
              <strong>→</strong>
            </button>
          ) : (
            <div className="my-review-actions">
              <div className="your-review-badge">
                ✓ Your Review
              </div>

              <button
                type="button"
                className="edit-review-btn"
                onClick={editMyReview}
              >
                Edit
              </button>

              <button
                type="button"
                className="delete-review-btn"
                onClick={deleteMyReview}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* REVIEW FORM */}
        {showForm && (
          <div className="review-form-card">
            <div className="form-top">
              <div>
                <span>
                  {editing
                    ? "EDIT YOUR REVIEW"
                    : "SHARE YOUR EXPERIENCE"}
                </span>

                <h3>
                  {editing
                    ? "Update your feedback"
                    : "How was your experience?"}
                </h3>
              </div>

              <button
                type="button"
                className="form-close"
                onClick={() => setShowForm(false)}
                aria-label="Close review form"
              >
                ×
              </button>
            </div>

            <div className="review-user-preview">
              {(() => {
                const user = getCurrentUser();

                const image =
                  myReview?.profileImage ||
                  myReview?.user?.profileImage ||
                  user?.profileImage ||
                  user?.image ||
                  "";

                const name =
                  myReview?.name ||
                  myReview?.fullName ||
                  user?.name ||
                  user?.fullName ||
                  "You";

                const imageUrl = getImageUrl(image);

                return (
                  <>
                    <div className="preview-avatar">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span>
                          {String(name).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <strong>{name}</strong>
                      <small>
                        Your review will appear with your profile.
                      </small>
                    </div>
                  </>
                );
              })()}
            </div>

            <form onSubmit={handleSubmit} className="review-form">
              <div className="rating-input">
                <label>Your Rating</label>

                {renderStars(rating, true)}

                <span className="rating-text">
                  {rating === 5 && "Excellent"}
                  {rating === 4 && "Very Good"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Needs Improvement"}
                  {rating === 1 && "Poor"}
                </span>
              </div>

              <div className="textarea-wrapper">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about your experience with our dry cleaning service..."
                  maxLength={500}
                  rows={5}
                  required
                />

                <span>{reviewText.length}/500</span>
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : editing
                    ? "Update Review →"
                    : "Publish Review →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SLIDER TITLE */}
        <div className="reviews-section-title">
          <div>
            <span>CUSTOMER STORIES</span>
            <h3>What our customers say</h3>
          </div>
        </div>

        {/* SLIDER */}
        {loading ? (
          <div className="reviews-loading">
            <div className="loading-spinner"></div>
            <p>Loading customer reviews...</p>
          </div>
        ) : (
          <div className="reviews-slider-wrapper">
            <button
              type="button"
              className="review-arrow review-prev"
              onClick={previousSlide}
              disabled={totalPages <= 1}
              aria-label="Previous reviews"
            >
              ‹
            </button>

            <div className="reviews-slider">
              <div className="reviews-track" key={currentPage}>
                {visibleReviews.map((item, index) => {
                  const image = getImageUrl(item.profileImage);

                  const firstLetter =
                    String(item.name || "U")
                      .charAt(0)
                      .toUpperCase() || "U";

                  return (
                    <article
                      className={
                        item.isBackend
                          ? "review-card backend-review-card"
                          : "review-card"
                      }
                      key={item._id || index}
                    >
                      {/* USER */}
                      <div className="review-card-top">
                        <div className="review-author">
                          <div className="review-avatar">
                            {image ? (
                              <img
                                src={image}
                                alt={item.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";

                                  const fallback =
                                    e.currentTarget.nextElementSibling;

                                  if (fallback) {
                                    fallback.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}

                            <span
                              style={{
                                display: image ? "none" : "flex",
                              }}
                            >
                              {firstLetter}
                            </span>
                          </div>

                          <div>
                            <h4>{item.name}</h4>

                            {item.isBackend ? (
                              <span className="real-review-label">
                                ✓ Customer Review
                              </span>
                            ) : (
                              <span>Sample Review</span>
                            )}
                          </div>
                        </div>

                        <div className="review-date">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>

                      {/* STARS */}
                      <div className="review-rating-row">
                        {renderStars(item.rating)}

                        <span>
                          {Number(item.rating).toFixed(1)}
                        </span>
                      </div>

                      {/* QUOTE */}
                      <div className="review-quote">“</div>

                      {/* REVIEW */}
                      <p className="review-text">{item.review}</p>

                      {/* BOTTOM */}
                      <div className="review-card-bottom">
                        <span>
                          {item.isBackend
                            ? "✓ Customer Feedback"
                            : "Sample Feedback"}
                        </span>

                        <span>Dry Cleaning</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="review-arrow review-next"
              onClick={nextSlide}
              disabled={totalPages <= 1}
              aria-label="Next reviews"
            >
              ›
            </button>
          </div>
        )}

        {/* DOTS */}
        {!loading && totalPages > 1 && (
          <div className="review-dots">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                type="button"
                key={index}
                className={
                  currentPage === index
                    ? "review-dot active"
                    : "review-dot"
                }
                onClick={() => setCurrentPage(index)}
                aria-label={`Go to review slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* BOTTOM */}
        <div className="reviews-bottom">
          <div className="reviews-bottom-line"></div>

          <div className="reviews-bottom-content">
            <span className="bottom-star">★</span>
            <span>Trusted for premium garment care</span>
            <span className="bottom-star">★</span>
          </div>

          <div className="reviews-bottom-line"></div>
        </div>
      </div>
    </section>
  );
}

export default Riviews;
