const express = require("express");

const router = express.Router();

const {
  createRate,
  getRates,
  getRateById,
  updateRate,
  deleteRate,
} = require("../controller/rateListController");

// CREATE
router.post("/rates", createRate);

// GET ALL
router.get("/rates", getRates);

// GET SINGLE
router.get("/rates/:id", getRateById);

// UPDATE
router.put("/rates/:id", updateRate);

// DELETE
router.delete("/rates/:id", deleteRate);

module.exports = router;