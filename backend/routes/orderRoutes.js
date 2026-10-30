const express = require("express");
const router = express.Router();
const {
  getPricing,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public — must stay above "/:id" so "pricing" isn't treated as an order id
router.get("/pricing", getPricing);

router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Admin-only management endpoints
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
