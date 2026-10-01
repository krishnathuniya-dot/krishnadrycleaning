
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/HomeUserRateList.css";
import Allreview from "./Allreview";

const API_URL = "https://krishnadrycleaning.onrender.com";

// =====================================================
// TABS
// =====================================================

const TABS = [
  {
    key: "Dry Cleaning",
    label: "Dry Clean Rates",
  },
  {
    key: "Charak",
    label: "Wash Rates",
  },
  {
    key: "Steam Press",
    label: "Steam Press Rates",
  },
  {
    key: "Rafu",
    label: "Rafu Rates",
  },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

function HomeUserRateList() {
  const [activeTab, setActiveTab] =
    useState(TABS[0].key);

  const [categories, setCategories] =
    useState([]);

  const [rates, setRates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const sliderRef = useRef(null);

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
        catRes,
        rateRes,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/rate-categories`
        ),
        fetch(
          `${API_URL}/api/rates`
        ),
      ]);

      if (
        !catRes.ok ||
        !rateRes.ok
      ) {
        throw new Error(
          "Server response failed"
        );
      }

      const catData =
        await catRes.json();

      const rateData =
        await rateRes.json();

      if (!catData.success) {
        throw new Error(
          catData.message ||
            "Categories failed"
        );
      }

      if (!rateData.success) {
        throw new Error(
          rateData.message ||
            "Rates failed"
        );
      }

      const activeCategories =
        (catData.data || [])
          .filter(
            (c) =>
              c.isActive !== false
          )
          .sort(
            (a, b) =>
              (a.sortOrder || 0) -
              (b.sortOrder || 0)
          );

      const activeRates =
        (rateData.data || [])
          .filter(
            (r) =>
              r.isActive !== false
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
    } catch (err) {
      console.error(
        "RATE CARDS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load rates"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BUILD CARDS
  // =====================================================

  const buildCards = () => {
    const cards = [];

    categories.forEach(
      (category) => {
        const categoryRates =
          rates.filter(
            (rate) => {
              const id =
                rate.categoryId?._id ||
                rate.categoryId;

              return (
                String(id) ===
                String(category._id)
              );
            }
          );

        const matchingRates =
          categoryRates.filter(
            (r) =>
              r.service ===
              activeTab
          );

        if (
          matchingRates.length === 0
        ) {
          return;
        }

        cards.push({
          id: category._id,

          title:
            category.name,

          icon:
            getCategoryIcon(
              category.name
            ),

          items:
            matchingRates
              .slice(0, 7)
              .map((r) => ({
                name:
                  r.garment ||
                  r.itemName ||
                  "Item",

                price:
                  r.price,

                oldPrice:
                  r.oldPrice,

                unit:
                  r.unit ||
                  "pc",
              })),

          totalItems:
            matchingRates.length,
        });
      }
    );

    return cards;
  };

  const cards =
    buildCards();

  // =====================================================
  // CATEGORY ICON
  // =====================================================

  function getCategoryIcon(
    name
  ) {
    const v =
      name?.toLowerCase() ||
      "";

    if (
      v.includes("men")
    )
      return "👔";

    if (
      v.includes("women") ||
      v.includes("ladies")
    )
      return "👗";

    if (
      v.includes("lehenga")
    )
      return "💃";

    if (
      v.includes("saree") ||
      v.includes("sari")
    )
      return "🥻";

    if (
      v.includes("kid")
    )
      return "🧒";

    if (
      v.includes("shoe")
    )
      return "👟";

    if (
      v.includes("house")
    )
      return "🏠";

    if (
      v.includes("wedding")
    )
      return "💍";

    if (
      v.includes("organic")
    )
      return "🧥";

    return "🧺";
  }

  // =====================================================
  // SLIDER
  // =====================================================

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -400,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: 400,
      behavior: "smooth",
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <section
        className="rcv-section"
        aria-label="Rate list"
      >
        <div className="rcv-container">

          {/* ================= TABS ================= */}

          <div className="rcv-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`rcv-tab ${
                  activeTab === t.key
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    t.key
                  )
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ================= LOADING ================= */}

          {loading && (
            <div className="rcv-state">

              <div className="rcv-spinner"></div>

              <p>
                Loading rates...
              </p>

            </div>
          )}

          {/* ================= ERROR ================= */}

          {!loading &&
            error && (
              <div className="rcv-state">

                <div className="rcv-error-icon">
                  !
                </div>

                <h3>
                  Unable to load rates
                </h3>

                <p>
                  {error}
                </p>

                <button
                  className="rcv-retry"
                  onClick={
                    loadData
                  }
                >
                  Try Again
                </button>

              </div>
            )}

          {/* ================= SLIDER ================= */}

          {!loading &&
            !error &&
            cards.length > 0 && (
              <div className="rcv-slider-wrap">

                {/* LEFT ARROW */}

                <button
                  className="rcv-arrow left"
                  onClick={
                    scrollLeft
                  }
                  aria-label="Previous"
                >
                  ‹
                </button>

                {/* CARDS */}

                <div
                  className="rcv-slider"
                  ref={sliderRef}
                >
                  {cards.map(
                    (card) => (
                      <CardItem
                        key={card.id}
                        card={card}
                      />
                    )
                  )}
                </div>

                {/* RIGHT ARROW */}

                <button
                  className="rcv-arrow right"
                  onClick={
                    scrollRight
                  }
                  aria-label="Next"
                >
                  ›
                </button>

              </div>
            )}

          {/* ================= EMPTY ================= */}

          {!loading &&
            !error &&
            cards.length === 0 && (
              <div className="rcv-state">

                <div className="rcv-empty-icon">
                  ₹
                </div>

                <h3>
                  No Rates Available
                </h3>

                <p>
                  No pricing found for
                  this service type.
                </p>

              </div>
            )}

        </div>
      </section>

      {/* ================= ALL REVIEWS ================= */}

      <Allreview />
    </>
  );
}

