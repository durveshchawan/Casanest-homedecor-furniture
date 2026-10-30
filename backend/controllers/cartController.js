const User = require("../models/User");

// GET /api/cart — returns the logged-in user's saved cart + wishlist
async function getCart(req, res) {
  res.json({ cart: req.user.cart, wishlist: req.user.wishlist });
}

// PUT /api/cart — overwrites the saved cart + wishlist with what the client sends.
// The frontend calls this after every change, and on login (to merge local + server state).
async function saveCart(req, res) {
  try {
    const { cart, wishlist } = req.body;
    const user = await User.findById(req.user._id);

    if (Array.isArray(cart)) user.cart = cart;
    if (Array.isArray(wishlist)) user.wishlist = wishlist;

    await user.save();
    res.json({ cart: user.cart, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Failed to save cart", error: err.message });
  }
}

module.exports = { getCart, saveCart };
