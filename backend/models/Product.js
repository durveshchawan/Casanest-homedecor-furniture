const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // e.g. "p01" — matches the frontend's existing ids
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    stock: { type: Boolean, default: true },
    badge: { type: String, default: "" },
    colors: [{ name: String, hex: String }],
    images: [String],
    desc: { type: String, default: "" },
    specs: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Product", productSchema);
