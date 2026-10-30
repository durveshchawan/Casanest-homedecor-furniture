const User = require("../models/User");

// GET /api/users — every user, newest first (admin only)
async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password -cart").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
}

// PUT /api/users/:id/role — promote/demote a user (admin only)
async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be \"customer\" or \"admin\"" });
    }
    // Stops an admin from locking themselves out of the admin panel
    if (req.params.id === req.user._id.toString() && role !== "admin") {
      return res.status(400).json({ message: "You can't remove your own admin access" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true })
      .select("-password -cart");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Failed to update user", error: err.message });
  }
}

module.exports = { getUsers, updateUserRole };
