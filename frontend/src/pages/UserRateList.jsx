
import { useEffect, useMemo, useState } from "react";
import "../css/UserRateList.css";

const API_URL = "http://localhost:2340";

// =====================================================
// CONTACT NUMBERS
// =====================================================

const WHATSAPP_NUMBER = "9910655308";
const CALL_NUMBER = "+9910655308";

// =====================================================
// SERVICES
// =====================================================

const SERVICES = [
  "All Services",
  "Dry Cleaning",
  "Charak",
  "Steam Press",
  "Rafu",
];

const ITEMS_PER_PAGE = 9;

function UserRateList() {
  const [categories, setCategories] = useState([]);
  const [rates, setRates] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedService, setSelectedService] =
    useState("All Services");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOGIN CHECK
  // =====================================================

  const checkLoginBeforeAction = (callback) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    // ===================================================
    // NOT LOGGED IN
    // ===================================================

    if (!token) {
      alert(
        "Please login first to use this feature."
      );

      // IMPORTANT:
      // Login nahi hai to koi action nahi hoga
      // Koi navigation bhi nahi hogi
      return;
    }

    // ===================================================
    // LOGGED IN
    // ===================================================

    callback();
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        categoryResponse,
        rateResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/rate-categories`
        ),
        fetch(
          `${API_URL}/api/rates`
        ),
      ]);

      if (
        !categoryResponse.ok ||
        !rateResponse.ok
      ) {
        throw new Error(
          "Server response failed"
        );
      }

      const categoryData =
        await categoryResponse.json();

      const rateData =
        await rateResponse.json();

      if (!categoryData.success) {
        throw new Error(
          categoryData.message ||
            "Failed to load categories"
        );
      }

      if (!rateData.success) {
        throw new Error(
          rateData.message ||
            "Failed to load rates"
        );
      }

      const activeCategories =
        (categoryData.data || [])
          .filter(
            (category) =>
              category.isActive !== false
          )
          .sort(
            (a, b) =>
              (a.sortOrder || 0) -
              (b.sortOrder || 0)
          );

      const activeRates =
        (rateData.data || [])
          .filter(
            (rate) =>
              rate.isActive !== false
          )
          .sort(
            (a, b) =>
              (a.sortOrder || 0) -
              (b.sortOrder || 0)
          );

      setCategories(
        activeCategories
      );

      setRates(activeRates);

      if (
        activeCategories.length > 0
      ) {
        setSelectedCategory(
          String(
            activeCategories[0]._id
          )
        );
      }
    } catch (err) {
      console.error(
        "USER RATE LIST ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load rate list"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CATEGORY COUNT
  // =====================================================

  const getCategoryRateCount = (
    categoryId
  ) => {
    return rates.filter(
      (rate) => {
        const id =
          rate.categoryId?._id ||
          rate.categoryId;

        return (
          String(id) ===
          String(categoryId)
        );
      }
    ).length;
  };

  // =====================================================
  // SELECTED CATEGORY
  // =====================================================

  const selectedCategoryData =
    categories.find(
      (category) =>
        String(category._id) ===
        String(selectedCategory)
    );

  // =====================================================
  // CATEGORY NAME FROM RATE
  // =====================================================

  const getRateCategoryName = (
    rate
  ) => {
    if (rate.categoryId?.name) {
      return rate.categoryId.name;
    }

    const category =
      categories.find(
        (item) =>
          String(item._id) ===
          String(
            rate.categoryId?._id ||
              rate.categoryId
          )
      );

    return (
      category?.name ||
      selectedCategoryData?.name ||
      "General"
    );
  };

  // =====================================================
  // SERVICE ICON
  // =====================================================

  const getServiceIcon = (
    service
  ) => {
    switch (service) {
      case "Dry Cleaning":
        return "✦";

      case "Charak":
        return "✧";

      case "Steam Press":
        return "♨";

      case "Rafu":
        return "✚";

      default:
        return "✓";
    }
  };

  // =====================================================
  // CATEGORY ICON
  // =====================================================

  const getCategoryIcon = (
    name
  ) => {
    const value =
      name?.toLowerCase() || "";

    if (
      value.includes("men")
    ) {
      return "👔";
    }

    if (
      value.includes("women") ||
      value.includes("ladies")
    ) {
      return "👗";
    }

    if (
      value.includes("lehenga")
    ) {
      return "💃";
    }

    if (
      value.includes("saree") ||
      value.includes("sari")
    ) {
      return "🥻";
    }

    if (
      value.includes("kid")
    ) {
      return "🧒";
    }

    if (
      value.includes("shoe")
    ) {
      return "👟";
    }

    if (
      value.includes("house")
    ) {
      return "🏠";
    }

    if (
      value.includes("wedding")
    ) {
      return "💍";
    }

    return "🧺";
  };

  // =====================================================
  // PRICE
  // =====================================================

  const formatPrice = (
    price
  ) => {
    return Number(
      price || 0
    ).toLocaleString(
      "en-IN"
    );
  };

  // =====================================================
  // WHATSAPP LINK
  // =====================================================

  const getWhatsAppLink = (
    rate
  ) => {
    const message =
      `Hello Krishna Dry Cleaning,\n\n` +
      `I want to enquire about:\n` +
      `Category: ${getRateCategoryName(
        rate
      )}\n` +
      `Item: ${
        rate.garment || "N/A"
      }\n` +
      `Service: ${
        rate.service || "N/A"
      }\n` +
      `Price: ₹${formatPrice(
        rate.price
      )} ${
        rate.unit ||
        "Per Piece"
      }\n\n` +
      `Please share more details.`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
  };

  // =====================================================
  // FILTER RATES
  // =====================================================

  const filteredRates =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return rates.filter(
        (rate) => {
          const categoryId =
            rate.categoryId?._id ||
            rate.categoryId;

          const categoryMatch =
            String(categoryId) ===
            String(
              selectedCategory
            );

          const serviceMatch =
            selectedService ===
              "All Services" ||
            rate.service ===
              selectedService;

          const garment =
            rate.garment || "";

          const service =
            rate.service || "";

          const category =
            getRateCategoryName(
              rate
            );

          const searchMatch =
            !searchText ||
            `${garment} ${service} ${category}`
              .toLowerCase()
              .includes(
                searchText
              );

          return (
            categoryMatch &&
            serviceMatch &&
            searchMatch
          );
        }
      );
    }, [
      rates,
      selectedCategory,
      selectedService,
      search,
      categories,
    ]);

  // =====================================================
  // RESET PAGINATION
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedService,
    search,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      filteredRates.length /
        ITEMS_PER_PAGE
    );

  const paginatedRates =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredRates.slice(
        startIndex,
        startIndex +
          ITEMS_PER_PAGE
      );
    }, [
      filteredRates,
      currentPage,
    ]);

  const startItem =
    filteredRates.length === 0
      ? 0
      : (currentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const endItem = Math.min(
    currentPage *
      ITEMS_PER_PAGE,
    filteredRates.length
  );

  // =====================================================
  // PAGINATION NUMBERS
  // =====================================================

  const getPaginationPages =
    () => {
      if (totalPages <= 5) {
        return Array.from(
          {
            length: totalPages,
          },
          (_, index) =>
            index + 1
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
  // CATEGORY CHANGE
  // =====================================================

  const handleCategoryChange = (
    categoryId
  ) => {
    setSelectedCategory(
      String(categoryId)
    );

    setSelectedService(
      "All Services"
    );

    setSearch("");
    setCurrentPage(1);
  };

  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const changePage = (
    page
  ) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    setTimeout(() => {
      document
        .querySelector(
          ".rates-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");

    setSelectedService(
      "All Services"
    );

    setCurrentPage(1);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="user-rate-page">

        <div className="user-rate-loading">

          <div className="loading-logo">
            K
          </div>

          <div className="user-rate-spinner"></div>

          <span className="loading-small">
            KRISHNA DRY CLEANING
          </span>

          <h3>
            Preparing Rate List
          </h3>

          <p>
            Please wait while we
            prepare our latest
            pricing.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="user-rate-page">

        <div className="user-rate-error">

          <div className="error-icon">
            !
          </div>

          <span className="error-label">
            SOMETHING WENT WRONG
          </span>

          <h2>
            Unable to Load Rates
          </h2>

          <p>
            {error}
          </p>

          <button
            className="primary-button"
            onClick={loadData}
          >
            <span>
              Try Again
            </span>

            <span>
              →
            </span>
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="user-rate-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="user-rate-hero">

        <div className="hero-glow hero-glow-one"></div>

        <div className="hero-glow hero-glow-two"></div>

        <div className="user-rate-container hero-container">

          <div className="hero-content">

            <div className="hero-label">

              <span className="label-dot"></span>

              KRISHNA DRY CLEANING

            </div>

            <h1>
              Premium care.
              <br />

              <span>
                Transparent pricing.
              </span>
            </h1>

            <p className="hero-description">
              Discover professional
              garment care services
              with simple, transparent
              and affordable pricing.
            </p>

            <div className="hero-points">

              <div className="hero-point">
                <span>✓</span>

                <p>
                  Transparent Pricing
                </p>
              </div>

              <div className="hero-point">
                <span>✓</span>

                <p>
                  Professional Care
                </p>
              </div>

              <div className="hero-point">
                <span>✓</span>

                <p>
                  No Hidden Charges
                </p>
              </div>

            </div>

          </div>

          <div className="hero-visual">

            <div className="hero-card">

              <div className="hero-card-top">

                <div className="hero-card-icon">
                  ₹
                </div>

                <span>
                  OUR PROMISE
                </span>

              </div>

              <div className="hero-card-line"></div>

              <strong>
                Quality care,
                <br />
                honest prices.
              </strong>

              <p>
                Your clothes deserve
                the best professional
                treatment.
              </p>

              <div className="hero-card-bottom">

                <span>
                  KRISHNA
                </span>

                <strong>
                  Professional Service
                </strong>

              </div>

            </div>

            <div className="floating-badge">

              <span>✦</span>

              Premium
              <br />

              Garment Care

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="user-rate-container">

        {/* =================================================
            CATEGORY SECTION
        ================================================= */}

        <section className="category-section">

          <div className="section-header">

            <div>

              <span className="section-label">
                OUR CATEGORIES
              </span>

              <h2>
                Choose a Category
              </h2>

              <p>
                Select a category to
                explore detailed
                service pricing.
              </p>

            </div>

            <div className="category-count">

              <strong>
                {categories.length}
              </strong>

              <span>
                Categories
              </span>

            </div>

          </div>

          <div className="category-grid">

            {categories.map(
              (category) => {

                const selected =
                  String(
                    selectedCategory
                  ) ===
                  String(
                    category._id
                  );

                return (
                  <button
                    type="button"
                    key={
                      category._id
                    }
                    className={`category-card ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleCategoryChange(
                        category._id
                      )
                    }
                  >

                    <div className="category-card-header">

                      <div className="category-icon">
                        {getCategoryIcon(
                          category.name
                        )}
                      </div>

                      {selected && (
                        <div className="selected-check">
                          ✓
                        </div>
                      )}

                    </div>

                    <div className="category-card-body">

                      <h3>
                        {category.name}
                      </h3>

                      <p>
                        {
                          getCategoryRateCount(
                            category._id
                          )
                        }{" "}
                        services available
                      </p>

                    </div>

                    <div className="category-card-arrow">
                      →
                    </div>

                  </button>
                );
              }
            )}

          </div>

        </section>

        {/* =================================================
            RATES SECTION
        ================================================= */}

        <section className="rates-section">

          {/* =================================================
              QUICK CATEGORY
          ================================================= */}

          <div className="quick-category-section">

            <div className="quick-category-header">

              <div>

                <span className="quick-category-label">
                  QUICK CATEGORY
                </span>

                <h3>
                  Choose Category
                </h3>

              </div>

              <div className="quick-category-current">

                <span className="current-category-icon">
                  {getCategoryIcon(
                    selectedCategoryData?.name
                  )}
                </span>

                <span>
                  {selectedCategoryData?.name ||
                    "Select Category"}
                </span>

              </div>

            </div>

            <div className="quick-category-list">

              {categories.map(
                (category) => {

                  const selected =
                    String(
                      selectedCategory
                    ) ===
                    String(
                      category._id
                    );

                  return (
                    <button
                      type="button"
                      key={
                        category._id
                      }
                      className={`quick-category-card ${
                        selected
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleCategoryChange(
                          category._id
                        )
                      }
                    >

                      <span className="quick-category-icon">
                        {getCategoryIcon(
                          category.name
                        )}
                      </span>

                      <span className="quick-category-info">

                        <strong>
                          {category.name}
                        </strong>

                        <small>
                          {
                            getCategoryRateCount(
                              category._id
                            )
                          }{" "}
                          services
                        </small>

                      </span>

                      {selected && (
                        <span className="quick-category-check">
                          ✓
                        </span>
                      )}

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* =================================================
              HEADING
          ================================================= */}

          <div className="rates-heading">

            <div>

              <span className="section-label">
                PRICING
              </span>

              <div className="pricing-title-row">

                <h2>
                  {selectedCategoryData?.name ||
                    "Rate List"}
                </h2>

                <span className="pricing-count">
                  {filteredRates.length}{" "}
                  items
                </span>

              </div>

              <p>
                Select a service below
                to view item-wise
                pricing.
              </p>

            </div>

          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="rate-filter">

            <div className="search-box">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search garment, service or category..."
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
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

            <div className="service-tabs">

              {SERVICES.map(
                (service) => {

                  const active =
                    selectedService ===
                    service;

                  return (
                    <button
                      type="button"
                      key={service}
                      className={
                        active
                          ? "active"
                          : ""
                      }
                      onClick={() => {

                        setSelectedService(
                          service
                        );

                        setCurrentPage(
                          1
                        );

                      }}
                    >

                      <span className="service-tab-icon">
                        {getServiceIcon(
                          service
                        )}
                      </span>

                      <span>
                        {service}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* =================================================
              RESULT INFO
          ================================================= */}

          {filteredRates.length >
            0 && (
            <div className="rate-result-info">

              <div>

                Showing{" "}

                <strong>
                  {startItem}
                </strong>

                {" - "}

                <strong>
                  {endItem}
                </strong>

                {" of "}

                <strong>
                  {
                    filteredRates.length
                  }
                </strong>

                {" services"}

              </div>

              <span>
                Page{" "}
                {currentPage}
                {" of "}
                {totalPages}
              </span>

            </div>
          )}

          {/* =================================================
              RATE CARDS
          ================================================= */}

          {filteredRates.length ===
          0 ? (

            <div className="empty-rates">

              <div className="empty-rate-icon">
                ₹
              </div>

              <span className="empty-label">
                NO MATCHING SERVICES
              </span>

              <h3>
                No Rates Available
              </h3>

              <p>
                We couldn't find
                pricing matching your
                current filters.
              </p>

              <button
                type="button"
                className="clear-filter-button"
                onClick={
                  clearFilters
                }
              >

                <span>
                  Clear Filters
                </span>

                <span>
                  ↻
                </span>

              </button>

            </div>

          ) : (

            <>

              <div className="rate-card-grid">

                {paginatedRates.map(
                  (rate) => {

                    const categoryName =
                      getRateCategoryName(
                        rate
                      );

                    return (
                      <article
                        className="user-rate-card"
                        key={
                          rate._id
                        }
                      >

                        {/* CARD TOP */}

                        <div className="rate-card-top">

                          <div className="rate-service-icon">
                            {getServiceIcon(
                              rate.service
                            )}
                          </div>

                          <div className="rate-service-info">

                            <span>
                              SERVICE
                            </span>

                            <strong>
                              {
                                rate.service
                              }
                            </strong>

                          </div>

                          <div className="rate-card-status">

                            <span></span>

                            Available

                          </div>

                        </div>

                        {/* CATEGORY */}

                        <div className="rate-card-category-box">

                          <div className="category-mini-icon">
                            {getCategoryIcon(
                              categoryName
                            )}
                          </div>

                          <div className="category-mini-content">

                            <small>
                              CATEGORY
                            </small>

                            <strong>
                              {
                                categoryName
                              }
                            </strong>

                          </div>

                          <div className="category-mini-arrow">
                            ✓
                          </div>

                        </div>

                        {/* GARMENT */}

                        <div className="rate-card-content">

                          <span className="rate-card-label">
                            SERVICE ITEM
                          </span>

                          <h3>
                            {
                              rate.garment
                            }
                          </h3>

                          <p className="rate-card-description">
                            Professional
                            care with
                            premium
                            garment
                            handling.
                          </p>

                        </div>

                        {/* PRICE */}

                        <div className="rate-card-price">

                          <div className="price-main">

                            <span className="price-label">
                              Starting from
                            </span>

                            <div className="price-value">

                              <span className="rupee">
                                ₹
                              </span>

                              <strong>
                                {formatPrice(
                                  rate.price
                                )}
                              </strong>

                            </div>

                          </div>

                          <span className="rate-unit">
                            {rate.unit ||
                              "Per Piece"}
                          </span>

                        </div>

                        {/* FOOTER */}

                        <div className="rate-card-footer">

                          <span>
                            <i>
                              ✓
                            </i>
                            Quality Care
                          </span>

                          <span>
                            <i>
                              ✓
                            </i>
                            Expert Handling
                          </span>

                          <span>
                            <i>
                              ✓
                            </i>
                            Safe Process
                          </span>

                        </div>

                        {/* =================================================
                            WHATSAPP + CALL
                        ================================================= */}

                        <div className="rate-card-contact">

                          <button
                            type="button"
                            className="whatsapp-button"
                            onClick={() => {

                              checkLoginBeforeAction(
                                () => {

                                  window.open(
                                    getWhatsAppLink(
                                      rate
                                    ),
                                    "_blank",
                                    "noopener,noreferrer"
                                  );

                                }
                              );

                            }}
                          >

                            <span>
                              💬
                            </span>

                            WhatsApp

                          </button>

                          <button
                            type="button"
                            className="call-button"
                            onClick={() => {

                              checkLoginBeforeAction(
                                () => {

                                  window.location.href =
                                    `tel:${CALL_NUMBER}`;

                                }
                              );

                            }}
                          >

                            <span>
                              📞
                            </span>

                            Call Now

                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {totalPages > 1 && (

                <div className="pagination-wrapper">

                  <div className="pagination-info">

                    <span>
                      Showing
                    </span>

                    <strong>
                      {startItem}-
                      {endItem}
                    </strong>

                    <span>
                      of{" "}
                      {
                        filteredRates.length
                      }
                    </span>

                  </div>

                  <div className="pagination">

                    <button
                      type="button"
                      className="pagination-arrow"
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        changePage(
                          currentPage -
                            1
                        )
                      }
                      aria-label="Previous page"
                    >
                      ←
                    </button>

                    {getPaginationPages().map(
                      (
                        page,
                        index
                      ) => {

                        if (
                          page ===
                          "..."
                        ) {
                          return (
                            <span
                              className="pagination-dots"
                              key={`dots-${index}`}
                            >
                              •••
                            </span>
                          );
                        }

                        return (
                          <button
                            type="button"
                            key={
                              page
                            }
                            className={
                              currentPage ===
                              page
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              changePage(
                                page
                              )
                            }
                          >
                            {
                              page
                            }
                          </button>
                        );
                      }
                    )}

                    <button
                      type="button"
                      className="pagination-arrow"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        changePage(
                          currentPage +
                            1
                        )
                      }
                      aria-label="Next page"
                    >
                      →
                    </button>

                  </div>

                </div>

              )}

            </>
          )}

        </section>

        {/* =================================================
            CTA
        ================================================= */}

        <section className="rate-cta">

          <div className="cta-decoration"></div>

          <div className="cta-left">

            <div className="cta-icon">
              ✦
            </div>

            <div>

              <span>
                NEED PROFESSIONAL CARE?
              </span>

              <h2>
                Need help with your
                garment care?
              </h2>

              <p>
                Contact Krishna Dry
                Cleaning for
                professional cleaning
                and garment care.
              </p>

            </div>

          </div>

          {/* =================================================
              CTA CONTACT BUTTONS
          ================================================= */}

          <div className="cta-contact-buttons">

            <button
              type="button"
              className="cta-whatsapp"
              onClick={() => {

                checkLoginBeforeAction(
                  () => {

                    window.open(
                      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        "Hello Krishna Dry Cleaning, I want to enquire about your professional dry cleaning services."
                      )}`,
                      "_blank",
                      "noopener,noreferrer"
                    );

                  }
                );

              }}
            >

              <span>
                💬
              </span>

              WhatsApp

            </button>

            <button
              type="button"
              className="cta-call"
              onClick={() => {

                checkLoginBeforeAction(
                  () => {

                    window.location.href =
                      `tel:${CALL_NUMBER}`;

                  }
                );

              }}
            >

              <span>
                📞
              </span>

              Call Now

            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default UserRateList;
