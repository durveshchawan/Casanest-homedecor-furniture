# CasaNest — Frontend

The CasaNest website: plain **HTML + CSS + vanilla JavaScript**. No framework, no build step, nothing to compile.

It always runs on **http://localhost:5500** and talks to the API in the `backend` folder at **http://localhost:5001**.

---

## Default admin login

| Email | Password |
|-------|----------|
| `admin@casanest.com` | `admin123` |

This account is created by running `npm run seed:admin` in the `backend` folder. See [backend/README.md](../backend/README.md#step-3--load-products-and-create-the-admin).

---

## Run it

### Step 1 — Start the backend first

In its own terminal window (see [backend/README.md](../backend/README.md) for first-time setup):

```bash
cd "/path/to/CasaNest project/backend"
npm run dev
```

### Step 2 — Start the website

In a **second** terminal window:

```bash
cd "/path/to/CasaNest project/frontend"
npm start
```

The first time it downloads a small local web server (`serve`), which can take a few seconds.

Leave this window open. Press **Ctrl + C** in it to stop the website.

### Step 3 — Open it

Go to **http://localhost:5500**.

Use exactly `localhost` — not `127.0.0.1`. Browsers treat those as two different sites, and the backend may block the one it wasn't told about.

---

## Using the admin panel

1. Go to http://localhost:5500 and click the **person icon** (top right) to sign in.
2. Sign in with the admin login above.
3. Click **Admin** in the top menu.

From there you can:

- **Products** — add, edit and delete products (filter by category)
- **Orders** — see every order with its shipping address and customer, and change its status (pending → processing → shipped → delivered, or cancelled)
- **Users** — see all accounts and make someone an admin (or back to a customer)
- See totals at the top: products, orders, revenue (cancelled orders not counted), customers

Notes:
- The **Admin** link only appears for admin accounts.
- Hiding the link isn't the only protection: the backend checks the role on every admin action.
- If someone is made an admin while they're logged in, the link appears the next time they load a page. They don't need to log out.

---

## What works without the backend

If the backend isn't running, the site still loads: products come from the built-in list in `js/data.js`, and the cart and wishlist are saved in the browser.

These need the backend: signing in and registering, checkout, and the admin panel. Products added or edited in the admin panel also only show up while the backend is running.

---

## Pages

| Page | What it does |
|------|--------------|
| `index.html` | Home: categories, best sellers, new arrivals |
| `shop.html` | All products, with category/price filters, search (`?q=`) and sorting |
| `product.html` | One product (`?id=p01`) |
| `cart.html` | Cart, coupon codes, shipping address and checkout (must be signed in to check out) |
| `wishlist.html` | Saved products |
| `login.html` / `register.html` | Sign in / create an account |
| `about.html` / `contact.html` | Static info pages |
| `admin.html` | Admin panel (admins only) |

## Files

```
frontend/
├── *.html          one file per page
├── css/style.css   the only stylesheet (colours, fonts etc. are variables in :root at the top)
├── js/
│   ├── data.js     built-in product list, categories and coupons (used when the backend is off)
│   ├── api.js      talks to the backend: API_BASE_URL, Auth, CartSync, Orders, Admin
│   └── store.js    shared code: header/footer, cart + wishlist, product cards, toasts
├── package.json    `npm start` → serves this folder on port 5500
└── serve.json      settings for the local server. Don't delete it (see Troubleshooting)
```

Every page loads the scripts in this order: `data.js` → `api.js` → `store.js`.

The backend address is set in one place, at the top of `js/api.js`:

```js
const API_BASE_URL = "http://localhost:5001/api";
```

When adding a page, reuse the existing classes (`.btn`, `.field`, `.select`, `.tabs`, `.flag`, `.page-hero`, `.empty`) so it matches the rest of the site.

---

## Troubleshooting

**The page shows a list of files instead of the website**
`serve.json` is missing or was edited. It must contain:
```json
{
  "cleanUrls": false,
  "directoryListing": false,
  "rewrites": [{ "source": "/", "destination": "/index.html" }]
}
```
Then restart the website (Ctrl + C, then `npm start`). `serve` only reads this file when it starts.

**Search, a product page or a category link goes to a page like `/shop` and shows 404**
Your browser remembered an old redirect from before `serve.json` was fixed. Clear it: open DevTools (`Cmd + Option + I` on Mac, `F12` on Windows), then right-click the reload button and choose **Empty Cache and Hard Reload**. Or test in a private/incognito window.

**`npm start` says the port is already in use**
The website is already running in another terminal window. Use that one, or stop it with Ctrl + C first. To see what's using the port: `lsof -nP -iTCP:5500 -sTCP:LISTEN`.

**Sign in / checkout says it can't reach the server, or the admin panel says "Can't reach the server"**
The backend isn't running, or it crashed. Look at its terminal window. It should say `CasaNest API listening on http://localhost:5001`. See [backend troubleshooting](../backend/README.md#troubleshooting).

**Requests are blocked with a "CORS" error in the browser console**
The backend's `CLIENT_ORIGIN` setting doesn't match the address in your browser. Open the site at exactly `http://localhost:5500`, or set `CLIENT_ORIGIN=*` in `backend/.env` and restart the backend.

**No "Admin" link after signing in**
The account isn't an admin. Sign in with the default admin login above, or ask an admin to promote you in **Admin → Users**.

**"Place order" asks for an address**
All six shipping address fields are required. The address is remembered in your browser for next time.
