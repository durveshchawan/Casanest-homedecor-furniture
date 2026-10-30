const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (![name, email, password].every((v) => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Name, email and password are all required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// GET /api/auth/me  (requires auth)
async function getProfile(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getProfile };
