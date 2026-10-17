
import React, { useEffect, useRef, useState } from "react";
import "../css/ShopManagement.css";

const API_URL = "https://krishnadrycleaning.onrender.com";
const MAX_IMAGES = 6;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const DEFAULT_HOURS = "09:00 AM - 09:00 PM";

const EMPTY_FORM = {
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
};

const readResponse = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    console.error("Invalid backend response:", text);

    return {
      success: false,
      message: `Server returned an invalid response (HTTP ${response.status}). Check backend logs.`,
    };
  }
};

const ShopManagement = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingImage, setDeletingImage] = useState("");
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [video, setVideo] = useState(null);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const getToken = () => localStorage.getItem("adminToken");

  const authHeaders = () => {
    const token = getToken();

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  };

  const getMediaUrl = (url) => {
    if (!url || typeof url !== "string") return "";

    if (/^https?:\/\//i.test(url)) return url;

    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleApiError = (data, fallback) => {
    const message = data?.error
      ? `${data.message || fallback}: ${data.error}`
      : data?.message || fallback;

    console.error("Shop API error:", data);
    alert(message);
  };

  const loadShop = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Admin login required. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/shop/admin`, {
        method: "GET",
        headers: authHeaders(),
      });

      const data = await readResponse(response);

      if (!response.ok || !data.success || !data.shop) {
        handleApiError(data, "Unable to load shop information");
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
        latitude: s.latitude ?? "",
        longitude: s.longitude ?? "",
        services: Array.isArray(s.services)
          ? s.services.join(", ")
          : s.services || "",
        monday: s.openingHours?.monday || DEFAULT_HOURS,
        tuesday: s.openingHours?.tuesday || DEFAULT_HOURS,
        wednesday: s.openingHours?.wednesday || DEFAULT_HOURS,
        thursday: s.openingHours?.thursday || DEFAULT_HOURS,
        friday: s.openingHours?.friday || DEFAULT_HOURS,
        saturday: s.openingHours?.saturday || DEFAULT_HOURS,
        sunday: s.openingHours?.sunday || DEFAULT_HOURS,
      });
    } catch (error) {
      console.error("Load shop error:", error);
      alert("Unable to connect to the backend. Check your connection and Render service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShop();
    // Load shop once when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVideoChange = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (
      !["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"].includes(
        selected.type
      )
    ) {
      alert("Only MP4, WEBM, MOV or AVI videos are allowed.");
      e.target.value = "";
      return;
    }

    if (selected.size > MAX_VIDEO_SIZE) {
      alert("Video size must not exceed 100MB.");
      e.target.value = "";
      return;
    }

    setVideo(selected);
  };

  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    const existingCount = shop?.images?.length || 0;
    const remainingSlots = MAX_IMAGES - existingCount;

    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_IMAGES} shop images are allowed.`);
      e.target.value = "";
      return;
    }

    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      alert("Only JPG, PNG and WEBP images are allowed.");
    }

    const limitedFiles = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      alert(`You can select only ${remainingSlots} more image(s).`);
    }

    setImages(limitedFiles);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!getToken()) {
      alert("Admin login required. Please log in again.");
      return;
    }

    const existingImages = shop?.images?.length || 0;

    if (existingImages + images.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} shop images are allowed.`);
      return;
    }

    if (
      form.latitude !== "" &&
      (!Number.isFinite(Number(form.latitude)) ||
        Number(form.latitude) < -90 ||
        Number(form.latitude) > 90)
    ) {
      alert("Latitude must be between -90 and 90.");
      return;
    }

    if (
      form.longitude !== "" &&
      (!Number.isFinite(Number(form.longitude)) ||
        Number(form.longitude) < -180 ||
        Number(form.longitude) > 180)
    ) {
      alert("Longitude must be between -180 and 180.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value ?? ""));
      });

      if (video) {
        formData.append("video", video);
      }

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(`${API_URL}/api/shop/admin`, {
        method: "PUT",
        headers: authHeaders(),
        body: formData,
      });

      const data = await readResponse(response);

      if (!response.ok || !data.success || !data.shop) {
        handleApiError(data, "Unable to save shop changes");
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
    } catch (error) {
      console.error("Save shop error:", error);
      alert("Could not connect to the backend. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (image) => {
    if (deletingImage) return;

    if (!getToken()) {
      alert("Admin login required. Please log in again.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this shop image?")) {
      return;
    }

    try {
      setDeletingImage(image);

      const response = await fetch(`${API_URL}/api/shop/admin/image`, {
        method: "DELETE",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      const data = await readResponse(response);

      if (!response.ok || !data.success) {
        handleApiError(data, "Failed to delete image");
        return;
      }

      setShop((prev) =>
        prev ? { ...prev, images: data.images || [] } : prev
      );

      setImages([]);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (error) {
      console.error("Delete image error:", error);
      alert("Could not connect to the backend while deleting the image.");
    } finally {
      setDeletingImage("");
    }
  };

  const deleteVideo = async () => {
    if (deletingVideo) return;

    if (!getToken()) {
      alert("Admin login required. Please log in again.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete the current promotional video?"
      )
    ) {
      return;
    }

    try {
      setDeletingVideo(true);

      const response = await fetch(`${API_URL}/api/shop/admin/video`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await readResponse(response);

      if (!response.ok || !data.success) {
        handleApiError(data, "Failed to delete video");
        return;
      }

      setShop((prev) => (prev ? { ...prev, video: "" } : prev));
      setVideo(null);

      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (error) {
      console.error("Delete video error:", error);
      alert("Could not connect to the backend while deleting the video.");
    } finally {
      setDeletingVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="shop-admin-loading">
        <div className="loading-spinner"></div>
        <h3>Loading Shop Management</h3>
        <p>Please wait while we load your store information...</p>
      </div>
    );
  }

  const imageCount = shop?.images?.length || 0;
  const remainingImages = MAX_IMAGES - imageCount;

  return (
    <div className="shop-admin">
      <div className="shop-admin-topbar">
        <div className="shop-admin-heading">
          <div className="admin-heading-badge">
            <span></span>
            LIVE STORE
          </div>

          <h1>
            Shop <strong>Management</strong>
          </h1>

          <p>
            Control your store information, gallery, promotional video
            and opening hours.
          </p>
        </div>

        <div className="shop-admin-status">
          <div className="status-dot"></div>
          <div>
            <strong>{shop?.shopName || "Krishna Dry Cleaning"}</strong>
            <span>Public store page</span>
          </div>
        </div>
      </div>

      <form className="shop-admin-form" onSubmit={handleSave}>
        <section className="admin-section">
          <div className="admin-section-header">
            <div className="section-number">01</div>
            <div className="section-heading-text">
              <span>STORE PROFILE</span>
              <h2>Store Information</h2>
              <p>
                Keep your public business information accurate and professional.
              </p>
            </div>
          </div>

          <div className="admin-grid">
            <div className="admin-field admin-field-full">
              <label>Shop Name</label>
              <input name="shopName" value={form.shopName} onChange={handleChange} placeholder="KRISHNA DRY CLEANING" />
            </div>

            <div className="admin-field">
              <label>Tagline</label>
              <input name="tagline" value={form.tagline} onChange={handleChange} placeholder="Premium Care for Your Clothes" />
            </div>

            <div className="admin-field">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            <div className="admin-field">
              <label>Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="shop@example.com" />
            </div>

            <div className="admin-field">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Delhi" />
            </div>

            <div className="admin-field admin-field-full">
              <label>Business Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="5" placeholder="Write a professional description about your store..." />
              <div className="field-helper">
                This description will appear on your public store page.
              </div>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <div className="section-number">02</div>
            <div className="section-heading-text">
              <span>STORE LOCATION</span>
              <h2>Address &amp; Location</h2>
              <p>Manage your store address and Google Maps coordinates.</p>
            </div>
          </div>

          <div className="location-admin-card">
            <div className="location-preview-icon">📍</div>
            <div>
              <strong>Store Location</strong>
              <p>Your coordinates are used to display the Google Maps location.</p>
            </div>
          </div>

          <div className="admin-grid">
            <div className="admin-field admin-field-full">
              <label>Complete Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows="3" placeholder="Gali No 19, Rajapuri, Uttam Nagar, Delhi" />
            </div>

            <div className="admin-field">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} />
            </div>

            <div className="admin-field">
              <label>Latitude</label>
              <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} placeholder="28.6063112" />
            </div>

            <div className="admin-field">
              <label>Longitude</label>
              <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} placeholder="77.0589786" />
            </div>

            <div className="admin-field admin-field-full">
              <label>Services</label>
              <input name="services" value={form.services} onChange={handleChange} placeholder="Dry Cleaning, Charak, Steam Press, Rafu" />

              <div className="service-preview">
                {form.services.split(",").map((item) => item.trim()).filter(Boolean).map((service, index) => (
                  <span key={`${service}-${index}`}>{service}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <div className="section-number">03</div>
            <div className="section-heading-text">
              <span>BRAND PROMOTION</span>
              <h2>Promotional Video</h2>
              <p>Upload your shop advertisement for the public hero section.</p>
            </div>
          </div>

          {shop?.video ? (
            <div className="current-video-card">
              <div className="video-preview">
                <video src={getMediaUrl(shop.video)} controls playsInline />
                <div className="video-live-badge">CURRENT VIDEO</div>
              </div>

              <div className="video-card-footer">
                <div>
                  <strong>Promotional advertisement</strong>
                  <span>Currently published on your store page</span>
                </div>

                <button type="button" onClick={deleteVideo} disabled={deletingVideo} className="danger-button">
                  {deletingVideo ? "Deleting..." : "Delete Video"}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-media">
              <div className="empty-media-icon">▶</div>
              <div>
                <strong>No promotional video uploaded</strong>
                <span>Add your shop advertisement below.</span>
              </div>
            </div>
          )}

          <div className="upload-dropzone video-dropzone" onClick={() => videoInputRef.current?.click()}>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={handleVideoChange}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="upload-icon">↑</div>
            <div className="upload-content">
              <strong>{video ? video.name : "Upload Advertisement Video"}</strong>
              <span>Click to choose your video</span>
              <small>MP4, WEBM, MOV or AVI · Maximum 100MB</small>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-header gallery-header">
            <div className="section-number">04</div>
            <div className="section-heading-text">
              <span>STORE GALLERY</span>
              <h2>Shop Photos</h2>
              <p>Upload real photographs of your Krishna Dry Cleaning store.</p>
            </div>

            <div className="image-counter">
              <strong>{imageCount}</strong>
              <span>/ {MAX_IMAGES}</span>
              <small>photos</small>
            </div>
          </div>

          {shop?.images?.length > 0 ? (
            <div className="admin-image-grid">
              {shop.images.map((image, index) => (
                <div className="admin-image-card" key={image}>
                  <img src={getMediaUrl(image)} alt={`Shop ${index + 1}`} loading="lazy" />

                  <div className="image-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <button
                    type="button"
                    className="image-delete"
                    disabled={Boolean(deletingImage)}
                    onClick={() => deleteImage(image)}
                    aria-label="Delete image"
                  >
                    {deletingImage === image ? "…" : "×"}
                  </button>

                  <div className="image-overlay">
                    <span>Krishna Dry Cleaning</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-gallery">
              <div>◎</div>
              <strong>No shop photos yet</strong>
              <span>Add real store photographs to make your public page look professional.</span>
            </div>
          )}

          {remainingImages > 0 ? (
            <div className="upload-dropzone image-dropzone" onClick={() => imageInputRef.current?.click()}>
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImagesChange}
                onClick={(e) => e.stopPropagation()}
              />

              <div className="upload-icon">+</div>
              <div className="upload-content">
                <strong>{images.length > 0 ? `${images.length} new image(s) selected` : "Add Shop Photos"}</strong>
                <span>Click here to choose photographs</span>
                <small>JPG, PNG or WEBP · {remainingImages} slot(s) remaining</small>
              </div>
            </div>
          ) : (
            <div className="gallery-limit">
              <div>✓</div>
              <span>You have reached the maximum of <strong>{MAX_IMAGES} photos</strong>.</span>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <div className="section-number">05</div>
            <div className="section-heading-text">
              <span>STORE TIMINGS</span>
              <h2>Opening Hours</h2>
              <p>Let customers know when your store is available.</p>
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
            ].map(([key, label, short]) => (
              <div className="hours-card" key={key}>
                <div className="day-badge">{short}</div>
                <div className="hours-input">
                  <label>{label}</label>
                  <input name={key} value={form[key]} onChange={handleChange} placeholder={DEFAULT_HOURS} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="admin-save-bar">
          <div className="save-info">
            <div className="save-check">✓</div>
            <div>
              <strong>Ready to publish?</strong>
              <span>Your changes will appear on the public store page.</span>
            </div>
          </div>

          <button type="submit" disabled={saving} className="save-shop-button">
            {saving ? (
              <>
                <span className="button-spinner"></span>
                Saving Changes...
              </>
            ) : (
              <>
                Save Shop Changes <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopManagement;
