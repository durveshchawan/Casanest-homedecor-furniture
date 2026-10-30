/* ==========================================================================
   CasaNest — Shared front-end engine
   Handles: header/footer, cart + wishlist (localStorage), product cards,
   quick-view modal, toasts, search, counters, scroll reveals.
   Pure vanilla JS — no libraries.
   ========================================================================== */

/* ---------- Tiny helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const money = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
// Max units of any one product a customer can hold in their cart.
// Once the cart holds this many, the product shows as "Out of stock".
const MAX_PER_PRODUCT = 10;
const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
const stars = (r) => {
  const full = Math.round(r);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
};
// Fallback image if Unsplash can't load (offline demo safety)
const imgFallback = (seed) =>
  `https://picsum.photos/seed/casanest-${seed}/700/700`;
// A product's image (or the fallback if it has none — admins can save products without images)
const productImage = (p, i = 0) => (p.images && p.images[i]) || imgFallback(p.id);

/* ---------- Persistent state ---------- */
const Store = {
  cart: JSON.parse(localStorage.getItem("casanest_cart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("casanest_wishlist") || "[]"),

  save() {
    localStorage.setItem("casanest_cart", JSON.stringify(this.cart));
    localStorage.setItem("casanest_wishlist", JSON.stringify(this.wishlist));
    this.syncCounters();
    if (typeof refreshStockUI === "function") refreshStockUI();
    document.dispatchEvent(new CustomEvent("cart:updated"));
    // If the person is logged in, mirror the change to the backend too
    // (fire-and-forget — the site should never block on this).
    if (typeof Auth !== "undefined" && Auth.isLoggedIn() && typeof CartSync !== "undefined") {
      CartSync.push(this.cart, this.wishlist).catch(() => {});
    }
  },

  /* Cart */
  cartQty(id) {
    const item = this.cart.find((i) => i.id === id);
    return item ? item.qty : 0;
  },
  // Total units of a product in the cart, across all colours
  cartTotalFor(id) {
    return this.cart.filter((i) => i.id === id).reduce((n, i) => n + i.qty, 0);
  },
  // How many more units of this product can still be added
  remaining(id) {
    return Math.max(0, MAX_PER_PRODUCT - this.cartTotalFor(id));
  },
  // True when the cart already holds the maximum for this product
  isMaxed(id) { return this.remaining(id) === 0; },
  addToCart(id, qty = 1, color = null) {
    const p = getProduct(id);
    const canAdd = Math.min(qty, this.remaining(id));
    if (canAdd <= 0) {
      toast(`${p.name} is out of stock (max ${MAX_PER_PRODUCT} per order)`);
      return false;
    }
    const item = this.cart.find((i) => i.id === id && i.color === color);
    if (item) item.qty += canAdd;
    else this.cart.push({ id, qty: canAdd, color });
    this.save();
    if (canAdd < qty) toast(`Only ${canAdd} added — limit is ${MAX_PER_PRODUCT} per product`);
    else toast(`${p.name} added to cart`, "cart");
    return true;
  },
  setQty(id, qty, color = null) {
    const item = this.cart.find((i) => i.id === id && i.color === color);
    if (!item) return;
    const others = this.cartTotalFor(id) - item.qty;
    const max = Math.max(1, MAX_PER_PRODUCT - others);
    if (qty > max) toast(`Only ${MAX_PER_PRODUCT} units available per product`);
    item.qty = Math.min(Math.max(1, qty), max);
    this.save();
  },
  // Trim any saved cart (e.g. merged from the server) down to the limit
  clampCart() {
    const seen = {};
    this.cart = this.cart.filter((i) => {
      const room = MAX_PER_PRODUCT - (seen[i.id] || 0);
      if (room <= 0) return false;
      i.qty = Math.min(i.qty, room);
      seen[i.id] = (seen[i.id] || 0) + i.qty;
      return true;
    });
  },
  // Combine a cart/wishlist saved on the server with the one built up in this
  // browser (used on login): matching lines add their quantities, then the
  // per-product limit is applied again.
  mergeWith(server) {
    const cart = server.cart.map((i) => ({ ...i }));
    this.cart.forEach((local) => {
      const match = cart.find((i) => i.id === local.id && i.color === local.color);
      if (match) match.qty += local.qty;
      else cart.push({ ...local });
    });
    this.cart = cart;
    this.wishlist = [...new Set([...server.wishlist, ...this.wishlist])];
    this.clampCart();
    this.save();
  },
  // Forget this browser's cart + wishlist (used on logout so the next person
  // on this browser doesn't inherit them)
  clear() {
    this.cart = [];
    this.wishlist = [];
    this.save();
  },
  removeFromCart(id, color = null) {
    this.cart = this.cart.filter((i) => !(i.id === id && i.color === color));
    this.save();
  },
  cartCount() {
    return this.cart.reduce((n, i) => n + i.qty, 0);
  },
  cartSubtotal() {
    return this.cart.reduce((sum, i) => {
      const p = getProduct(i.id);
      return p ? sum + p.price * i.qty : sum;
    }, 0);
  },

  /* Wishlist */
  inWishlist(id) { return this.wishlist.includes(id); },
  toggleWishlist(id) {
    const p = getProduct(id);
    if (this.inWishlist(id)) {
      this.wishlist = this.wishlist.filter((x) => x !== id);
      this.save();
      toast(`${p.name} removed from wishlist`);
      return false;
    }
    this.wishlist.push(id);
    this.save();
    toast(`${p.name} saved to wishlist`, "heart");
    return true;
  },

  syncCounters() {
    $$("[data-cart-count]").forEach((el) => {
      const c = this.cartCount();
      el.textContent = c;
      el.dataset.count = c;
    });
    $$("[data-wish-count]").forEach((el) => {
      const c = this.wishlist.length;
      el.textContent = c;
      el.dataset.count = c;
    });
  }
};

Store.clampCart();

/* ==========================================================================
   Header + Footer injection (keeps every page consistent, DRY)
   ========================================================================== */
const NAV_ITEMS = [
  ["index.html", "Home"], ["shop.html", "Shop"], ["about.html", "About"],
  ["contact.html", "Contact"]
];

function buildHeader() {
  // Compare page names without ".html" — `serve` uses clean URLs (/shop, not /shop.html)
  const pageName = (path) => path.split("/").pop().replace(/\.html$/, "") || "index";
  const here = pageName(location.pathname);
  const loggedIn = typeof Auth !== "undefined" && Auth.isLoggedIn();
  const user = loggedIn ? Auth.getUser() : null;
  // Admins get an extra nav link (the backend still checks the role on every admin call)
  const items = user && user.role === "admin" ? [...NAV_ITEMS, ["admin.html", "Admin"]] : NAV_ITEMS;
  const links = items.map(
    ([href, label]) =>
      `<a href="${href}" class="${here === pageName(href) ? "active" : ""}">${label}</a>`
  ).join("");

  const accountLink = loggedIn
    ? `<button class="icon-btn" id="logoutBtn" aria-label="Log out" title="Log out ${user ? "(" + user.name + ")" : ""}">${icon("user")}</button>`
    : `<a href="login.html" class="icon-btn" aria-label="Account">${icon("user")}</a>`;

  return `
  <div class="topbar">Complimentary shipping on orders over ₹12,000 · 30-day easy returns</div>
  <header class="header" id="header">
    <div class="wrap nav">
      <a href="index.html" class="brand">Casa<span>Nest</span><small>Home Decor</small></a>
      <nav class="nav-links" id="navLinks">${links}</nav>

      <form class="nav-search" id="searchForm" role="search">
        ${icon("search")}
        <input type="search" id="searchInput" placeholder="Search decor…" aria-label="Search products" />
      </form>

      <div class="nav-actions">
        <a href="wishlist.html" class="icon-btn" aria-label="Wishlist">
          ${icon("heart")}<span class="badge" data-wish-count data-count="0">0</span>
        </a>
        <a href="cart.html" class="icon-btn" aria-label="Cart">
          ${icon("bag")}<span class="badge" data-cart-count data-count="0">0</span>
        </a>
        ${accountLink}
        <button class="nav-toggle icon-btn" id="navToggle" aria-label="Menu">${icon("menu")}</button>
      </div>
    </div>
  </header>`;
}

function buildFooter() {
  const shopLinks = CATEGORIES.slice(0, 6)
    .map((c) => `<li><a href="shop.html?cat=${encodeURIComponent(c)}">${c}</a></li>`)
    .join("");
  return `
  <footer class="footer">
    <div class="wrap footer-grid">
      <div class="footer-about">
        <a href="index.html" class="brand">Casa<span>Nest</span><small>Home Decor</small></a>
        <p>Considered pieces for a calmer home. Designed to last, made to be lived with.</p>
        <div class="socials">
          <a href="#" aria-label="Instagram">${icon("instagram")}</a>
          <a href="#" aria-label="Pinterest">${icon("pinterest")}</a>
          <a href="#" aria-label="Facebook">${icon("facebook")}</a>
        </div>
      </div>
      <div>
        <h4>Shop</h4>
        <ul>${shopLinks}</ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About Us</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="shop.html">All Products</a></li>
          <li><a href="wishlist.html">Wishlist</a></li>
        </ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul>
          <li><a href="contact.html">Shipping &amp; Returns</a></li>
          <li><a href="contact.html">Care Guide</a></li>
          <li><a href="contact.html">FAQ</a></li>
          <li><a href="login.html">My Account</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer-bar">
      <span>© 2026 CasaNest. A student project — for demonstration only.</span>
      <span>Privacy · Terms · Made with care</span>
    </div>
  </footer>`;
}

/* ==========================================================================
   Inline SVG icon set (no icon library needed)
   ========================================================================== */
function icon(name) {
  const w = `width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;
  const paths = {
    search: `<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>`,
    heart: `<path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"/>`,
    bag: `<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>`,
    user: `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
    menu: `<path d="M4 7h16M4 12h16M4 17h16"/>`,
    close: `<path d="M6 6l12 12M18 6 6 18"/>`,
    eye: `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
    check: `<path d="M20 6 9 17l-5-5"/>`,
    truck: `<path d="M3 7h11v8H3zM14 10h4l3 3v2h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>`,
    shield: `<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z"/>`,
    leaf: `<path d="M4 20c8 0 16-4 16-16 0 0-14-2-16 8a5 5 0 0 0 0 8Z"/><path d="M4 20c4-8 10-10 12-11"/>`,
    return: `<path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 21v-5h5"/>`,
    trash: `<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>`,
    minus: `<path d="M5 12h14"/>`,
    plus: `<path d="M12 5v14M5 12h14"/>`,
    instagram: `<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>`,
    pinterest: `<circle cx="12" cy="12" r="9"/><path d="M12 8c-2 0-3 1.4-3 3 0 1 .5 2 1.3 2.4M12 8c1.8 0 3 1.2 3 3s-1 3-2.4 3c-1 0-1.6-.8-1.6-.8M11 21l1.5-6"/>`,
    facebook: `<path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2Z"/>`,
    pin: `<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>`,
    mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>`,
    phone: `<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>`,
    clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
    star: `<path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.9L12 16.9 6.7 19.2l1-5.9L3.5 9.2l5.9-.9L12 3Z"/>`,
    tag: `<path d="M3 12V4h8l9 9-8 8-9-9Z"/><circle cx="7.5" cy="7.5" r="1.3"/>`,
    palette: `<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="10" r="1"/><path d="M12 21a3 3 0 0 1 0-6h1a2 2 0 0 0 0-4"/>`,
    sparkle: `<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/>`,
    handshake: `<path d="m11 17-3-3 2-2 2 2 2-2 3 3"/><path d="M3 8l4-2 5 3 5-3 4 2v6l-4 2"/>`
  };
  return `<svg ${w}>${paths[name] || ""}</svg>`;
}

/* ==========================================================================
   Product card renderer
   ========================================================================== */
function productCard(p) {
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const flags = [];
  const inStock = p.stock && !Store.isMaxed(p.id);
  if (!inStock) flags.push(`<span class="flag out">Sold out</span>`);
  else if (p.badge === "sale" && off) flags.push(`<span class="flag sale">-${off}%</span>`);
  else if (p.badge === "new") flags.push(`<span class="flag new">New</span>`);

  const wished = Store.inWishlist(p.id);

  return `
  <article class="card reveal" data-id="${p.id}" data-cat="${p.category}"
           data-price="${p.price}" data-rating="${p.rating}" data-reviews="${p.reviews}"
           data-name="${p.name.toLowerCase()}">
    <div class="card-media">
      <img src="${productImage(p)}" alt="${p.name}" loading="lazy"
           onerror="this.onerror=null;this.src='${imgFallback(p.id)}'">
      <div class="card-flags">${flags.join("")}</div>
      <div class="card-quick">
        <button class="round js-quick" title="Quick view" aria-label="Quick view of ${p.name}">${icon("eye")}</button>
        <button class="round js-wish ${wished ? "active" : ""}" title="Wishlist" aria-label="Add ${p.name} to wishlist">${icon("heart")}</button>
      </div>
      <div class="card-cart">
        <button class="btn ${inStock ? "btn--primary" : "btn--light"} btn--block btn--sm js-add" ${inStock ? "" : "disabled"}>
          ${inStock ? "Add to cart" : p.stock ? "Out of stock" : "Notify me"}
        </button>
      </div>
    </div>
    <div class="card-body">
      <span class="card-cat">${p.category}</span>
      <h3 class="card-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <div class="rating"><span class="stars">${stars(p.rating)}</span> ${p.rating} <span>(${p.reviews})</span></div>
      <div class="card-foot">
        <span class="price">${money(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ""}
        <span class="stock ${inStock ? "in" : "out"}">${inStock ? "In stock" : "Out of stock"}</span>
      </div>
    </div>
  </article>`;
}

// Re-sync every visible card with the cart, so a product flips to
// "Out of stock" as soon as 10 are added (and back if some are removed).
function refreshStockUI() {
  $$(".card[data-id]").forEach((card) => {
    const p = getProduct(card.dataset.id);
    if (!p || !p.stock) return;
    const inStock = !Store.isMaxed(p.id);
    const btn = card.querySelector(".js-add");
    if (btn) {
      btn.disabled = !inStock;
      btn.classList.toggle("btn--primary", inStock);
      btn.classList.toggle("btn--light", !inStock);
      btn.textContent = inStock ? "Add to cart" : "Out of stock";
    }
    const label = card.querySelector(".stock");
    if (label) {
      label.classList.toggle("in", inStock);
      label.classList.toggle("out", !inStock);
      label.textContent = inStock ? "In stock" : "Out of stock";
    }
    const flags = card.querySelector(".card-flags");
    if (flags) {
      const soldOut = flags.querySelector(".flag.out");
      if (!inStock && !soldOut) flags.insertAdjacentHTML("afterbegin", `<span class="flag out">Sold out</span>`);
      if (inStock && soldOut) soldOut.remove();
    }
  });
}

// Wire up card buttons within a container (event delegation)
function bindCards(container = document) {
  container.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest(".js-add")) {
      const p = getProduct(id);
      if (p.stock && !Store.isMaxed(id)) Store.addToCart(id);
      else if (p.stock) toast(`${p.name} is out of stock (max ${MAX_PER_PRODUCT} per order)`);
      else toast("We'll email you when it's back");
    }
    if (e.target.closest(".js-wish")) {
      const active = Store.toggleWishlist(id);
      e.target.closest(".js-wish").classList.toggle("active", active);
    }
    if (e.target.closest(".js-quick")) openQuickView(id);
  });
}

