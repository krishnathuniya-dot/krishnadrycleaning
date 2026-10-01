import { useEffect, useMemo, useState } from "react";
import "../css/AdminRateList.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

const SERVICES = [
  "Dry Cleaning",
  "Charak",
  "Steam Press",
  "Rafu",
];

const DEFAULT_CATEGORY_FORM = {
  name: "",
  sortOrder: 0,
  isActive: true,
};

const DEFAULT_RATE_FORM = {
  categoryId: "",
  garment: "",
  service: "Dry Cleaning",
  price: "",
  unit: "Per Piece",
  sortOrder: 0,
  isActive: true,
};

function AdminRateList() {
  // =========================================================
  // STATES
  // =========================================================

  const [categories, setCategories] = useState([]);
  const [rates, setRates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // =========================================================
  // VIEW
  // =========================================================

  const [activeView, setActiveView] = useState("rates");

  // =========================================================
  // CATEGORY FORM
  // =========================================================

  const [categoryForm, setCategoryForm] = useState(
    DEFAULT_CATEGORY_FORM
  );

  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // =========================================================
  // RATE FORM
  // =========================================================

  const [rateForm, setRateForm] = useState(DEFAULT_RATE_FORM);

  const [editingRate, setEditingRate] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterGarment, setFilterGarment] = useState("");
  const [filterService, setFilterService] = useState("");

  // =========================================================
  // MESSAGE
  // =========================================================

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 3500);
  };

  // =========================================================
  // API HELPER
  // =========================================================

  const parseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();

    return {
      success: response.ok,
      message: text || "Something went wrong",
    };
  };

  // =========================================================
  // LOAD ALL DATA
  // =========================================================

  const loadData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [categoryResponse, rateResponse] = await Promise.all([
        fetch(`${API_URL}/api/rate-categories`),
        fetch(`${API_URL}/api/rates`),
      ]);

      const categoryData = await parseResponse(categoryResponse);
      const rateData = await parseResponse(rateResponse);

      if (!categoryResponse.ok || !categoryData.success) {
        throw new Error(
          categoryData.message || "Failed to load categories"
        );
      }

      if (!rateResponse.ok || !rateData.success) {
        throw new Error(
          rateData.message || "Failed to load rates"
        );
      }

      setCategories(categoryData.data || []);
      setRates(rateData.data || []);
    } catch (error) {
      console.error("LOAD DATA ERROR:", error);

      showMessage(
        "error",
        error.message || "Unable to load rate list"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // CATEGORY NAME
  // =========================================================

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => String(item._id) === String(categoryId)
    );

    return category?.name || "Unknown Category";
  };

  // =========================================================
  // FILTERED RATES
  // =========================================================

  const filteredRates = useMemo(() => {
    return rates.filter((rate) => {
      const categoryId =
        rate.categoryId?._id ||
        rate.categoryId ||
        "";

      const categoryName =
        rate.categoryId?.name ||
        getCategoryName(categoryId);

      const garmentName = rate.garment || "";
      const serviceName = rate.service || "";

      const searchText = `
        ${categoryName}
        ${garmentName}
        ${serviceName}
      `.toLowerCase();

      const searchMatch =
        !search ||
        searchText.includes(search.toLowerCase());

      const categoryMatch =
        !filterCategory ||
        String(categoryId) === String(filterCategory);

      const garmentMatch =
        !filterGarment ||
        garmentName.toLowerCase() ===
          filterGarment.toLowerCase();

      const serviceMatch =
        !filterService ||
        serviceName === filterService;

      return (
        searchMatch &&
        categoryMatch &&
        garmentMatch &&
        serviceMatch
      );
    });
  }, [
    rates,
    categories,
    search,
    filterCategory,
    filterGarment,
    filterService,
  ]);

  // =========================================================
  // UNIQUE GARMENTS
  // =========================================================

  const garmentOptions = useMemo(() => {
    const garments = rates
      .map((rate) => rate.garment)
      .filter(Boolean)
      .map((garment) => garment.trim());

    return [...new Set(garments)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [rates]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const activeCategories = categories.filter(
    (category) => category.isActive !== false
  ).length;

  const inactiveCategories =
    categories.length - activeCategories;

  const activeRates = rates.filter(
    (rate) => rate.isActive !== false
  ).length;

  const inactiveRates = rates.length - activeRates;

  // =========================================================
  // CATEGORY MODAL
  // =========================================================

  const openCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      ...DEFAULT_CATEGORY_FORM,
    });
    setShowCategoryModal(true);
  };

  const editCategory = (category) => {
    setEditingCategory(category);

    setCategoryForm({
      name: category.name || "",
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive !== false,
    });

    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    if (saving) return;

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      ...DEFAULT_CATEGORY_FORM,
    });
  };

  // =========================================================
  // SAVE CATEGORY
  // =========================================================

  const saveCategory = async (e) => {
    e.preventDefault();

    const name = categoryForm.name.trim();

    if (!name) {
      showMessage("error", "Category name is required");
      return;
    }

    setSaving(true);

    try {
      const url = editingCategory
        ? `${API_URL}/api/rate-categories/${editingCategory._id}`
        : `${API_URL}/api/rate-categories`;

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          sortOrder: Number(categoryForm.sortOrder) || 0,
          isActive: Boolean(categoryForm.isActive),
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save category"
        );
      }

      showMessage(
        "success",
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );

      closeCategoryModal();

      await loadData(false);
    } catch (error) {
      console.error("SAVE CATEGORY ERROR:", error);

      showMessage(
        "error",
        error.message || "Unable to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  const deleteCategory = async (id) => {
    const category = categories.find(
      (item) => String(item._id) === String(id)
    );

    const confirmed = window.confirm(
      `Delete "${category?.name || "this category"}"?\n\n` +
        "If this category is being used by rates, deletion may fail."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/rate-categories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete category"
        );
      }

      showMessage(
        "success",
        "Category deleted successfully"
      );

      await loadData(false);
    } catch (error) {
      console.error("DELETE CATEGORY ERROR:", error);

      showMessage(
        "error",
        error.message || "Unable to delete category"
      );
    }
  };

  // =========================================================
  // RATE MODAL
  // =========================================================

  const openRateModal = () => {
    if (categories.length === 0) {
      showMessage(
        "error",
        "Please create a category before adding a rate"
      );
      return;
    }

    setEditingRate(null);

    setRateForm({
      ...DEFAULT_RATE_FORM,
      categoryId: categories[0]?._id || "",
    });

    setShowRateModal(true);
  };

  const editRate = (rate) => {
    const categoryId =
      rate.categoryId?._id ||
      rate.categoryId ||
      "";

    const service = SERVICES.includes(rate.service)
      ? rate.service
      : "Dry Cleaning";

    setEditingRate(rate);

    setRateForm({
      categoryId,
      garment: rate.garment || "",
      service,
      price: rate.price ?? "",
      unit: rate.unit || "Per Piece",
      sortOrder: rate.sortOrder ?? 0,
      isActive: rate.isActive !== false,
    });

    setShowRateModal(true);
  };

  const closeRateModal = () => {
    if (saving) return;

    setShowRateModal(false);
    setEditingRate(null);

    setRateForm({
      ...DEFAULT_RATE_FORM,
      categoryId: categories[0]?._id || "",
    });
  };

  // =========================================================
  // SAVE RATE
  // =========================================================

  const saveRate = async (e) => {
    e.preventDefault();

    if (!rateForm.categoryId) {
      showMessage("error", "Please select a category");
      return;
    }

    if (!rateForm.garment.trim()) {
      showMessage("error", "Garment name is required");
      return;
    }

    if (!SERVICES.includes(rateForm.service)) {
      showMessage("error", "Please select a valid service");
      return;
    }

    if (
      rateForm.price === "" ||
      rateForm.price === null ||
      Number.isNaN(Number(rateForm.price)) ||
      Number(rateForm.price) < 0
    ) {
      showMessage("error", "Please enter a valid price");
      return;
    }

    setSaving(true);

    try {
      const url = editingRate
        ? `${API_URL}/api/rates/${editingRate._id}`
        : `${API_URL}/api/rates`;

      const method = editingRate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: rateForm.categoryId,
          garment: rateForm.garment.trim(),
          service: rateForm.service,
          price: Number(rateForm.price),
          unit:
            rateForm.unit?.trim() || "Per Piece",
          sortOrder:
            Number(rateForm.sortOrder) || 0,
          isActive: Boolean(rateForm.isActive),
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save rate"
        );
      }

      showMessage(
        "success",
        editingRate
          ? "Rate updated successfully"
          : "Rate created successfully"
      );

      closeRateModal();

      await loadData(false);
    } catch (error) {
      console.error("SAVE RATE ERROR:", error);

      showMessage(
        "error",
        error.message || "Unable to save rate"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE RATE
  // =========================================================

  const deleteRate = async (id) => {
    const rate = rates.find(
      (item) => String(item._id) === String(id)
    );

    const confirmed = window.confirm(
      `Delete rate for "${rate?.garment || "this item"}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/rates/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete rate"
        );
      }

      showMessage(
        "success",
        "Rate deleted successfully"
      );

      await loadData(false);
    } catch (error) {
      console.error("DELETE RATE ERROR:", error);

      showMessage(
        "error",
        error.message || "Unable to delete rate"
      );
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    loadData(false);
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setFilterCategory("");
    setFilterGarment("");
    setFilterService("");
  };

  const hasFilters =
    search ||
    filterCategory ||
    filterGarment ||
    filterService;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="rate-admin-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="rate-page-header">
        <div className="rate-header-content">
          <span className="rate-page-kicker">
            ADMIN PANEL
          </span>

          <h1>Rate List Management</h1>

          <p>
            Manage categories, garments, services and
            pricing from one place.
          </p>
        </div>

        <div className="rate-header-actions">
          <button
            type="button"
            className="secondary-rate-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <span className={refreshing ? "spin" : ""}>
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="secondary-rate-btn"
            onClick={openCategoryModal}
          >
            <span>＋</span>
            Add Category
          </button>

          <button
            type="button"
            className="primary-rate-btn"
            onClick={openRateModal}
            disabled={categories.length === 0}
          >
            <span>＋</span>
            Add Rate
          </button>
        </div>
      </header>

      {/* =====================================================
          ALERT
      ===================================================== */}

      {message.text && (
        <div
          className={`rate-alert ${
            message.type === "success"
              ? "rate-alert-success"
              : "rate-alert-error"
          }`}
        >
          <span className="alert-icon">
            {message.type === "success" ? "✓" : "!"}
          </span>

          <span>{message.text}</span>

          <button
            type="button"
            onClick={() =>
              setMessage({
                type: "",
                text: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="rate-stat-grid">
        <div className="rate-stat-card">
          <div className="rate-stat-icon purple">
            C
          </div>

          <div className="rate-stat-info">
            <span>Total Categories</span>
            <strong>{categories.length}</strong>
            <small>
              {activeCategories} active
            </small>
          </div>
        </div>

        <div className="rate-stat-card">
          <div className="rate-stat-icon green">
            ₹
          </div>

          <div className="rate-stat-info">
            <span>Total Rates</span>
            <strong>{rates.length}</strong>
            <small>
              {activeRates} active
            </small>
          </div>
        </div>

        <div className="rate-stat-card">
          <div className="rate-stat-icon blue">
            ✓
          </div>

          <div className="rate-stat-info">
            <span>Active Rates</span>
            <strong>{activeRates}</strong>
            <small>
              {inactiveRates} inactive
            </small>
          </div>
        </div>

        <div className="rate-stat-card">
          <div className="rate-stat-icon orange">
            ◉
          </div>

          <div className="rate-stat-info">
            <span>Active Categories</span>
            <strong>{activeCategories}</strong>
            <small>
              {inactiveCategories} inactive
            </small>
          </div>
        </div>
      </section>

      {/* =====================================================
          VIEW TABS
      ===================================================== */}

      <div className="rate-tabs">
        <button
          type="button"
          className={`rate-tab ${
            activeView === "rates" ? "active" : ""
          }`}
          onClick={() => setActiveView("rates")}
        >
          <span>₹</span>
          Rate List
          <b>{rates.length}</b>
        </button>

        <button
          type="button"
          className={`rate-tab ${
            activeView === "categories" ? "active" : ""
          }`}
          onClick={() => setActiveView("categories")}
        >
          <span>▦</span>
          Categories
          <b>{categories.length}</b>
        </button>
      </div>

      {/* =====================================================
          RATE LIST VIEW
      ===================================================== */}

      {activeView === "rates" && (
        <section className="rate-content-card">
          {/* TOOLBAR */}

          <div className="rate-toolbar">
            <div className="rate-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search garment, category or service..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value)
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filterGarment}
              onChange={(e) =>
                setFilterGarment(e.target.value)
              }
            >
              <option value="">
                All Garments
              </option>

              {garmentOptions.map((garment) => (
                <option
                  key={garment}
                  value={garment}
                >
                  {garment}
                </option>
              ))}
            </select>

            <select
              value={filterService}
              onChange={(e) =>
                setFilterService(e.target.value)
              }
            >
              <option value="">
                All Services
              </option>

              {SERVICES.map((service) => (
                <option
                  key={service}
                  value={service}
                >
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE HEADER */}

          <div className="table-heading">
            <div>
              <h2>Service Rates</h2>

              <p>
                Showing{" "}
                <strong>
                  {filteredRates.length}
                </strong>{" "}
                of {rates.length} rates
              </p>
            </div>

            <div className="table-heading-actions">
              {hasFilters && (
                <button
                  type="button"
                  className="clear-filter-btn"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}

              <button
                type="button"
                className="small-add-btn"
                onClick={openRateModal}
                disabled={categories.length === 0}
              >
                + Add Rate
              </button>
            </div>
          </div>

          {/* TABLE */}

          <div className="rate-table-wrapper">
            {loading ? (
              <div className="rate-loading">
                <div className="spinner"></div>
                <span>Loading rate list...</span>
              </div>
            ) : filteredRates.length === 0 ? (
              <div className="rate-empty">
                <div className="empty-icon">₹</div>

                <h3>
                  {hasFilters
                    ? "No matching rates"
                    : "No rates added yet"}
                </h3>

                <p>
                  {hasFilters
                    ? "Try changing your filters or search keyword."
                    : categories.length === 0
                    ? "Create a category first, then add your service rates."
                    : "Start by adding your first service rate."}
                </p>

                <div className="empty-actions">
                  {hasFilters && (
                    <button
                      type="button"
                      className="secondary-rate-btn"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  )}

                  {categories.length === 0 ? (
                    <button
                      type="button"
                      className="primary-rate-btn"
                      onClick={openCategoryModal}
                    >
                      + Create Category
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="primary-rate-btn"
                      onClick={openRateModal}
                    >
                      + Add Rate
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Garment</th>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRates.map((rate, index) => {
                    const categoryId =
                      rate.categoryId?._id ||
                      rate.categoryId;

                    const categoryName =
                      rate.categoryId?.name ||
                      getCategoryName(categoryId);

                    return (
                      <tr key={rate._id}>
                        <td>
                          <span className="row-number">
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="category-pill">
                            {categoryName}
                          </span>
                        </td>

                        <td>
                          <strong className="garment-name">
                            {rate.garment}
                          </strong>
                        </td>

                        <td>
                          <span className="service-name">
                            {rate.service}
                          </span>
                        </td>

                        <td>
                          <strong className="price">
                            ₹
                            {Number(
                              rate.price || 0
                            ).toLocaleString("en-IN")}
                          </strong>
                        </td>

                        <td>
                          <span className="unit-text">
                            {rate.unit || "Per Piece"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status ${
                              rate.isActive !== false
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            <i></i>

                            {rate.isActive !== false
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="edit-btn"
                              title="Edit rate"
                              onClick={() =>
                                editRate(rate)
                              }
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              className="delete-btn"
                              title="Delete rate"
                              onClick={() =>
                                deleteRate(rate._id)
                              }
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          CATEGORY VIEW
      ===================================================== */}

      {activeView === "categories" && (
        <section className="rate-content-card">
          <div className="table-heading">
            <div>
              <h2>Category Management</h2>

              <p>
                Create and manage rate-list categories.
              </p>
            </div>

            <button
              type="button"
              className="small-add-btn"
              onClick={openCategoryModal}
            >
              + Add Category
            </button>
          </div>

          <div className="category-grid">
            {loading ? (
              <div className="rate-loading">
                <div className="spinner"></div>
                <span>Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="rate-empty category-empty">
                <div className="empty-icon">C</div>

                <h3>No categories yet</h3>

                <p>
                  Create your first category to start
                  managing rates.
                </p>

                <button
                  type="button"
                  className="primary-rate-btn"
                  onClick={openCategoryModal}
                >
                  + Add Category
                </button>
              </div>
            ) : (
              categories
                .slice()
                .sort(
                  (a, b) =>
                    Number(a.sortOrder || 0) -
                    Number(b.sortOrder || 0)
                )
                .map((category, index) => {
                  const categoryRates =
                    rates.filter((rate) => {
                      const id =
                        rate.categoryId?._id ||
                        rate.categoryId;

                      return (
                        String(id) ===
                        String(category._id)
                      );
                    });

                  return (
                    <div
                      className="category-card"
                      key={category._id}
                    >
                      <div className="category-card-top">
                        <div className="category-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <span
                          className={`status ${
                            category.isActive !== false
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          <i></i>

                          {category.isActive !== false
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <h3>{category.name}</h3>

                      <div className="category-meta">
                        <span>
                          <strong>
                            {categoryRates.length}
                          </strong>{" "}
                          rates
                        </span>

                        <span>
                          Sort:{" "}
                          <strong>
                            {category.sortOrder || 0}
                          </strong>
                        </span>
                      </div>

                      <div className="category-actions">
                        <button
                          type="button"
                          className="category-edit-btn"
                          onClick={() =>
                            editCategory(category)
                          }
                        >
                          ✎ Edit
                        </button>

                        <button
                          type="button"
                          className="category-delete-btn"
                          onClick={() =>
                            deleteCategory(
                              category._id
                            )
                          }
                        >
                          × Delete
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          CATEGORY MODAL
      ===================================================== */}

      {showCategoryModal && (
        <div
          className="rate-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeCategoryModal();
            }
          }}
        >
          <div className="rate-modal">
            <div className="modal-header">
              <div>
                <span>RATE MANAGEMENT</span>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeCategoryModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveCategory}
              className="modal-form"
            >
              <label>
                <span>
                  Category Name
                  <em>*</em>
                </span>

                <input
                  type="text"
                  placeholder="e.g. Men's Wear"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  autoFocus
                  required
                />
              </label>

              <div className="form-two">
                <label>
                  <span>Sort Order</span>

                  <input
                    type="number"
                    min="0"
                    value={categoryForm.sortOrder}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        sortOrder:
                          e.target.value,
                      }))
                    }
                  />

                  <small>
                    Lower number appears first.
                  </small>
                </label>

                <label>
                  <span>Status</span>

                  <select
                    value={
                      categoryForm.isActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        isActive:
                          e.target.value ===
                          "active",
                      }))
                    }
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeCategoryModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          RATE MODAL
      ===================================================== */}

      {showRateModal && (
        <div
          className="rate-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeRateModal();
            }
          }}
        >
          <div className="rate-modal rate-modal-large">
            <div className="modal-header">
              <div>
                <span>RATE MANAGEMENT</span>

                <h2>
                  {editingRate
                    ? "Edit Service Rate"
                    : "Add Service Rate"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeRateModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveRate}
              className="modal-form"
            >
              <div className="form-two">
                <label>
                  <span>
                    Category
                    <em>*</em>
                  </span>

                  <select
                    value={rateForm.categoryId}
                    onChange={(e) =>
                      setRateForm((prev) => ({
                        ...prev,
                        categoryId:
                          e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category._id}
                        value={category._id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>
                    Garment Name
                    <em>*</em>
                  </span>

                  <input
                    type="text"
                    placeholder="e.g. Shirt, Pant, Saree"
                    value={rateForm.garment}
                    onChange={(e) =>
                      setRateForm((prev) => ({
                        ...prev,
                        garment:
                          e.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              <label>
                <span>
                  Service
                  <em>*</em>
                </span>

                <select
                  value={rateForm.service}
                  onChange={(e) =>
                    setRateForm((prev) => ({
                      ...prev,
                      service: e.target.value,
                    }))
                  }
                  required
                >
                  {SERVICES.map((service) => (
                    <option
                      key={service}
                      value={service}
                    >
                      {service}
                    </option>
                  ))}
                </select>

                <small>
                  Available: Dry Cleaning, Charak,
                  Steam Press and Rafu.
                </small>
              </label>

              <div className="form-three">
                <label>
                  <span>
                    Price
                    <em>*</em>
                  </span>

                  <div className="price-input">
                    <span>₹</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="80"
                      value={rateForm.price}
                      onChange={(e) =>
                        setRateForm((prev) => ({
                          ...prev,
                          price:
                            e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Unit</span>

                  <select
                    value={rateForm.unit}
                    onChange={(e) =>
                      setRateForm((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                  >
                    <option>Per Piece</option>
                    <option>Per Kg</option>
                    <option>Per Pair</option>
                    <option>Per Set</option>
                    <option>Per Item</option>
                  </select>
                </label>

                <label>
                  <span>Status</span>

                  <select
                    value={
                      rateForm.isActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) =>
                      setRateForm((prev) => ({
                        ...prev,
                        isActive:
                          e.target.value ===
                          "active",
                      }))
                    }
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </label>
              </div>

              <label>
                <span>Sort Order</span>

                <input
                  type="number"
                  min="0"
                  value={rateForm.sortOrder}
                  onChange={(e) =>
                    setRateForm((prev) => ({
                      ...prev,
                      sortOrder:
                        e.target.value,
                    }))
                  }
                />

                <small>
                  Lower number will appear first.
                </small>
              </label>

              {/* PREVIEW */}

              <div className="rate-preview">
                <span className="preview-label">
                  LIVE PREVIEW
                </span>

                <div className="preview-row">
                  <div className="preview-main">
                    <small>
                      {rateForm.categoryId
                        ? getCategoryName(
                            rateForm.categoryId
                          )
                        : "Category"}
                    </small>

                    <strong>
                      {rateForm.garment ||
                        "Garment Name"}
                    </strong>
                  </div>

                  <div className="preview-service">
                    {rateForm.service ||
                      "Service"}
                  </div>

                  <div className="preview-price">
                    ₹
                    {rateForm.price
                      ? Number(
                          rateForm.price
                        ).toLocaleString("en-IN")
                      : "0"}

                    <small>
                      /{" "}
                      {rateForm.unit ||
                        "Per Piece"}
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeRateModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    saving ||
                    categories.length === 0
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingRate
                    ? "Update Rate"
                    : "Create Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRateList;