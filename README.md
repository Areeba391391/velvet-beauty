# Velvet Beauty 💄
### Luxury Cosmetics E-commerce — Pakistan

A complete, fully-functional e-commerce website for a luxury cosmetics brand. 100% frontend — no database needed. All data stored in `localStorage`.

---

## 🚀 Quick Start

```bash
npm install
npm start
# Open http://localhost:3000
```

---

## 👤 Login Credentials

| Role | Email | Password | Access Code |
|------|-------|----------|-------------|
| Owner | owner@velvetbeauty.pk | owner123 | OWNER2025 |
| Employee | employee@velvetbeauty.pk | emp123 | EMP2025 |
| Customer | Register on login page | — | — |

---

## 📁 Project Structure

```
velvet-beauty/
├── views/                   # All HTML pages
│   ├── index.html           # Homepage
│   ├── shop.html            # Shop with filters
│   ├── product-detail.html  # Product page
│   ├── cart.html            # Shopping cart
│   ├── wishlist.html        # Wishlist
│   ├── checkout.html        # Checkout
│   ├── order-success.html   # Order confirmation
│   ├── login.html           # Auth (all 3 roles)
│   ├── dashboard-owner.html # Owner dashboard (full CRUD)
│   └── dashboard-emp.html   # Employee dashboard
├── public/
│   ├── css/
│   │   ├── variables.css    # Design tokens
│   │   ├── main.css         # Shared components
│   │   ├── index.css        # Homepage styles
│   │   ├── shop.css         # Shop styles
│   │   ├── product-detail.css
│   │   ├── cart.css
│   │   ├── wishlist.css
│   │   ├── checkout.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   └── js/
│       ├── store.js         # Central brain (all data + helpers)
│       ├── index.js         # Homepage logic
│       ├── shop.js          # Shop filters + search
│       ├── product-detail.js
│       ├── cart.js
│       ├── wishlist.js
│       ├── checkout.js
│       ├── auth.js
│       ├── dashboard-owner.js
│       └── dashboard-emp.js
├── server.js                # Express static server
└── package.json
```

---

## ✨ Features

### Website
- **Homepage** — Hero, category grid, featured tabs, promo banner with countdown, bestsellers, testimonials, newsletter
- **Shop** — Filter sidebar (category, price, rating, availability), search, sort, grid/list toggle, pagination, active filter chips
- **Product Detail** — Image gallery + thumbnails, shade swatches, qty selector, add to cart, wishlist, reviews with star picker, related products
- **Cart** — Update qty, remove items, coupon codes, order summary
- **Wishlist** — Move to cart, move all, remove
- **Checkout** — Address form, delivery options (standard/express/same-day), payment methods (COD, EasyPaisa, JazzCash, Bank), order review
- **Order Success** — Confirmation with order details

### Auth
- 3 roles: Customer, Employee, Owner
- Access codes for staff (EMP2025 / OWNER2025)
- Auth guards on all protected pages

### Owner Dashboard
- **Overview** — Revenue, orders, customers, products stats + bar chart
- **Orders** — View, update status, delete
- **Products** — Full CRUD with modal, image preview, shade colors
- **Customers** — View details, update type (New/Regular/VIP), delete
- **Reviews** — View and delete
- **Analytics** — Monthly revenue table + summary stats
- **Settings** — Change access codes, delivery fees

### Employee Dashboard
- Overview stats (today's orders, pending, shipped, delivered)
- Orders — View + update status only
- Products — View only
- Reviews — View only

---

## 🎨 Design

- **Colors**: Hot Pink `#E91E8C`, Deep Plum `#4A1A40`, Rose Gold `#C9956C`, Cream `#FDF6F0`
- **Fonts**: Cormorant Garamond (headings) + Jost (body) — loaded from Google Fonts
- **Responsive**: Mobile-first, works on all screen sizes

---

## 🛒 Coupon Codes

| Code | Discount |
|------|----------|
| VELVET10 | 10% off |
| BEAUTY20 | 20% off |
| VIP30 | 30% off |
| FIRST15 | 15% off |

Free delivery on orders over **Rs. 2,000**

---

## 📦 Seed Data

20 products across 5 categories, 8 customers, 8 orders, 7 reviews, 6 months of analytics — all pre-loaded on first run.
