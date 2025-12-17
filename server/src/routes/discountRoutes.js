const express = require('express');
const router = express.Router();
const {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus,
  requestDiscount,
  approveDiscountRequest,
  rejectDiscountRequest,
  validateDiscount,
  getOwnerRequests,
  getActiveDiscounts
} = require('../controllers/discountController');
const { protect, admin, checkRole } = require("../middlewares/authMiddleWare");

// Admin routes
router.post("/", protect, admin, createDiscount);
router.get("/", getAllDiscounts);
router.get("/active", getActiveDiscounts);
router.get("/:id", getDiscountById);
router.put("/:id", protect, admin, updateDiscount);
router.delete("/:id", protect, admin, deleteDiscount);
router.put("/:id/toggle", protect, admin, toggleDiscountStatus);
router.put("/:id/approve", protect, admin, approveDiscountRequest);
router.put("/:id/reject", protect, admin, rejectDiscountRequest);

// Owner routes
router.post("/request", protect, checkRole("owner"), requestDiscount);
router.get("/owner/requests", protect, checkRole("owner"), getOwnerRequests);

// User routes
router.post("/validate", protect, validateDiscount);

module.exports = router;