// =====================================================
// CARD COMPONENT
// =====================================================

function CardItem({
  card,
}) {
  const navigate =
    useNavigate();

  // =====================================================
  // VIEW FULL LIST
  // =====================================================

  const handleViewFull = () => {
    // ================================================
    // FIRST CHECK LOGIN
    // ================================================

    const token =
      localStorage.getItem(
        "token"
      );

    // ================================================
    // NOT LOGGED IN
    // ================================================

    if (!token) {
      alert(
        "Please login first to view the full rate list."
      );

      // Kisi page par navigate nahi karega
      return;
    }

    // ================================================
    // LOGGED IN
    // ================================================

    navigate("/rate-list");
  };

  return (
    <div className="rcv-card">

      {/* ================= HEADER ================= */}

      <div className="rcv-card-head">

        <div className="rcv-card-icon">
          {card.icon}
        </div>

        <h3>
          {card.title}
        </h3>

      </div>

      {/* ================= TABLE ================= */}

      <div className="rcv-table">

        <div className="rcv-table-head">

          <span>
            Item
          </span>

          <span>
            Price
          </span>

        </div>

        <div className="rcv-table-body">

          {card.items.map(
            (item, i) => (
              <div
                className="rcv-row"
                key={i}
              >

                <span className="rcv-item">
                  {item.name}
                </span>

                <span className="rcv-price">

                  {item.oldPrice && (
                    <del>
                      ₹
                      {
                        item.oldPrice
                      }
                    </del>
                  )}

                  <strong>
                    ₹
                    {item.price}
                  </strong>

                  <em>
                    /
                    {item.unit}
                  </em>

                </span>

              </div>
            )
          )}

        </div>

      </div>

      {/* ================= NOTE ================= */}

      <p className="rcv-note">
        *Prices shown with coupon
        MY25 applied. Valid on first
        order. All prices inclusive
        of taxes.
      </p>

      {/* ================= BUTTON ================= */}

      <button
        className="rcv-btn"
        onClick={
          handleViewFull
        }
      >
        View Full List

        <span>
          →
        </span>

      </button>

    </div>
  );
}

export default HomeUserRateList;
