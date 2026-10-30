const Order = require("../models/Order");
const Product = require("../models/Product");

const COUPONS = { CASA10: 10, WELCOME15: 15, NEST20: 20 };
const SHIPPING = 999; // flat ₹999
const TAX_RATE = 0.18; // 18% GST
const MAX_PER_PRODUCT = 10; // max units of one product per order
const ADDRESS_FIELDS = ["fullName", "line1", "city", "state", "postalCode", "phone"];

// GET /api/orders/pricing — the numbers the cart page shows, so its totals match what's charged
function getPricing(req, res) {
  res.json({ shipping: SHIPPING, taxRate: TAX_RATE, coupons: COUPONS, maxPerProduct: MAX_PER_PRODUCT });
}

// POST /api/orders  — creates an order from the current cart (server re-checks prices/stock)
async function createOrder(req, res) {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cannot place an order with an empty cart" });
    }
    const missing = ADDRESS_FIELDS.filter((f) => !String(shippingAddress?.[f] ?? "").trim());
    if (missing.length) {
      return res.status(400).json({ message: `Shipping address is incomplete (missing: ${missing.join(", ")})` });
    }

    // Re-price everything server-side so a tampered client can't set its own prices
    let subtotal = 0;
    const orderItems = [];
    for (const line of items) {
      const product = await Product.findOne({ id: line.productId });
      if (!product) return res.status(400).json({ message: `Product ${line.productId} no longer exists` });
      if (!product.stock) return res.status(400).json({ message: `${product.name} is out of stock` });

      const qty = Math.max(1, Number(line.qty) || 1);
      const already = orderItems.filter((o) => o.productId === product.id).reduce((n, o) => n + o.qty, 0);
      if (already + qty > MAX_PER_PRODUCT) {
        return res.status(400).json({ message: `Only ${MAX_PER_PRODUCT} units of ${product.name} can be ordered at a time` });
      }
      subtotal += product.price * qty;
      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        qty,
        color: line.color || null
      });
    }

    const code = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
    const pct = COUPONS[code] || 0;
    const discount = subtotal * (pct / 100);
    const taxed = subtotal - discount;
    const tax = taxed * TAX_RATE;
    const total = taxed + tax + SHIPPING;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        ...Object.fromEntries(ADDRESS_FIELDS.map((f) => [f, String(shippingAddress[f]).trim()])),
        country: String(shippingAddress.country || "India").trim()
      },
      couponCode: pct ? code : "",
      subtotal,
      discount,
      shipping: SHIPPING,
      tax,
      total
    });

    // Clear the user's saved cart now that it's been ordered
    req.user.cart = [];
    await req.user.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
}

// GET /api/orders/mine — order history for the logged-in user
async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
}

// GET /api/orders/:id — a single order (must belong to the requester, unless admin)
async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order", error: err.message });
  }
}

// GET /api/orders — every order, newest first (admin only)
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
}

// PUT /api/orders/:id/status — change an order's status (admin only)
async function updateOrderStatus(req, res) {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Failed to update order", error: err.message });
  }
}

module.exports = { getPricing, createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
