import React, { useEffect, useRef, useState } from "react";
import "../css/ShopManagement.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

const MAX_IMAGES = 6;

const ShopManagement = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [video, setVideo] = useState(null);
  const [images, setImages] = useState([]);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [form, setForm] = useState({
    shopName: "",
    tagline: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    services: "",

    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  });

  useEffect(() => {
    loadShop();
  }, []);

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  const loadShop = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/shop/admin`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Unable to load shop");
        return;
      }

      const s = data.shop;

      setShop(s);

      setForm({
        shopName: s.shopName || "",
        tagline: s.tagline || "",
        description: s.description || "",
        phone: s.phone || "",
        email: s.email || "",
        address: s.address || "",
        city: s.city || "",
        latitude: s.latitude || "",
        longitude: s.longitude || "",

        services: s.services?.join(", ") || "",

        monday: s.openingHours?.monday || "",
        tuesday: s.openingHours?.tuesday || "",
        wednesday: s.openingHours?.wednesday || "",
        thursday: s.openingHours?.thursday || "",
        friday: s.openingHours?.friday || "",
        saturday: s.openingHours?.saturday || "",
        sunday: s.openingHours?.sunday || "",
      });
    } catch (error) {
      console.error(error);
      alert("Unable to load shop information");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // VIDEO
  // =====================================================

  const handleVideoChange = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }

    if (selected.size > 100 * 1024 * 1024) {
      alert("Video size must be less than 100MB.");
      return;
    }

    setVideo(selected);
  };

  // =====================================================
  // IMAGES - MAX 6
  // =====================================================

  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    const existingCount = shop?.images?.length || 0;

    const remainingSlots =
      MAX_IMAGES - existingCount;

    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_IMAGES} shop images are allowed.`);
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      alert(
        `You can upload only ${remainingSlots} more image(s). Maximum ${MAX_IMAGES} images are allowed.`
      );

      const limitedFiles =
        selectedFiles.slice(0, remainingSlots);

      setImages(limitedFiles);
      return;
    }

    setImages(selectedFiles);
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const existingImages =
        shop?.images?.length || 0;

      if (
        existingImages + images.length >
        MAX_IMAGES
      ) {
        alert(
          `Maximum ${MAX_IMAGES} shop images are allowed.`
        );
        return;
      }

      const formData = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          formData.append(key, value);
        }
      );

      if (video) {
        formData.append("video", video);
      }

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(
        `${API_URL}/api/shop/admin`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${getToken()}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Unable to save changes");
        return;
      }

      setShop(data.shop);

      setVideo(null);
      setImages([]);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }

      alert("Shop updated successfully!");

      await loadShop();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE IMAGE
  // =====================================================

  const deleteImage = async (image) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this shop image?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/shop/admin/image`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },

          body: JSON.stringify({
            image,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to delete image");
        return;
      }

      setShop((prev) => ({
        ...prev,
        images: data.images,
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to delete image.");
    }
  };

  // =====================================================
  // DELETE VIDEO
  // =====================================================

  const deleteVideo = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the current promotional video?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/shop/admin/video`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to delete video");
        return;
      }

      setShop((prev) => ({
        ...prev,
        video: "",
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to delete video.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="shop-admin-loading">
        <div className="loading-spinner"></div>

        <h3>Loading Shop Management</h3>

        <p>
          Please wait while we load your store information...
        </p>
      </div>
    );
  }

  const imageCount = shop?.images?.length || 0;

  const remainingImages =
    MAX_IMAGES - imageCount;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="shop-admin">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="shop-admin-topbar">

        <div className="shop-admin-heading">

          <div className="admin-heading-badge">
            <span></span>
            LIVE STORE
          </div>

          <h1>
            Shop
            <strong>Management</strong>
          </h1>

          <p>
            Control your store information, gallery,
            promotional video and opening hours.
          </p>

        </div>

        <div className="shop-admin-status">

          <div className="status-dot"></div>

          <div>
            <strong>
              {shop?.shopName || "Krishna Dry Cleaning"}
            </strong>

            <span>
              Public store page
            </span>
          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN FORM
      ===================================================== */}

      <form
        className="shop-admin-form"
        onSubmit={handleSave}
      >

        {/* =====================================================
            STORE INFORMATION
        ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div className="section-number">
              01
            </div>

            <div className="section-heading-text">

              <span>
                STORE PROFILE
              </span>

              <h2>
                Store Information
              </h2>

              <p>
                Keep your public business information
                accurate and professional.
              </p>

            </div>

          </div>


          <div className="admin-grid">

            <div className="admin-field admin-field-full">

              <label>
                Shop Name
              </label>

              <input
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                placeholder="KRISHNA DRY CLEANING"
              />

            </div>


            <div className="admin-field">

              <label>
                Tagline
              </label>

              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                placeholder="Premium Care for Your Clothes"
              />

            </div>


            <div className="admin-field">

              <label>
                Phone Number
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />

            </div>


            <div className="admin-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="shop@example.com"
              />

            </div>


            <div className="admin-field">

              <label>
                City
              </label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Delhi"
              />

            </div>


            <div className="admin-field admin-field-full">

              <label>
                Business Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                placeholder="Write a professional description about your store..."
              />

              <div className="field-helper">
                This description will appear on your public
                store page.
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            LOCATION
        ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div className="section-number">
              02
            </div>

            <div className="section-heading-text">

              <span>
                STORE LOCATION
              </span>

              <h2>
                Address & Location
              </h2>

              <p>
                Manage your store address and Google
                Maps coordinates.
              </p>

            </div>

          </div>


          <div className="location-admin-card">

            <div className="location-preview-icon">
              📍
            </div>

            <div>

              <strong>
                Store Location
              </strong>

              <p>
                Your coordinates are used to display
                the Google Maps location.
              </p>

            </div>

          </div>


          <div className="admin-grid">

            <div className="admin-field admin-field-full">

              <label>
                Complete Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                placeholder="Gali No 19, Rajapuri, Uttam Nagar, Delhi"
              />

            </div>


            <div className="admin-field">

              <label>
                City
              </label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
              />

            </div>


            <div className="admin-field">

              <label>
                Latitude
              </label>

              <input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="28.6063112"
              />

            </div>


            <div className="admin-field">

              <label>
                Longitude
              </label>

              <input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="77.0399242"
              />

            </div>


            <div className="admin-field admin-field-full">

              <label>
                Services
              </label>

              <input
                name="services"
                value={form.services}
                onChange={handleChange}
                placeholder="Dry Cleaning, Charak, Steam Press, Rafu"
              />

              <div className="service-preview">

                {form.services
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((service, index) => (
                    <span key={index}>
                      {service}
                    </span>
                  ))}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            PROMOTIONAL VIDEO
        ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div className="section-number">
              03
            </div>

            <div className="section-heading-text">

              <span>
                BRAND PROMOTION
              </span>

              <h2>
                Promotional Video
              </h2>

              <p>
                Upload your actual Krishna Dry Cleaning
                advertisement for the public hero section.
              </p>

            </div>

          </div>


          {shop?.video ? (

            <div className="current-video-card">

              <div className="video-preview">

                <video
                  src={`${API_URL}${shop.video}`}
                  controls
                  playsInline
                />

                <div className="video-live-badge">
                  CURRENT VIDEO
                </div>

              </div>

              <div className="video-card-footer">

                <div>

                  <strong>
                    Promotional advertisement
                  </strong>

                  <span>
                    Currently published on your store page
                  </span>

                </div>

                <button
                  type="button"
                  onClick={deleteVideo}
                  className="danger-button"
                >
                  Delete Video
                </button>

              </div>

            </div>

          ) : (

            <div className="empty-media">

              <div className="empty-media-icon">
                ▶
              </div>

              <div>
                <strong>
                  No promotional video uploaded
                </strong>

                <span>
                  Add your shop advertisement below.
                </span>
              </div>

            </div>

          )}


          <div
            className="upload-dropzone video-dropzone"
            onClick={() =>
              videoInputRef.current?.click()
            }
          >

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
            />

            <div className="upload-icon">
              ↑
            </div>

            <div className="upload-content">

              <strong>
                {video
                  ? video.name
                  : "Upload Advertisement Video"}
              </strong>

              <span>
                Click to choose your video
              </span>

              <small>
                MP4, WEBM or MOV · Maximum 100MB
              </small>

            </div>

          </div>

        </section>


        {/* =====================================================
            SHOP GALLERY
        ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-header gallery-header">

            <div className="section-number">
              04
            </div>

            <div className="section-heading-text">

              <span>
                STORE GALLERY
              </span>

              <h2>
                Shop Photos
              </h2>

              <p>
                Upload real photographs of your Krishna
                Dry Cleaning store.
              </p>

            </div>

            <div className="image-counter">

              <strong>
                {imageCount}
              </strong>

              <span>
                / {MAX_IMAGES}
              </span>

              <small>
                photos
              </small>

            </div>

          </div>


          {shop?.images?.length > 0 ? (

            <div className="admin-image-grid">

              {shop.images.map(
                (image, index) => (

                  <div
                    className="admin-image-card"
                    key={image}
                  >

                    <img
                      src={`${API_URL}${image}`}
                      alt={`Shop ${index + 1}`}
                    />

                    <div className="image-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <button
                      type="button"
                      className="image-delete"
                      onClick={() =>
                        deleteImage(image)
                      }
                      aria-label="Delete image"
                    >
                      ×
                    </button>

                    <div className="image-overlay">
                      <span>
                        Krishna Dry Cleaning
                      </span>
                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="empty-gallery">

              <div>
                ◎
              </div>

              <strong>
                No shop photos yet
              </strong>

              <span>
                Add real store photographs to make
                your public page look professional.
              </span>

            </div>

          )}


          {remainingImages > 0 ? (

            <div
              className="upload-dropzone image-dropzone"
              onClick={() =>
                imageInputRef.current?.click()
              }
            >

              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImagesChange}
              />

              <div className="upload-icon">
                +
              </div>

              <div className="upload-content">

                <strong>
                  {images.length > 0
                    ? `${images.length} new image(s) selected`
                    : "Add Shop Photos"}
                </strong>

                <span>
                  Click here to choose photographs
                </span>

                <small>
                  JPG, PNG or WEBP · {remainingImages} slot(s) remaining
                </small>

              </div>

            </div>

          ) : (

            <div className="gallery-limit">

              <div>
                ✓
              </div>

              <span>
                You have reached the maximum of{" "}
                <strong>{MAX_IMAGES} photos</strong>.
              </span>

            </div>

          )}

        </section>


        {/* =====================================================
            OPENING HOURS
        ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div className="section-number">
              05
            </div>

            <div className="section-heading-text">

              <span>
                STORE TIMINGS
              </span>

              <h2>
                Opening Hours
              </h2>

              <p>
                Let customers know when your store
                is available.
              </p>

            </div>

          </div>


          <div className="hours-grid">

            {[
              ["monday", "Monday", "MON"],
              ["tuesday", "Tuesday", "TUE"],
              ["wednesday", "Wednesday", "WED"],
              ["thursday", "Thursday", "THU"],
              ["friday", "Friday", "FRI"],
              ["saturday", "Saturday", "SAT"],
              ["sunday", "Sunday", "SUN"],
            ].map(
              ([key, label, short]) => (

                <div
                  className="hours-card"
                  key={key}
                >

                  <div className="day-badge">
                    {short}
                  </div>

                  <div className="hours-input">

                    <label>
                      {label}
                    </label>

                    <input
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder="09:00 AM - 09:00 PM"
                    />

                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* =====================================================
            SAVE BAR
        ===================================================== */}

        <div className="admin-save-bar">

          <div className="save-info">

            <div className="save-check">
              ✓
            </div>

            <div>

              <strong>
                Ready to publish?
              </strong>

              <span>
                Your changes will appear on the
                public store page.
              </span>

            </div>

          </div>


          <button
            type="submit"
            disabled={saving}
            className="save-shop-button"
          >

            {saving ? (
              <>
                <span className="button-spinner"></span>
                Saving Changes...
              </>
            ) : (
              <>
                Save Shop Changes
                <span>→</span>
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
};

export default ShopManagement;