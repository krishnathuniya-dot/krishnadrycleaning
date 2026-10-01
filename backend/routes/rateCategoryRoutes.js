const express = require("express");

const router = express.Router();

const {
  createCategory,
  getCategories,
  getActiveCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controller/rateCategoryController");

// CREATE
router.post("/rate-categories", createCategory);

// GET ALL
router.get("/rate-categories", getCategories);

// GET ACTIVE
// IMPORTANT: :id se pehle hona chahiye
router.get("/rate-categories/active/list", getActiveCategories);

// GET SINGLE
router.get("/rate-categories/:id", getCategoryById);

// UPDATE
router.put("/rate-categories/:id", updateCategory);

// DELETE
router.delete("/rate-categories/:id", deleteCategory);

module.exports = router;