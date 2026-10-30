# CasaNest

A home decor online shop. It has two parts, each in its own folder:

| Folder | What it is | Runs on |
|--------|------------|---------|
| `backend/` | The API server (Node.js + Express + MongoDB) — accounts, products, carts, orders | http://localhost:5001 |
| `frontend/` | The website (plain HTML/CSS/JS) — what shoppers and admins use | http://localhost:5500 |

You need **both running at the same time**, each in its own terminal window.

---

## Default admin login

| Email | Password |
|-------|----------|
| `admin@casanest.com` | `admin123` |

This account only exists after you run `npm run seed:admin` (step 3 below). **Change the password before putting the site anywhere public.**

---

## Start the project (first time)

Follow every step, in order. Copy the commands exactly.

### Step 1 — Install Node.js

Download and install the **LTS** version from https://nodejs.org.

Check it worked — open a terminal and run:

```bash
node -v
```

You should see a version number like `v22.x.x`. If you get "command not found", restart the terminal (or your computer) and try again.

### Step 2 — Set up the backend

```bash
cd "/path/to/CasaNest project/backend"
npm install
cp .env.example .env
```

Now open the new `backend/.env` file in any text editor and fill in `MONGO_URI` and `JWT_SECRET`. See [backend/README.md → Step 2](backend/README.md#step-2--fill-in-env) for exactly what to put there.

### Step 3 — Load the products and create the admin account

Still in the `backend` folder:

```bash
npm run seed
npm run seed:admin
```

You should see `Seeded 24 products into the database.` and then `Created admin admin@casanest.com / admin123`.

### Step 4 — Start the backend (terminal window #1)

```bash
npm run dev
```

Wait until you see:

```
CasaNest API listening on http://localhost:5001
MongoDB connected: ...
```

**Leave this window open.** Closing it stops the backend.

### Step 5 — Start the frontend (terminal window #2)

Open a **second** terminal window, then:

```bash
cd "/path/to/CasaNest project/frontend"
npm start
```

**Leave this window open too.**

### Step 6 — Open the site

Go to **http://localhost:5500** in your browser.

- To shop: browse, add to cart, register an account, check out.
- To manage the shop: sign in with the admin login above, then click **Admin** in the top menu.

---

## Start the project (every time after that)

Two terminal windows:

```bash
# window 1
cd "/path/to/CasaNest project/backend"
npm run dev
```

```bash
# window 2
cd "/path/to/CasaNest project/frontend"
npm start
```

Then open http://localhost:5500.

To stop either one: click in its terminal window and press **Ctrl + C**.

---

## Something not working?

Each README has a troubleshooting section:

- Backend problems (won't start, database errors, "address already in use") → [backend/README.md](backend/README.md#troubleshooting)
- Website problems (blank page, file list instead of the site, search not working, no Admin link) → [frontend/README.md](frontend/README.md#troubleshooting)
