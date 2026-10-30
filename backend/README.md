# CasaNest — Backend

The API server for CasaNest, built with **Node.js + Express + MongoDB**. It handles:

- **Accounts** — register / log in (passwords are hashed, logins use JWT tokens)
- **Products** — the catalogue, served from the database
- **Carts & wishlists** — saved to the account when someone is logged in
- **Orders** — checkout creates a real order; prices are re-checked on the server
- **Admin** — product management, order statuses and user roles (used by the frontend's admin panel)

It always runs on **http://localhost:5001** (hardcoded in `server.js`).

---

## Default admin login

| Email | Password |
|-------|----------|
| `admin@casanest.com` | `admin123` |

Created by `npm run seed:admin` (Step 3). The credentials are hardcoded at the top of `seed/seedAdmin.js`. **Change the password there before deploying anywhere public.**

---

## Setup (first time)

### Step 1 — Install

You need Node.js (https://nodejs.org, LTS version). Then, in a terminal:

```bash
cd "/path/to/CasaNest project/backend"
npm install
cp .env.example .env
```

### Step 2 — Fill in `.env`

Open `backend/.env` in a text editor. It needs these values:

| Setting | What to put | Example |
|---------|-------------|---------|
| `MONGO_URI` | Where your database is. See below. | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/casanest` |
| `JWT_SECRET` | Any long random text. Used to sign logins — keep it secret. | Generate one with the command below |
| `CLIENT_ORIGIN` | The website's address, for browser security (CORS). `*` allows any site — fine on your own computer. | `http://localhost:5500` or `*` |

**Getting a `MONGO_URI` — pick one:**

- **Easiest: free cloud database (MongoDB Atlas)**
  1. Sign up at https://www.mongodb.com/cloud/atlas and create a free cluster.
  2. Under **Database Access**, add a database user with a password.
  3. Under **Network Access**, add your IP address (or `0.0.0.0/0` to allow anywhere).
  4. Click **Connect → Drivers** and copy the connection string.
  5. Paste it as `MONGO_URI`, replace `<password>` with your user's password, and add `/casanest` before the `?` so the data goes into a database called `casanest`.
- **Or: MongoDB installed on your computer** — use `MONGO_URI=mongodb://127.0.0.1:27017/casanest` and make sure MongoDB is running.

**Generating a `JWT_SECRET`:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into `.env` as `JWT_SECRET=...`.

Your finished `.env` should look like this (with your own values):

```
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/casanest
JWT_SECRET=3f9c1e...a long random string...
CLIENT_ORIGIN=*
```

### Step 3 — Load products and create the admin

```bash
npm run seed
npm run seed:admin
```

Expected output:

```
Seeded 24 products into the database.
Created admin admin@casanest.com / admin123
```

⚠️ `npm run seed` **deletes every product** and reloads the original 24. Don't run it again once you've added or edited products in the admin panel, unless you want to reset them.

`npm run seed:admin` is safe to re-run. If the admin email already exists it just makes sure that account is an admin, and leaves the password alone.

### Step 4 — Start the server

```bash
npm run dev
```

Expected output:

```
CasaNest API listening on http://localhost:5001
MongoDB connected: ...
```

`npm run dev` restarts the server automatically when you edit code. (`npm start` also works, but doesn't auto-restart.) **Edits to `.env` are not picked up automatically** — type `rs` and press Enter in the server's terminal, or stop it with Ctrl + C and start it again.

To check it's working, open http://localhost:5001 in a browser. You should see `{"message":"CasaNest API is running"}`.

---

## Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the server, auto-restarting on code changes |
| `npm start` | Start the server (no auto-restart) |
| `npm run seed` | **Reset** the product catalogue to the original 24 products |
| `npm run seed:admin` | Create the default admin account (or re-promote it) |

---

## Troubleshooting

**`Error: listen EADDRINUSE: address already in use :::5001`**
Something is already using port 5001 — usually the backend is already running in another terminal window. Find it and stop it with Ctrl + C. To see what's using the port:
```bash
lsof -nP -iTCP:5001 -sTCP:LISTEN
```
If it's a `node` process you don't need, stop it with `kill <PID>` (the number in the PID column).

**`Failed to connect to MongoDB: ...` and the server stops**
The server exits if it can't reach the database. Check:
- `MONGO_URI` in `.env` is correct, with the real password instead of `<password>`.
- Atlas: your current IP address is allowed under **Network Access**. (This changes when you switch Wi-Fi.)
- Local MongoDB: it's actually running.

**`MONGO_URI is not set in your .env file`**
You skipped `cp .env.example .env`, or the file is named wrong. It must be called exactly `.env` and sit inside the `backend` folder.

**Login always fails with "Not authorized, invalid or expired token"**
`JWT_SECRET` was changed after you logged in, so old logins are invalid. Log out and log in again.

**"Admin access required" (403)**
You're logged in, but not as an admin. Use the default admin login above, or have an admin promote your account in the admin panel's **Users** tab.

---

## Making more admins

- **From the website (easiest):** log in as an admin → **Admin** → **Users** tab → change the person's role to **Admin**.
- **From the database:** open MongoDB (Compass, Atlas's **Browse Collections**, or `mongosh`), find the user in the `users` collection, and change `role` from `"customer"` to `"admin"`.

An admin can't remove their own admin access, so there's always at least one admin left.

---

## API reference

| Method | Route | Who can call it | Description |
|--------|-------|-----------------|-------------|
| POST | `/api/auth/register` | Anyone | Create an account → `{ name, email, password }` |
| POST | `/api/auth/login` | Anyone | Log in → `{ email, password }`, returns `{ user, token }` |
| GET | `/api/auth/me` | Logged in | The logged-in user's profile |
| GET | `/api/products` | Anyone | List products. Supports `?category=&search=&minPrice=&maxPrice=&sort=` |
| GET | `/api/products/:id` | Anyone | One product |
| POST | `/api/products` | Admin | Create a product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |
| GET | `/api/cart` | Logged in | The saved cart + wishlist |
| PUT | `/api/cart` | Logged in | Replace the saved cart + wishlist → `{ cart: [{ productId, qty, color }], wishlist: [ids] }` |
| GET | `/api/orders/pricing` | Anyone | Shipping, tax rate, coupons and per-product limit used at checkout |
| POST | `/api/orders` | Logged in | Place an order → `{ items, shippingAddress, couponCode }`. `shippingAddress` needs `fullName, line1, city, state, postalCode, phone` |
| GET | `/api/orders/mine` | Logged in | Your order history |
| GET | `/api/orders/:id` | Logged in | One order (must be yours, unless you're an admin) |
| GET | `/api/orders` | Admin | Every order, newest first, with the customer's name + email |
| PUT | `/api/orders/:id/status` | Admin | Change an order's status → `{ status }` (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) |
| GET | `/api/users` | Admin | Every user (no password hashes) |
| PUT | `/api/users/:id/role` | Admin | Change a user's role → `{ role: "customer" \| "admin" }` |

For "Logged in" and "Admin" routes, send the token you got from login as a header:

```
Authorization: Bearer <token>
```

Shipping (₹999 flat), tax (18% GST) and the coupon codes are set at the top of `controllers/orderController.js`. The website's cart reads them from `/api/orders/pricing`, so change them in that one place only.

---

## Connecting the frontend

The website in the `frontend` folder already points at `http://localhost:5001/api` (set at the top of `frontend/js/api.js`). If you deploy the backend somewhere else, change `API_BASE_URL` there.

## Deploying

This is a plain Express app, so it runs on any Node host (Render, Railway, Fly.io, a VPS, …) with a MongoDB Atlas database. On the host:

- Set `MONGO_URI`, `JWT_SECRET` and `CLIENT_ORIGIN` (the real website address) as environment variables.
- The port is hardcoded to 5001 in `server.js`. Many hosts tell your app which port to use, so you may need to change that line for them.
- Change the admin password in `seed/seedAdmin.js` **before** running `npm run seed:admin` there.
