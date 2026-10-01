const mongoose = require("mongoose");

const RateCategory = require("../model/RateCategory");
const RateList = require("../model/RateList");

// =====================================================
// CREATE CATEGORY
// =====================================================

const createCategory = async (req, res) => {
  try {
    const { name, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const categoryName = name.trim();

    const existingCategory = await RateCategory.findOne({
      name: {
        $regex: `^${categoryName}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await RateCategory.create({
      name: categoryName,
      sortOrder: Number(sortOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL CATEGORIES
// =====================================================

const getCategories = async (req, res) => {
  try {
    const categories = await RateCategory.find().sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: error.message,
    });
  }
};

// =====================================================
// GET ACTIVE CATEGORIES
// =====================================================

const getActiveCategories = async (req, res) => {
  try {
    const categories = await RateCategory.find({
      isActive: true,
    }).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("GET ACTIVE CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get active categories",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE CATEGORY
// =====================================================

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await RateCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get category",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE CATEGORY
// =====================================================

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sortOrder, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await RateCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // -------------------------
    // NAME
    // -------------------------

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      const categoryName = name.trim();

      const duplicate = await RateCategory.findOne({
        name: {
          $regex: `^${categoryName}$`,
          $options: "i",
        },
        _id: {
          $ne: id,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }

      category.name = categoryName;
    }

    // -------------------------
    // SORT ORDER
    // -------------------------

    if (sortOrder !== undefined) {
      category.sortOrder = Number(sortOrder) || 0;
    }

    // -------------------------
    // ACTIVE STATUS
    // -------------------------

    if (isActive !== undefined) {
      category.isActive =
        isActive === true ||
        isActive === "true";
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE CATEGORY
// =====================================================

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await RateCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // =================================================
    // CHECK CONNECTED RATES
    // =================================================

    const rateCount = await RateList.countDocuments({
      categoryId: id,
    });

    if (rateCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this category because rates are connected to it",
      });
    }

    await RateCategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createCategory,
  getCategories,
  getActiveCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};