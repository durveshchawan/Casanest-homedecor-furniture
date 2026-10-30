const express = require("express");
const router = express.Router();
const { getUsers, updateUserRole } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Admin-only management endpoints
router.get("/", protect, adminOnly, getUsers);
router.put("/:id/role", protect, adminOnly, updateUserRole);

module.exports = router;