/* ==========================================================================
   Quick-view modal
   ========================================================================== */
function openQuickView(id) {
  const p = getProduct(id);
  let backdrop = $("#quickModal");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "quickModal";
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop || e.target.closest(".modal-close")) closeQuickView();
    });
  }
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${p.name}">
      <button class="modal-close" aria-label="Close">${icon("close")}</button>
      <img src="${productImage(p)}" alt="${p.name}" onerror="this.onerror=null;this.src='${imgFallback(p.id)}'">
      <div class="modal-body">
        <span class="card-cat">${p.category}</span>
        <h2 style="font-size:28px;margin:8px 0 10px">${p.name}</h2>
        <div class="rating" style="margin-bottom:14px"><span class="stars">${stars(p.rating)}</span> ${p.rating} <span>(${p.reviews} reviews)</span></div>
        <div class="pdp-price" style="margin-bottom:16px">
          <span class="price">${money(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span><span class="save">Save ${off}%</span>` : ""}
        </div>
        <p style="color:var(--muted);margin-bottom:22px">${p.desc}</p>
        <div class="pdp-actions" style="margin:0 0 18px">
          <button class="btn btn--primary" ${p.stock && !Store.isMaxed(p.id) ? "" : "disabled"} onclick="${p.stock && !Store.isMaxed(p.id) ? `Store.addToCart('${p.id}');closeQuickView()` : ""}">
            ${p.stock && !Store.isMaxed(p.id) ? "Add to cart" : "Out of stock"}
          </button>
          <a class="btn btn--ghost" href="product.html?id=${p.id}">View details</a>
        </div>
        <p style="font-size:13px;color:var(--muted)">${icon("truck")} Ships in 2–4 business days</p>
      </div>
    </div>`;
  requestAnimationFrame(() => backdrop.classList.add("open"));
  document.body.style.overflow = "hidden";
}
function closeQuickView() {
  const b = $("#quickModal");
  if (b) b.classList.remove("open");
  document.body.style.overflow = "";
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeQuickView(); });

