
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Allreview.css";
import Footer from "../component/Footer";

const API_URL = "http://localhost:2340";

function Allreview() {
  const navigate = useNavigate();

  const [backendReviews, setBackendReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [message, setMessage] = useState("");

  // =====================================================
  // 20 DUMMY REVIEWS
  // =====================================================

  const dummyReviews = [
    {
      _id: "dummy-01",
      fullName: "Aarav Sharma",
      rating: 5,
      review:
        "Excellent dry cleaning service. My clothes came back fresh, spotless and perfectly packed.",
      profileImage: "https://i.pravatar.cc/150?img=12",
      location: "Delhi",
      createdAt: "2026-08-20T10:00:00.000Z",
    },
    {
      _id: "dummy-02",
      fullName: "Priya Verma",
      rating: 5,
      review:
        "Really impressed with the quality. The finishing of my dresses was absolutely perfect.",
      profileImage: "https://i.pravatar.cc/150?img=47",
      location: "Delhi",
      createdAt: "2026-08-18T10:00:00.000Z",
    },
    {
      _id: "dummy-03",
      fullName: "Rohan Mehta",
      rating: 4,
      review:
        "Very professional service and timely delivery. My formal clothes looked fresh and neat.",
      profileImage: "https://i.pravatar.cc/150?img=11",
      location: "Noida",
      createdAt: "2026-08-16T10:00:00.000Z",
    },
    {
      _id: "dummy-04",
      fullName: "Ananya Gupta",
      rating: 5,
      review:
        "I loved the way they handled my expensive clothes. Everything looked beautifully finished.",
      profileImage: "https://i.pravatar.cc/150?img=32",
      location: "Gurgaon",
      createdAt: "2026-08-14T10:00:00.000Z",
    },
    {
      _id: "dummy-05",
      fullName: "Karan Malhotra",
      rating: 5,
      review:
        "Amazing steam press service. My shirts were perfectly crisp and completely wrinkle free.",
      profileImage: "https://i.pravatar.cc/150?img=68",
      location: "Delhi",
      createdAt: "2026-08-12T10:00:00.000Z",
    },
    {
      _id: "dummy-06",
      fullName: "Neha Kapoor",
      rating: 5,
      review:
        "Very clean work and beautiful packaging. The entire experience was smooth and professional.",
      profileImage: "https://i.pravatar.cc/150?img=44",
      location: "Delhi",
      createdAt: "2026-08-10T10:00:00.000Z",
    },
    {
      _id: "dummy-07",
      fullName: "Aditya Singh",
      rating: 4,
      review:
        "Good service and friendly staff. My clothes were delivered exactly when promised.",
      profileImage: "https://i.pravatar.cc/150?img=53",
      location: "Noida",
      createdAt: "2026-08-08T10:00:00.000Z",
    },
    {
      _id: "dummy-08",
      fullName: "Simran Kaur",
      rating: 5,
      review:
        "One of the best dry cleaning experiences I have had. The clothes looked fresh and premium.",
      profileImage: "https://i.pravatar.cc/150?img=49",
      location: "Delhi",
      createdAt: "2026-08-06T10:00:00.000Z",
    },
    {
      _id: "dummy-09",
      fullName: "Rahul Khanna",
      rating: 5,
      review:
        "My wedding suit was handled with great care. The final finish was excellent.",
      profileImage: "https://i.pravatar.cc/150?img=15",
      location: "Gurgaon",
      createdAt: "2026-08-04T10:00:00.000Z",
    },
    {
      _id: "dummy-10",
      fullName: "Isha Bansal",
      rating: 5,
      review:
        "Quick pickup, excellent cleaning and perfect delivery. Very happy with the service.",
      profileImage: "https://i.pravatar.cc/150?img=45",
      location: "Delhi",
      createdAt: "2026-08-02T10:00:00.000Z",
    },
    {
      _id: "dummy-11",
      fullName: "Vikram Arora",
      rating: 4,
      review:
        "Professional team and very good quality. My formal clothes looked fresh again.",
      profileImage: "https://i.pravatar.cc/150?img=13",
      location: "Delhi",
      createdAt: "2026-07-30T10:00:00.000Z",
    },
    {
      _id: "dummy-12",
      fullName: "Mehak Jain",
      rating: 5,
      review:
        "Loved the premium packaging. My clothes were spotless and nicely finished.",
      profileImage: "https://i.pravatar.cc/150?img=25",
      location: "Noida",
      createdAt: "2026-07-28T10:00:00.000Z",
    },
    {
      _id: "dummy-13",
      fullName: "Sahil Gupta",
      rating: 5,
      review:
        "Their stain removal service worked really well. Very satisfied with the results.",
      profileImage: "https://i.pravatar.cc/150?img=51",
      location: "Delhi",
      createdAt: "2026-07-26T10:00:00.000Z",
    },
    {
      _id: "dummy-14",
      fullName: "Tanya Sethi",
      rating: 5,
      review:
        "Excellent customer service and great attention to detail. I will definitely use them again.",
      profileImage: "https://i.pravatar.cc/150?img=36",
      location: "Gurgaon",
      createdAt: "2026-07-24T10:00:00.000Z",
    },
    {
      _id: "dummy-15",
      fullName: "Mohit Tiwari",
      rating: 4,
      review:
        "Good quality dry cleaning and very convenient service. Delivery was also on time.",
      profileImage: "https://i.pravatar.cc/150?img=60",
      location: "Delhi",
      createdAt: "2026-07-22T10:00:00.000Z",
    },
    {
      _id: "dummy-16",
      fullName: "Ritika Sharma",
      rating: 5,
      review:
        "My sarees were cleaned beautifully. The fabric still looks fresh and elegant.",
      profileImage: "https://i.pravatar.cc/150?img=29",
      location: "Delhi",
      createdAt: "2026-07-20T10:00:00.000Z",
    },
    {
      _id: "dummy-17",
      fullName: "Arjun Kapoor",
      rating: 5,
      review:
        "Very reliable service. I especially liked the professional packaging and finishing.",
      profileImage: "https://i.pravatar.cc/150?img=70",
      location: "Noida",
      createdAt: "2026-07-18T10:00:00.000Z",
    },
    {
      _id: "dummy-18",
      fullName: "Kavya Arora",
      rating: 5,
      review:
        "Superb experience from pickup to delivery. Everything was handled professionally.",
      profileImage: "https://i.pravatar.cc/150?img=38",
      location: "Delhi",
      createdAt: "2026-07-16T10:00:00.000Z",
    },
    {
      _id: "dummy-19",
      fullName: "Nitin Sharma",
      rating: 4,
      review:
        "The clothes smelled fresh and looked properly pressed. Good service overall.",
      profileImage: "https://i.pravatar.cc/150?img=8",
      location: "Gurgaon",
      createdAt: "2026-07-14T10:00:00.000Z",
    },
    {
      _id: "dummy-20",
      fullName: "Pooja Mehra",
      rating: 5,
      review:
        "Amazing quality and very professional service. I will definitely recommend it.",
      profileImage: "https://i.pravatar.cc/150?img=48",
      location: "Delhi",
      createdAt: "2026-07-12T10:00:00.000Z",
    },
  ];

  // =====================================================
  // GET REVIEWS
  // =====================================================

  const getReviews = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/reviews`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setBackendReviews(
          Array.isArray(data.reviews)
            ? data.reviews
            : []
        );
      } else {
        setBackendReviews([]);

        setMessage(
          "Unable to load latest customer reviews."
        );
      }
    } catch (error) {
      console.log(
        "Review Fetch Error:",
        error
      );

      setBackendReviews([]);

      setMessage(
        "Unable to connect with review server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FIRST LOAD
  // =====================================================

  useEffect(() => {
    getReviews();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "";
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
  // MERGE BACKEND + DUMMY
  // =====================================================

  const allReviews = useMemo(() => {
    const backendData = backendReviews.map(
      (review) => {
        const backendName =
          review.fullName ||
          review.name ||
          review.username ||
          review.userName ||
          review.user?.fullName ||
          review.user?.name ||
          review.user?.username ||
          review.user?.userName ||
          review.user?.firstName ||
          "Customer";

        const backendImage =
          review.profileImage ||
          review.image ||
          review.user?.profileImage ||
          review.user?.image ||
          review.user?.avatar ||
          "";

        const backendDate =
          review.createdAt ||
          review.updatedAt ||
          review.date ||
          review.created_on ||
          review.createdDate ||
          review.timestamp ||
          null;

        return {
          ...review,

          fullName: backendName,

          profileImage: backendImage,

          rating: Math.min(
            5,
            Math.max(
              1,
              Number(review.rating) || 5
            )
          ),

          review:
            review.review ||
            review.comment ||
            review.message ||
            "Excellent service.",

          location:
            review.location ||
            review.city ||
            review.user?.city ||
            "",

          createdAt: backendDate,

          isBackend: true,
        };
      }
    );

    // Newest backend review first

    backendData.sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA;
    });

    // Dummy reviews

    const dummyData =
      dummyReviews.map(
        (review) => ({
          ...review,
          isBackend: false,
        })
      );

    // Backend reviews first
    // Dummy reviews after backend

    return [
      ...backendData,
      ...dummyData,
    ];
  }, [backendReviews]);

  // =====================================================
  // SLIDER
  // =====================================================

  const cardsPerPage = 3;

  const totalPages = Math.ceil(
    allReviews.length /
      cardsPerPage
  );

  // =====================================================
  // RESET PAGE
  // =====================================================

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage >= totalPages
    ) {
      setCurrentPage(0);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // =====================================================
  // AUTO SLIDER
  // =====================================================

  useEffect(() => {
    if (totalPages <= 1) {
      return;
    }

    const interval =
      setInterval(() => {
        setCurrentPage(
          (prev) =>
            prev >= totalPages - 1
              ? 0
              : prev + 1
        );
      }, 4500);

    return () => {
      clearInterval(interval);
    };
  }, [totalPages]);

  // =====================================================
  // NEXT
  // =====================================================

  const nextSlide = () => {
    setCurrentPage(
      (prev) =>
        prev >= totalPages - 1
          ? 0
          : prev + 1
    );
  };

  // =====================================================
  // PREVIOUS
  // =====================================================

  const previousSlide = () => {
    setCurrentPage(
      (prev) =>
        prev <= 0
          ? totalPages - 1
          : prev - 1
    );
  };

  // =====================================================
  // VISIBLE REVIEWS
  // =====================================================

  const startIndex =
    currentPage * cardsPerPage;

  const visibleReviews =
    allReviews.slice(
      startIndex,
      startIndex + cardsPerPage
    );

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  // =====================================================
  // AVERAGE RATING
  // =====================================================

  const averageRating = useMemo(() => {
    if (!allReviews.length) {
      return "5.0";
    }

    const total =
      allReviews.reduce(
        (sum, item) =>
          sum +
          Number(
            item.rating || 5
          ),
        0
      );

    return (
      total / allReviews.length
    ).toFixed(1);
  }, [allReviews]);

  // =====================================================
  // WRITE REVIEW
  // =====================================================

  const handleWriteReview = () => {
    const token =
      localStorage.getItem("token");

    // Login nahi hai
    if (!token) {
      alert(
        "Please login first to write a review."
      );
      return;
    }

    // Login hai
    navigate("/re");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* =================================================
          REVIEWS SECTION
      ================================================= */}

      <section className="reviews-section">

        <div className="reviews-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="reviews-header">

            <div className="reviews-header-left">

              <span className="reviews-eyebrow">
                CUSTOMER EXPERIENCES
              </span>

              <h2>
                Trusted by people
                <br />

                <span>
                  who care about their clothes.
                </span>
              </h2>

              <p>
                Discover what our customers say
                about their dry cleaning and
                garment care experience.
              </p>

            </div>

            {/* =================================================
                RIGHT HEADER
            ================================================= */}

            <div className="reviews-header-right">

              <div className="reviews-rating-box">

                <div className="rating-top">

                  <div className="rating-number">
                    {averageRating}
                  </div>

                  <div>

                    <div className="rating-stars">
                      ★★★★★
                    </div>

                    <span className="rating-label">
                      Customer Rating
                    </span>

                  </div>

                </div>

                <div className="rating-line"></div>

                <span className="rating-small">
                  Trusted garment care service
                </span>

              </div>

              {/* WRITE REVIEW */}

              <button
                type="button"
                className="write-review-btn"
                onClick={
                  handleWriteReview
                }
              >

                <span className="write-review-plus">
                  ＋
                </span>

                <span>
                  Write a Review
                </span>

              </button>

            </div>

          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div className="review-message">
              {message}
            </div>
          )}

          {/* =================================================
              LOADING / REVIEWS
          ================================================= */}

          {loading ? (

            <div className="reviews-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading customer experiences...
              </p>

            </div>

          ) : (

            <div className="reviews-slider-wrapper">

              {/* PREVIOUS */}

              <button
                type="button"
                className="review-arrow review-prev"
                onClick={
                  previousSlide
                }
                disabled={
                  totalPages <= 1
                }
                aria-label="Previous reviews"
              >
                ‹
              </button>

              {/* =================================================
                  REVIEW SLIDER
              ================================================= */}

              <div className="reviews-slider">

                <div
                  className="reviews-track"
                  key={currentPage}
                >

                  {visibleReviews.map(
                    (
                      item,
                      index
                    ) => {

                      const image =
                        getImageUrl(
                          item.profileImage
                        );

                      const firstLetter =
                        item.fullName
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "C";

                      return (

                        <article
                          className={
                            item.isBackend
                              ? "review-card backend-review-card"
                              : "review-card"
                          }
                          key={
                            item._id ||
                            `review-${index}`
                          }
                        >

                          {/* =================================================
                              USER
                          ================================================= */}

                          <div className="review-card-top">

                            <div className="review-user">

                              {image ? (

                                <img
                                  src={image}
                                  alt={
                                    item.fullName
                                  }
                                  className="review-avatar"
                                  onError={(
                                    e
                                  ) => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />

                              ) : (

                                <div className="review-avatar review-avatar-letter">
                                  {
                                    firstLetter
                                  }
                                </div>

                              )}

                              <div className="review-user-info">

                                <h3>
                                  {
                                    item.fullName
                                  }
                                </h3>

                                {item.isBackend ? (

                                  <span className="latest-review-label">
                                    Customer
                                  </span>

                                ) : (

                                  <span className="dummy-review-label">
                                    Customer
                                  </span>

                                )}

                              </div>

                            </div>

                            <div className="review-quote">
                              “
                            </div>

                          </div>

                          {/* =================================================
                              DATE
                          ================================================= */}

                          {item.createdAt && (
                            <div className="review-date">
                              {formatDate(
                                item.createdAt
                              )}
                            </div>
                          )}

                          {/* =================================================
                              STARS
                          ================================================= */}

                          <div className="review-stars">

                            {Array.from({
                              length: 5,
                            }).map(
                              (
                                _,
                                starIndex
                              ) => (

                                <span
                                  key={
                                    starIndex
                                  }
                                  className={
                                    starIndex <
                                    item.rating
                                      ? "active-star"
                                      : "inactive-star"
                                  }
                                >
                                  ★
                                </span>

                              )
                            )}

                          </div>

                          {/* =================================================
                              REVIEW TEXT
                          ================================================= */}

                          <p className="review-text">
                            {item.review}
                          </p>

                          {/* =================================================
                              BOTTOM
                          ================================================= */}

                          <div className="review-card-bottom">

                            <span className="verified-review">

                              <span className="verified-icon">
                                ✓
                              </span>

                              Verified customer

                            </span>

                            <span className="review-service">
                              Dry Cleaning
                            </span>

                          </div>

                        </article>

                      );
                    }
                  )}

                </div>

              </div>

              {/* NEXT */}

              <button
                type="button"
                className="review-arrow review-next"
                onClick={
                  nextSlide
                }
                disabled={
                  totalPages <= 1
                }
                aria-label="Next reviews"
              >
                ›
              </button>

            </div>

          )}

          {/* =================================================
              DOTS
          ================================================= */}

          <div className="review-dots">

            {Array.from({
              length: totalPages,
            }).map(
              (_, index) => (

                <button
                  type="button"
                  key={index}
                  className={
                    currentPage === index
                      ? "review-dot active"
                      : "review-dot"
                  }
                  onClick={() =>
                    setCurrentPage(
                      index
                    )
                  }
                  aria-label={`Go to review slide ${
                    index + 1
                  }`}
                />

              )
            )}

          </div>

          {/* =================================================
              BOTTOM
          ================================================= */}

          <div className="reviews-bottom">

            <div className="reviews-bottom-line"></div>

            <div className="reviews-bottom-content">

              <span className="bottom-star">
                ★
              </span>

              <span>
                Trusted for premium garment care
              </span>

              <span className="bottom-star">
                ★
              </span>

            </div>

            <div className="reviews-bottom-line"></div>

          </div>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <Footer />
    </>
  );
}

export default Allreview;
