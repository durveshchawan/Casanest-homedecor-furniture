// Creates the default admin account (or promotes it if the email is already registered).
// Run with: npm run seed:admin
require("dotenv").config(); // only for MONGO_URI — the admin credentials below are hardcoded
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

// Default admin credentials — change the password before deploying anywhere public
const ADMIN = { name: "CasaNest Admin", email: "admin@casanest.com", password: "admin123" };

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    // Leave the existing password alone — only make sure the account is an admin
    existing.role = "admin";
    await existing.save();
    console.log(`${ADMIN.email} already exists — promoted to admin (password unchanged).`);
  } else {
    await User.create({ ...ADMIN, role: "admin" }); // hashed by the User model's pre-save hook
    console.log(`Created admin ${ADMIN.email} / ${ADMIN.password}`);
  }
  await mongoose.connection.close();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Seeding admin failed:", err.message);
  process.exit(1);
});