/* ==========================================================================
   Toasts
   ========================================================================== */
function toast(msg, type = "check") {
  let wrap = $(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const iconName = { cart: "bag", heart: "heart", check: "check" }[type] || "check";
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${icon(iconName)}<span>${msg}</span>`;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 400);
  }, 2600);
}

/* ==========================================================================
   Scroll reveal
   ========================================================================== */
function initReveals() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("in"), (i % 4) * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => io.observe(el));
}

/* ==========================================================================
   Boot — runs on every page
   ========================================================================== */
// Draws the header and wires its buttons (called on boot, and again if the login state changes)
function refreshHeader() {
  const header = $("#site-header");
  if (!header) return;
  header.innerHTML = buildHeader();
  Store.syncCounters();
  bindHeader();
}

function bindHeader() {
  const logoutBtn = $("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Auth.logout();
      Store.clear(); // after logout, so the empty cart isn't pushed to the account
      toast("Logged out");
      setTimeout(() => location.href = "index.html", 800);
    });
  }

  // mobile menu
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.innerHTML = icon(open ? "close" : "menu");
    });
  }

  // search -> shop page
  const form = $("#searchForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("#searchInput").value.trim();
      location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  onHeaderScroll();
}

// sticky header shadow (looks the header up each time, since it can be redrawn)
function onHeaderScroll() {
  const hdr = $("#header");
  if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 10);
}

function boot() {
  const footer = $("#site-footer");
  if (footer) footer.innerHTML = buildFooter();
  refreshHeader();
  window.addEventListener("scroll", onHeaderScroll, { passive: true });

  // The role saved at login can go stale (e.g. promoted to admin since), so
  // re-check it and redraw the header if it changed. A rejected token means
  // the session is over, so log out locally too.
  if (typeof Auth !== "undefined" && Auth.isLoggedIn()) {
    const before = Auth.getUser();
    Auth.refresh().then((user) => {
      if (!before || before.role !== user.role || before.name !== user.name) refreshHeader();
    }).catch((err) => {
      if (err.status === 401) { Auth.logout(); Store.clear(); refreshHeader(); }
    });
  }

  // Try to load the live catalog from the backend (silently falls back to
  // js/data.js if the API isn't running). Pages listen for "products:updated"
  // to re-render once this resolves.
  if (typeof loadProductsFromAPI === "function") loadProductsFromAPI();

  initReveals();
}

document.addEventListener("DOMContentLoaded", boot);
