const mongoose = require("mongoose");

const RateList = require("../model/RateList");
const RateCategory = require("../model/RateCategory");

// =====================================================
// ALLOWED SERVICES
// =====================================================

const ALLOWED_SERVICES = [
  "Dry Cleaning",
  "Charak",
  "Steam Press",
  "Rafu",
];

// =====================================================
// ESCAPE REGEX
// =====================================================

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// =====================================================
// CREATE RATE
// =====================================================

const createRate = async (req, res) => {
  try {
    const {
      categoryId,
      garment,
      service,
      price,
      unit,
      sortOrder,
      isActive,
    } = req.body;

    // -------------------------
    // CATEGORY
    // -------------------------

    if (
      !categoryId ||
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    // -------------------------
    // GARMENT
    // -------------------------

    if (
      typeof garment !== "string" ||
      !garment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Garment is required",
      });
    }

    // -------------------------
    // SERVICE
    // -------------------------

    if (
      typeof service !== "string" ||
      !service.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Service is required",
      });
    }

    const serviceName = service.trim();

    if (!ALLOWED_SERVICES.includes(serviceName)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid service. Allowed services are: Dry Cleaning, Charak, Steam Press, Rafu",
      });
    }

    // -------------------------
    // PRICE
    // -------------------------

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
      });
    }

    // -------------------------
    // CHECK CATEGORY
    // -------------------------

    const category = await RateCategory.findById(
      categoryId
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // -------------------------
    // CLEAN DATA
    // -------------------------

    const garmentName = garment.trim();

    // -------------------------
    // DUPLICATE RATE
    // -------------------------

    const existingRate = await RateList.findOne({
      categoryId,

      garment: {
        $regex: `^${escapeRegex(garmentName)}$`,
        $options: "i",
      },

      service: serviceName,
    });

    if (existingRate) {
      return res.status(409).json({
        success: false,
        message:
          "This service already exists for this garment",
      });
    }

    // -------------------------
    // CREATE
    // -------------------------

    const rate = await RateList.create({
      categoryId,
      garment: garmentName,
      service: serviceName,
      price: Number(price),
      unit: unit?.trim() || "Per Piece",
      sortOrder: Number(sortOrder) || 0,
      isActive:
        isActive === undefined
          ? true
          : isActive === true ||
            isActive === "true",
    });

    // -------------------------
    // POPULATE CATEGORY
    // -------------------------

    const result = await RateList.findById(rate._id)
      .populate("categoryId", "name");

    return res.status(201).json({
      success: true,
      message: "Rate added successfully",
      data: result,
    });
  } catch (error) {
    console.error("CREATE RATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create rate",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL RATES
// =====================================================

const getRates = async (req, res) => {
  try {
    const {
      categoryId,
      garment,
      service,
      active,
    } = req.query;

    const filter = {};

    // -------------------------
    // CATEGORY FILTER
    // -------------------------

    if (categoryId) {
      if (
        !mongoose.Types.ObjectId.isValid(categoryId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.categoryId = categoryId;
    }

    // -------------------------
    // GARMENT FILTER
    // -------------------------

    if (garment) {
      filter.garment = {
        $regex: escapeRegex(garment.trim()),
        $options: "i",
      };
    }

    // -------------------------
    // SERVICE FILTER
    // -------------------------

    if (service) {
      const serviceName = service.trim();

      if (!ALLOWED_SERVICES.includes(serviceName)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service. Allowed services are: Dry Cleaning, Charak, Steam Press, Rafu",
        });
      }

      filter.service = serviceName;
    }

    // -------------------------
    // ACTIVE FILTER
    // -------------------------

    if (active === "true") {
      filter.isActive = true;
    }

    if (active === "false") {
      filter.isActive = false;
    }

    // -------------------------
    // GET RATES
    // -------------------------

    const rates = await RateList.find(filter)
      .populate("categoryId", "name")
      .sort({
        sortOrder: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      total: rates.length,
      data: rates,
    });
  } catch (error) {
    console.error("GET RATES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get rates",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE RATE
// =====================================================

const getRateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rate ID",
      });
    }

    const rate = await RateList.findById(id)
      .populate("categoryId", "name");

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rate,
    });
  } catch (error) {
    console.error("GET RATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get rate",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE RATE
// =====================================================

const updateRate = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      categoryId,
      garment,
      service,
      price,
      unit,
      sortOrder,
      isActive,
    } = req.body;

    // -------------------------
    // RATE ID
    // -------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rate ID",
      });
    }

    // -------------------------
    // FIND RATE
    // -------------------------

    const rate = await RateList.findById(id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }

    // -------------------------
    // CATEGORY
    // -------------------------

    if (categoryId !== undefined) {
      if (
        !mongoose.Types.ObjectId.isValid(categoryId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const category = await RateCategory.findById(
        categoryId
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      rate.categoryId = categoryId;
    }

    // -------------------------
    // GARMENT
    // -------------------------

    if (garment !== undefined) {
      if (
        typeof garment !== "string" ||
        !garment.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Garment cannot be empty",
        });
      }

      rate.garment = garment.trim();
    }

    // -------------------------
    // SERVICE
    // -------------------------

    if (service !== undefined) {
      if (
        typeof service !== "string" ||
        !service.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Service cannot be empty",
        });
      }

      const serviceName = service.trim();

      if (!ALLOWED_SERVICES.includes(serviceName)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service. Allowed services are: Dry Cleaning, Charak, Steam Press, Rafu",
        });
      }

      rate.service = serviceName;
    }

    // -------------------------
    // PRICE
    // -------------------------

    if (price !== undefined) {
      if (
        price === "" ||
        Number.isNaN(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid price is required",
        });
      }

      rate.price = Number(price);
    }

    // -------------------------
    // UNIT
    // -------------------------

    if (unit !== undefined) {
      rate.unit =
        typeof unit === "string" && unit.trim()
          ? unit.trim()
          : "Per Piece";
    }

    // -------------------------
    // SORT ORDER
    // -------------------------

    if (sortOrder !== undefined) {
      rate.sortOrder = Number(sortOrder) || 0;
    }

    // -------------------------
    // ACTIVE
    // -------------------------

    if (isActive !== undefined) {
      rate.isActive =
        isActive === true ||
        isActive === "true";
    }

    // -------------------------
    // DUPLICATE CHECK
    // -------------------------

    const duplicate = await RateList.findOne({
      categoryId: rate.categoryId,

      garment: {
        $regex: `^${escapeRegex(rate.garment)}$`,
        $options: "i",
      },

      service: rate.service,

      _id: {
        $ne: id,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "This service already exists for this garment",
      });
    }

    // -------------------------
    // SAVE
    // -------------------------

    await rate.save();

    // -------------------------
    // GET UPDATED RATE
    // -------------------------

    const updatedRate = await RateList.findById(
      rate._id
    ).populate("categoryId", "name");

    return res.status(200).json({
      success: true,
      message: "Rate updated successfully",
      data: updatedRate,
    });
  } catch (error) {
    console.error("UPDATE RATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update rate",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE RATE
// =====================================================

const deleteRate = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------
    // VALIDATE ID
    // -------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rate ID",
      });
    }

    // -------------------------
    // FIND RATE
    // -------------------------

    const rate = await RateList.findById(id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }

    // -------------------------
    // DELETE
    // -------------------------

    await RateList.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Rate deleted successfully",
    });
  } catch (error) {
    console.error("DELETE RATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete rate",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createRate,
  getRates,
  getRateById,
  updateRate,
  deleteRate,
};