const express = require("express");
const router = express.Router();
const { getCart, saveCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getCart);
router.put("/", protect, saveCart);

module.exports = router;
