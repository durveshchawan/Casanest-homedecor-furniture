const jwt = require("jsonwebtoken");

// Creates a signed token that encodes the user's id. Expires in 30 days.
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

module.exports = generateToken;
