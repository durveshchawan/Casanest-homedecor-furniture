/* ==========================================================================
   CasaNest — API client
   Talks to the backend in /backend. Loaded after data.js, before store.js.
   Everything here fails quietly (falls back to the existing localStorage-only
   behavior) so the site still works if the backend isn't running.
   ========================================================================== */

// If you deploy the backend somewhere else, change this one line.
const API_BASE_URL = "http://localhost:5001/api";

const TOKEN_KEY = "casanest_token";
const USER_KEY = "casanest_user";

/* ---------- low-level request helper ---------- */
async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch (_) { /* empty response */ }

  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- Auth ---------- */
const Auth = {
  getToken() { return localStorage.getItem(TOKEN_KEY); },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  isLoggedIn() { return !!this.getToken(); },
  _persist(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  },
  async register(name, email, password) {
    const data = await apiRequest("/auth/register", { method: "POST", body: { name, email, password } });
    this._persist(data);
    return data.user;
  },
  async login(email, password) {
    const data = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
    this._persist(data);
    return data.user;
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  // Re-reads the profile from the server so a changed role (e.g. promoted to
  // admin) shows up without logging out and back in. Returns the fresh user.
  async refresh() {
    const data = await apiRequest("/auth/me", { auth: true });
    const u = data.user;
    const user = { id: u._id, name: u.name, email: u.email, role: u.role };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }
};

/* ---------- Products ---------- */
// Fetches the live catalog and, if it succeeds, replaces PRODUCTS in place
// (so every page that already reads the PRODUCTS array picks up the update)
// and fires "products:updated" so pages can re-render.
// Either way it then sets catalogSettled and fires "products:settled", so a page
// can tell "still loading" apart from "this product really doesn't exist".
let catalogSettled = false;
async function loadProductsFromAPI() {
  try {
    const products = await apiRequest("/products");
    if (Array.isArray(products) && products.length) {
      PRODUCTS.length = 0;
      PRODUCTS.push(...products);
      document.dispatchEvent(new CustomEvent("products:updated"));
    }
  } catch (err) {
    // Backend not running / unreachable — the page keeps using js/data.js as a fallback.
    console.warn("Could not load live products, using local catalog instead:", err.message);
  } finally {
    catalogSettled = true;
    document.dispatchEvent(new CustomEvent("products:settled"));
  }
}

/* ---------- Cart sync (only runs when logged in) ---------- */
// The browser stores cart lines as { id, qty, color }; the API stores them as
// { productId, qty, color }. Convert at this boundary so neither side changes.
const toServerCart = (cart) => cart.map((i) => ({ productId: i.id, qty: i.qty, color: i.color ?? null }));
const fromServerCart = (cart) => (cart || []).map((i) => ({ id: i.productId, qty: i.qty, color: i.color ?? null }));

const CartSync = {
  async pull() {
    const data = await apiRequest("/cart", { auth: true });
    return { cart: fromServerCart(data.cart), wishlist: data.wishlist || [] };
  },
  async push(cart, wishlist) {
    return apiRequest("/cart", { method: "PUT", auth: true, body: { cart: toServerCart(cart), wishlist } });
  }
};

/* ---------- Orders ---------- */
const Orders = {
  // Shipping, tax rate and coupons as the server will actually charge them
  async pricing() {
    return apiRequest("/orders/pricing");
  },
  async place({ items, shippingAddress, couponCode }) {
    return apiRequest("/orders", { method: "POST", auth: true, body: { items, shippingAddress, couponCode } });
  },
  async mine() {
    return apiRequest("/orders/mine", { auth: true });
  }
};

/* ---------- Admin (every call needs an admin token) ---------- */
const Admin = {
  async me() {
    const data = await apiRequest("/auth/me", { auth: true });
    return data.user;
  },
  products: {
    list() { return apiRequest("/products"); },
    create(product) { return apiRequest("/products", { method: "POST", auth: true, body: product }); },
    update(id, product) {
      return apiRequest(`/products/${encodeURIComponent(id)}`, { method: "PUT", auth: true, body: product });
    },
    remove(id) { return apiRequest(`/products/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }); }
  },
  orders: {
    list() { return apiRequest("/orders", { auth: true }); },
    setStatus(id, status) {
      return apiRequest(`/orders/${id}/status`, { method: "PUT", auth: true, body: { status } });
    }
  },
  users: {
    list() { return apiRequest("/users", { auth: true }); },
    setRole(id, role) { return apiRequest(`/users/${id}/role`, { method: "PUT", auth: true, body: { role } }); }
  }
};
