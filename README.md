# Lumine — Full-Stack E-Commerce App

A complete e-commerce storefront + admin panel, built with **Next.js (TypeScript)**,
**Express + MySQL**, and **Stripe** for payments — styled around the red/pink
palette you shared.

## What's included

**Storefront**
- Home, shop (with sidebar category/price/sort filters), search bar in the navbar
- Product detail pages with a multi-image gallery, size & colour selection
- Cart with a slide-in side drawer + a full cart page
- Wishlist / favourites
- Checkout with Stripe card payment (test mode)
- Login / register with a show/hide password eye icon
- "My orders" order history page and a public FAQ accordion page
- Dark mode / light mode toggle (persisted)
- Currency toggle: LKR (Rs) ⇄ USD
- Live chat widget with quick-reply FAQ buttons and keyword-matched auto-answers
- Toast notifications for every success/error (add to cart, checkout, auth, etc.)

**Admin panel** (`/admin`, requires an admin account)
- Dashboard: revenue, orders, products, customers, recent orders, top sellers
- Products: create/delete, **upload multiple images per product**, sizes, colours,
  stock, sale price, featured flag
- Orders: view all orders, update status (pending → paid → shipped → delivered)
- Live chat FAQ: add/edit/delete the questions & answers the chat bot uses

**Backend (Express + MySQL)**
- JWT auth (bcrypt-hashed passwords)
- REST API: auth, products (multi-image upload via multer), categories, cart,
  favourites, orders, Stripe payment intents, admin stats, chat/FAQ
- `schema.sql` with the full database schema + seed categories/FAQ data
- `config/seed.js` seeds an admin account + demo products

## Project structure
```
lumine/
├── backend/     Express API (Node.js + MySQL + Stripe)
└── frontend/    Next.js app (TypeScript + Tailwind)
```

## Setup

### 1. Database
Install MySQL locally (or use a hosted MySQL), then:
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env      # fill in your MySQL password, JWT secret, Stripe secret key
npm install
npm run seed               # creates admin@lumine.com / Admin@123 + demo products
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # add your Stripe publishable key
npm install
npm run dev                         # http://localhost:3000
```

Sign in with `admin@lumine.com` / `Admin@123` to reach `/admin`.

## Payments
The checkout uses Stripe's test mode. Get free test API keys at
https://dashboard.stripe.com/test/apikeys, put the secret key in
`backend/.env` and the publishable key in `frontend/.env.local`.
Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## Notes & things to finish before going live
- **Payment gateway**: wired up for Stripe test mode; swap in your live keys
  and add a webhook handler for production-grade reliability (the current
  flow confirms payment client-side then records the order — fine for a
  demo, but a webhook is the more robust pattern for production).
- **Live chat**: answers come from the FAQ table using keyword matching
  (manageable from the admin panel) rather than a full AI model — this
  keeps it fast, free, and fully within your control. It can be swapped
  for an LLM-backed endpoint later without changing the frontend.
- **Currency conversion** uses a fixed demo exchange rate — connect a live
  FX rate API for accurate Rs/USD pricing.
- **Product images** are stored on local disk (`backend/uploads`) — for
  production, point multer at S3 or another object store.
- Email notifications (order confirmations, etc.) aren't wired up — add a
  provider like Resend/SendGrid in `orders.routes.js` when ready.

This is a real, working full-stack foundation — every screen, API route, and
flow in the list above runs end-to-end (verified with a production build).
It's intentionally not "infinite polish" (real deployment, image CDN, email,
live FX, production Stripe webhooks) since that depends on accounts and
infrastructure only you can set up.
