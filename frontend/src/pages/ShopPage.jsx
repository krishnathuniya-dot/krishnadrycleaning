import { useState, useEffect, useCallback } from "react";
import "../css/ShopPage.css";

/* ==========================================================
   API CONFIG
========================================================== */

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "https://krishnadrycleaning.onrender.com/api";

const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/* ==========================================================
   DAYS
========================================================== */

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

/* ==========================================================
   REAL SHOP LOCATION
========================================================== */

const SHOP_LATITUDE = 28.6063112;
const SHOP_LONGITUDE = 77.0589786;

/* ==========================================================
   SHOP ADDRESS
========================================================== */

const SHOP_ADDRESS =
  "B-41, Gali No. 19, Main Rajapuri Road, Uttam Nagar, Delhi - 110059";

/* ==========================================================
   MEDIA URL
========================================================== */

const getMediaUrl = (url) => {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
};

/* ==========================================================
   SKELETON
========================================================== */

function ShopSkeleton() {
  return (
    <div className="shop-page-wrapper">

      <section className="shop-hero">
        <div className="shop-hero-content">

          <div
            className="skeleton"
            style={{
              width: 130,
              height: 32,
              marginBottom: 18,
            }}
          />

          <div
            className="skeleton"
            style={{
              width: "65%",
              height: 52,
              marginBottom: 14,
            }}
          />

          <div
            className="skeleton"
            style={{
              width: "40%",
              height: 25,
              marginBottom: 18,
            }}
          />

          <div
            className="skeleton"
            style={{
              width: "80%",
              height: 80,
              marginBottom: 24,
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >

            <div
              className="skeleton"
              style={{
                width: 180,
                height: 50,
              }}
            />

            <div
              className="skeleton"
              style={{
                width: 180,
                height: 50,
              }}
            />

          </div>

        </div>
      </section>

      <div className="shop-main-content">

        <div>

          <div className="shop-card">
            <div
              className="skeleton"
              style={{
                width: "100%",
                height: 350,
              }}
            />
          </div>

          <div className="shop-card">
            <div
              className="skeleton"
              style={{
                width: "100%",
                height: 350,
              }}
            />
          </div>

        </div>

        <div>

          <div className="shop-card">
            <div
              className="skeleton"
              style={{
                width: "100%",
                height: 350,
              }}
            />
          </div>

          <div className="shop-card">
            <div
              className="skeleton"
              style={{
                width: "100%",
                height: 300,
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   ERROR
========================================================== */

function ErrorState({ message, onRetry }) {
  return (
    <div className="shop-error-state">

      <div className="error-icon">
        ⚠️
      </div>

      <h2>
        Shop Details Load Nahi Hui
      </h2>

      <p>
        {message ||
          "Server se shop details nahi mil pa rahi hain."}
      </p>

      <button
        className="retry-btn"
        onClick={onRetry}
      >
        🔄 Retry
      </button>

    </div>
  );
}

/* ==========================================================
   MAIN COMPONENT
========================================================== */

function Shop() {

  const [shop, setShop] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeImage, setActiveImage] =
    useState(0);

  /* ========================================================
     FETCH SHOP
  ======================================================== */

  const fetchShop = useCallback(
    async () => {

      try {

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/shop`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            data?.message ||
              `Server Error: ${response.status}`
          );

        }

        const shopData =
          data?.data ||
          data?.shop ||
          data?.shopData ||
          data;

        if (!shopData?.shopName) {

          throw new Error(
            "Backend se valid shop data nahi mila."
          );

        }

        setShop(shopData);

        setActiveImage(0);

      } catch (err) {

        console.error(
          "Shop fetch error:",
          err
        );

        setError(
          err?.message ||
            "Shop details load nahi ho payi."
        );

        setShop(null);

      } finally {

        setLoading(false);

      }

    },
    []
  );

  /* ========================================================
     INITIAL API CALL
  ======================================================== */

  useEffect(() => {

    fetchShop();

  }, [fetchShop]);

  /* ========================================================
     PRELOAD IMAGES
  ======================================================== */

  useEffect(() => {

    if (
      !shop?.images?.length
    ) {
      return;
    }

    shop.images.forEach(
      (image) => {

        const img =
          new Image();

        img.src =
          getMediaUrl(image);

      }
    );

  }, [shop]);

  /* ========================================================
     LOADING
  ======================================================== */

  if (loading) {

    return (
      <ShopSkeleton />
    );

  }

  /* ========================================================
     ERROR
  ======================================================== */

  if (
    error ||
    !shop
  ) {

    return (
      <ErrorState
        message={error}
        onRetry={fetchShop}
      />
    );

  }

  /* ========================================================
     PHONE
  ======================================================== */

  const cleanPhone =
    (shop.phone || "")
      .replace(/\D/g, "");

  /* ========================================================
     WHATSAPP
  ======================================================== */

  const whatsappLink =
    cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
          `Hi ${shop.shopName}, I want to know about your services.`
        )}`
      : "#";

  /* ========================================================
     EXACT MAP LOCATION
  ======================================================== */

  const latitude =
    SHOP_LATITUDE;

  const longitude =
    SHOP_LONGITUDE;

  const mapEmbedSrc =
    `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;

  const mapDirectionsLink =
    `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  const mapOpenLink =
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  /* ========================================================
     IMAGES
  ======================================================== */

  const images =
    Array.isArray(shop.images)
      ? shop.images
      : [];

  const safeImageIndex =
    images.length > 0
      ? Math.min(
          activeImage,
          images.length - 1
        )
      : 0;

  const currentImage =
    images.length > 0
      ? getMediaUrl(
          images[safeImageIndex]
        )
      : "";

  /* ========================================================
     VIDEO
  ======================================================== */

  const videoUrl =
    getMediaUrl(
      shop.video
    );

  /* ========================================================
     REAL SHOP IMAGE FOR MAP CARD
  ======================================================== */

  const mapShopImage =
    images.length > 0
      ? getMediaUrl(images[0])
      : "";

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div className="shop-page-wrapper">

      {/* ====================================================
          HERO
      ==================================================== */}

      <section className="shop-hero">

        <div className="shop-hero-content">

          {/* STATUS */}

          <span
            className={`shop-status-badge ${
              shop.isActive
                ? "status-open"
                : "status-closed"
            }`}
          >
            {shop.isActive
              ? "🟢 Open Now"
              : "🔴 Closed"}
          </span>

          {/* SHOP NAME */}

          <div className="shop-title-box">

            <h1 className="gradient-text">
              {shop.shopName}
            </h1>

            {shop.tagline && (
              <p className="shop-tagline">
                {shop.tagline}
              </p>
            )}

            {shop.description && (
              <p className="shop-desc">
                {shop.description}
              </p>
            )}

          </div>

          {/* BUTTONS */}

          <div className="shop-cta-row">

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="shop-btn call-btn"
              >
                📞 Call: {shop.phone}
              </a>
            )}

            {cleanPhone && (
              <a
                href={whatsappLink}
                className="shop-btn whatsapp-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp Chat
              </a>
            )}

          </div>

          {/* EMAIL */}

          {shop.email && (
            <p className="shop-email-line">

              ✉️{" "}

              <a
                href={`mailto:${shop.email}`}
                className="email-link"
              >
                {shop.email}
              </a>

            </p>
          )}

        </div>

      </section>

      {/* ====================================================
          MAIN CONTENT
      ==================================================== */}

      <div className="shop-main-content">

        {/* ==================================================
            LEFT COLUMN
        ================================================== */}

        <div className="shop-left-col">

          {/* =================================================
              VIDEO
          ================================================= */}

          {videoUrl && (

            <div className="shop-card video-card">

              <h2>
                🎥 Watch Our Process
              </h2>

              <div className="video-container">

                <video
                  controls
                  preload="metadata"
                  playsInline
                  poster={
                    images.length
                      ? getMediaUrl(
                          images[0]
                        )
                      : undefined
                  }
                >

                  <source
                    src={videoUrl}
                    type="video/mp4"
                  />

                  Your browser does not support
                  the video tag.

                </video>

              </div>

            </div>

          )}

          {/* =================================================
              GALLERY
          ================================================= */}

          {images.length > 0 && (

            <div className="shop-card gallery-card">

              <h2>
                📸 Shop Gallery
              </h2>

              {/* MAIN IMAGE */}

              <div className="gallery-main-view shop-photo-container">

                {currentImage ? (

                  <img
                    src={currentImage}
                    alt={`${shop.shopName} shop`}
                    className="shop-photo"
                  />

                ) : (

                  <div className="no-image">
                    Image not available
                  </div>

                )}

              </div>

              {/* THUMBNAILS */}

              <div className="gallery-grid">

                {images.map(
                  (image, index) => (

                    <button
                      type="button"
                      key={`${image}-${index}`}
                      className={`gallery-img-box ${
                        activeImage === index
                          ? "active-thumb"
                          : ""
                      }`}
                      onClick={() =>
                        setActiveImage(index)
                      }
                      aria-label={`View image ${
                        index + 1
                      }`}
                    >

                      <img
                        src={getMediaUrl(image)}
                        alt={`Shop ${
                          index + 1
                        }`}
                      />

                    </button>

                  )
                )}

              </div>

            </div>

          )}

          {/* =================================================
              SERVICES
          ================================================= */}

          {Array.isArray(
            shop.services
          ) &&
            shop.services.length > 0 && (

              <div className="shop-card services-card">

                <h2>
                  ✨ Services Provided
                </h2>

                <div className="services-grid-box">

                  {shop.services.map(
                    (
                      service,
                      index
                    ) => (

                      <div
                        key={`${service}-${index}`}
                        className="service-badge-item"
                      >
                        ✨ {service}
                      </div>

                    )
                  )}

                </div>

              </div>

            )}

        </div>

        {/* ==================================================
            RIGHT COLUMN
        ================================================== */}

        <div className="shop-right-col">

          {/* =================================================
              LOCATION
          ================================================= */}

          <div className="shop-card info-card">

            <h2>
              📍 Store Location
            </h2>

            <p className="address-text">
              {shop.address ||
                SHOP_ADDRESS}
            </p>

            {/* =================================================
                REAL SHOP IMAGE + MAP
            ================================================= */}

            <div className="shop-map-wrapper">

              {/* REAL SHOP IMAGE */}

              {mapShopImage && (

                <div className="map-shop-photo">

                  <img
                    src={mapShopImage}
                    alt={`${shop.shopName} real shop`}
                  />

                  <div className="map-shop-overlay">

                    <div className="map-shop-title">
                      {shop.shopName}
                    </div>

                    <div className="map-shop-location">
                      📍 Our Store Location
                    </div>

                  </div>

                </div>

              )}

              {/* GOOGLE MAP */}

              <div className="map-preview-box">

                <iframe
                  title="Krishna Dry Cleaners Location"
                  src={mapEmbedSrc}
                  width="100%"
                  height="300"
                  loading="lazy"
                  allowFullScreen
                  style={{
                    border: 0,
                    display: "block",
                  }}
                  referrerPolicy="no-referrer-when-downgrade"
                />

              </div>

            </div>

            {/* MAP BUTTONS */}

            <div className="map-buttons-row">

              <a
                href={mapDirectionsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="map-direction-btn"
              >
                🗺️ Get Directions
              </a>

              <a
                href={mapOpenLink}
                target="_blank"
                rel="noopener noreferrer"
                className="map-open-btn"
              >
                📍 Open in Google Maps
              </a>

            </div>

          </div>

          {/* =================================================
              OPENING HOURS
          ================================================= */}

          {shop.openingHours && (

            <div className="shop-card hours-card">

              <h2>
                🕒 Opening Hours
              </h2>

              <ul className="hours-list">

                {DAYS.map(
                  ({
                    key,
                    label,
                  }) => {

                    const time =
                      shop.openingHours?.[
                        key
                      ] ||
                      "Closed";

                    return (

                      <li key={key}>

                        <span className="day-name">
                          {label}
                        </span>

                        <span
                          className={`time-val ${
                            time
                              .toLowerCase()
                              .includes(
                                "closed"
                              )
                              ? "closed-time"
                              : ""
                          }`}
                        >
                          {time}
                        </span>

                      </li>

                    );

                  }
                )}

              </ul>

            </div>

          )}

          {/* =================================================
              QUICK CONTACT
          ================================================= */}

          <div className="shop-card contact-card">

            <h2>
              📞 Quick Contact
            </h2>

            {cleanPhone && (

              <a
                href={`tel:${cleanPhone}`}
                className="contact-row"
              >

                <span className="contact-icon">
                  📞
                </span>

                <span>
                  {shop.phone}
                </span>

              </a>

            )}

            {shop.email && (

              <a
                href={`mailto:${shop.email}`}
                className="contact-row"
              >

                <span className="contact-icon">
                  ✉️
                </span>

                <span>
                  {shop.email}
                </span>

              </a>

            )}

            {cleanPhone && (

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row whatsapp-row"
              >

                <span className="contact-icon">
                  💬
                </span>

                <span>
                  Chat on WhatsApp
                </span>

              </a>

            )}

          </div>

        </div>

      </div>

      {/* ====================================================
          FLOATING WHATSAPP
      ==================================================== */}

      {cleanPhone && (

        <a
          href={whatsappLink}
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          💬
        </a>

      )}

    </div>
  );
}

export default Shop;