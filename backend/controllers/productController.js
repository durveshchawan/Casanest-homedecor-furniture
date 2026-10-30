const Product = require("../models/Product");

// GET /api/products  — supports ?category=&search=&minPrice=&maxPrice=&sort=
async function getProducts(req, res) {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    const sortMap = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "rating-desc": { rating: -1 },
      newest: { createdAt: -1 }
    };
    if (sort && sortMap[sort]) query = query.sort(sortMap[sort]);

    const products = await query.exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
}

// POST /api/products  (admin only)
async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
}

// PUT /api/products/:id  (admin only)
async function updateProduct(req, res) {
  try {
    const product = await Product.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err.message });
  }
}

// DELETE /api/products/:id  (admin only)
async function deleteProduct(req, res) {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
