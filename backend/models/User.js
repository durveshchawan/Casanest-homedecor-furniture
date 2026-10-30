const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    color: { type: String, default: null }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    cart: { type: [cartItemSchema], default: [] },
    wishlist: { type: [String], default: [] } // array of product ids
  },
  { timestamps: true }
);

// Hash the password automatically whenever it's created or changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Never send the password hash back in API responses
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model("User", userSchema);
