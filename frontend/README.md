# EthioShop — Frontend

The customer-facing and admin storefront for **EthioShop**, a full-stack e-commerce platform built for the Ethiopian market. Built with React 19, Vite 8, and Tailwind CSS v4.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [State Management](#state-management)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Key Features](#key-features)
- [Design System](#design-system)
- [Authentication Flow](#authentication-flow)
- [Admin Dashboard](#admin-dashboard)
- [User Dashboard](#user-dashboard)
- [Connecting to the Backend](#connecting-to-the-backend)

---

## Overview

EthioShop frontend is a single-page application (SPA) that provides:

- A **public storefront** for browsing and purchasing products
- A **user account dashboard** for managing orders, wishlist, and profile
- An **admin dashboard** for managing products, orders, users, and analytics
- Full **authentication flow** with email/password and Google OAuth support

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React | 19.2 |
| Build Tool | Vite | 8.0 |
| Styling | Tailwind CSS | 4.2 |
| Routing | React Router DOM | 7.14 |
| State Management | Zustand | 5.0 |
| Animations | Framer Motion | 12.38 |
| Forms | React Hook Form + Zod | 7.72 / 4.3 |
| HTTP Client | Axios | 1.15 |
| Charts | Recharts | 3.8 |
| Icons | React Icons + Lucide React | 5.6 / 1.8 |
| Date Utility | Day.js | 1.11 |
| JWT Decoding | jwt-decode | 4.0 |

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── admin/                      # Admin dashboard (role-protected)
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AdminLayout.jsx # Root admin layout with sidebar + header
│   │   │       ├── Sidebar.jsx     # Collapsible navigation sidebar
│   │   │       ├── Header.jsx      # Top bar with menu toggle
│   │   │       └── Footer.jsx
│   │   │   ├── orders/
│   │   │   │   └── OrdersTable.jsx
│   │   │   ├── products/
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── ProductTable.jsx
│   │   │   └── users/
│   │   │       └── UsersTable.jsx
│   │   ├── data/
│   │   │   └── mockData.js         # Seed data for admin (replace with API calls)
│   │   └── pages/
│   │       ├── Overview.jsx        # KPI dashboard with charts
│   │       ├── Products.jsx        # Product CRUD
│   │       ├── Orders.jsx          # Order management
│   │       ├── Users.jsx           # Customer management
│   │       ├── Analytics.jsx       # Revenue & traffic analytics
│   │       └── Settings.jsx        # Store settings
│   ├── components/
│   │   └── ProtectedRoute.jsx      # Auth guard for admin routes
│   ├── data/
│   │   └── products.js             # Storefront product seed data
│   ├── pages/                      # Storefront pages
│   │   ├── StorefrontLayout.jsx    # Shared nav + footer wrapper
│   │   ├── Home.jsx                # Landing page
│   │   ├── Products.jsx            # Product listing with filters
│   │   ├── ProductDetail.jsx       # Single product view
│   │   ├── Cart.jsx                # Shopping cart
│   │   ├── Checkout.jsx            # 3-step checkout flow
│   │   ├── Account.jsx             # User dashboard (orders, wishlist, profile)
│   │   ├── Login.jsx               # Sign in
│   │   ├── Register.jsx            # Create account
│   │   ├── ForgotPassword.jsx      # Password reset request
│   │   ├── Support.jsx             # FAQ + search
│   │   ├── Contact.jsx             # Contact form
│   │   ├── Privacy.jsx
│   │   └── Terms.jsx
│   ├── store/
│   │   ├── authStore.js            # Auth state (user, isAuthenticated, signOut)
│   │   ├── cartStore.js            # Cart items with persist
│   │   └── wishlistStore.js        # Wishlist with persist
│   ├── utils/
│   │   └── googleSignIn.js         # Google Identity Services OAuth helper
│   ├── hooks/
│   │   └── use-mobile.tsx
│   ├── App.jsx                     # Root router
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles + Tailwind import
├── .env.example                    # Environment variable template
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Pages & Routes

### Public / Storefront

| Route | Page | Description |
|---|---|---|
| `/` | — | Redirects to `/home` |
| `/home` | `Home.jsx` | Landing page with hero, categories, featured products, deals, newsletter |
| `/products` | `Products.jsx` | Product listing with search, filter by category, sort |
| `/products/:id` | `ProductDetail.jsx` | Product images, description, specs, reviews, add to cart / buy now |
| `/cart` | `Cart.jsx` | Cart items, quantity controls, order summary |
| `/checkout` | `Checkout.jsx` | 3-step: Delivery → Payment → Review → Order confirmation |
| `/account` | `Account.jsx` | User dashboard (requires login) |
| `/support` | `Support.jsx` | Searchable FAQ accordion |
| `/contact` | `Contact.jsx` | Contact form with validation |
| `/privacy` | `Privacy.jsx` | Privacy policy |
| `/terms` | `Terms.jsx` | Terms of service |

### Auth

| Route | Page | Description |
|---|---|---|
| `/login` | `Login.jsx` | Email/password + Google sign-in |
| `/register` | `Register.jsx` | Account creation with password strength indicator |
| `/forgot-password` | `ForgotPassword.jsx` | Password reset request |

### Admin (role-protected)

| Route | Page | Description |
|---|---|---|
| `/admin` | — | Redirects to `/admin/overview` |
| `/admin/overview` | `Overview.jsx` | KPI cards, revenue chart, recent orders |
| `/admin/products` | `Products.jsx` | Add / edit / delete products |
| `/admin/orders` | `Orders.jsx` | View and update order statuses |
| `/admin/users` | `Users.jsx` | View and manage customers |
| `/admin/analytics` | `Analytics.jsx` | Conversion, traffic, and revenue metrics |
| `/admin/settings` | `Settings.jsx` | Store profile, security, notifications |

> **Access control:** `/admin/*` routes are wrapped in `ProtectedRoute` with `adminOnly={true}`. Any user without `role: "admin"` is redirected to `/home`.

---

## State Management

Three Zustand stores with `localStorage` persistence:

### `authStore`
```js
{
  isAuthenticated: boolean,
  user: { id, name, email, role, avatar, provider },
  signInEmail({ email, name }),
  registerEmail({ name, email }),
  signInGoogle({ name, email, avatar }),
  signOut()
}
```

### `cartStore`
```js
{
  items: [{ id, name, image, price, quantity }],
  addItem(product, quantity),
  decrementItem(id),
  removeItem(id),
  clearCart(),
  totalItems()
}
```

### `wishlistStore`
```js
{
  items: [...],
  toggle(product),
  isWished(id),
  clear()
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# From the repo root
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Running the Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Google OAuth Client ID
# Get this from Google Cloud Console → APIs & Services → Credentials
# Without this, the "Continue with Google" button will show an error message
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Backend API base URL
VITE_API_URL=http://localhost:5000
```

> All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → **APIs & Services** → **Credentials**
3. Create an **OAuth 2.0 Client ID** (Web application)
4. Add `http://localhost:5173` to **Authorized JavaScript origins**
5. Copy the Client ID into your `.env` file

---

## Available Scripts

```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## Key Features

### Storefront
- **Home page** — animated hero with product carousel, category grid, featured banner, deals section, newsletter signup
- **Product listing** — search by keyword, filter by category, sort by price/rating/newest
- **Product detail** — image gallery with thumbnails, color selector, quantity picker, stock indicator, tabbed description/specs/reviews, related products
- **Cart** — persistent across sessions, quantity increment/decrement, free shipping threshold indicator
- **Checkout** — 3-step flow (Delivery info → Payment method → Order review), supports Chapa, card, and cash on delivery
- **Wishlist** — slide-over panel accessible from any page, persisted to localStorage

### User Account (`/account`)
- Overview with order stats, recent orders, and wishlist preview
- Full order history with status badges and cancel/review actions
- Wishlist management
- Profile editor (name, email, phone, address)
- Sign out and account deletion

### Admin Dashboard (`/admin`)
- KPI overview (revenue, active orders, customers, products)
- Revenue bar chart with monthly breakdown
- Recent orders table with real data
- Full product CRUD with form validation
- Order status management
- Customer list with role management
- Analytics page with conversion and traffic metrics
- Settings with profile, security, and notification tabs

---

## Design System

The app uses a custom design system defined in `src/index.css` with CSS custom properties:

```css
--primary:       #3857d6   /* Indigo blue — primary actions */
--accent:        #00a98f   /* Teal green — success states */
--danger:        #c7414b   /* Red — errors and destructive actions */
--text:          #111827   /* Near-black body text */
--text-muted:    #5b6475   /* Secondary text */
--border:        #d8deed   /* Subtle borders */
--bg:            #f4f6fb   /* Page background */
--surface:       #ffffff   /* Card/panel background */
```

**Reusable CSS classes:**

| Class | Usage |
|---|---|
| `.btn-primary` | Primary CTA buttons |
| `.btn-secondary` | Secondary/outline buttons |
| `.btn-ghost` | Ghost/text buttons |
| `.field` | Form inputs and textareas |
| `.field-error` | Error state for inputs |
| `.panel` | White card with border and rounded corners |
| `.container-shell` | Centered max-width content wrapper |

**Typography:** Inter (body) + Sora (headings) via Google Fonts.

---

## Authentication Flow

```
User visits /login
    │
    ├── Email/Password → authStore.signInEmail() → redirect to ?redirect param or /home
    │
    └── Google button → googleSignIn() utility
            │
            ├── VITE_GOOGLE_CLIENT_ID set → Google Identity popup → authStore.signInGoogle()
            └── Not set → error toast shown
```

After sign-in, the user's name appears as an **avatar dropdown** in the top navigation with links to:
- My Dashboard (`/account`)
- My Orders
- Wishlist
- Cart
- Sign Out

---

## Admin Dashboard

Access the admin dashboard at `/admin/overview`.

> **Note:** In the current frontend-only setup, any user with `role: "admin"` in the auth store can access the admin panel. When the backend is connected, role assignment will be handled server-side via JWT claims.

To simulate admin access during development, update the user object in `authStore` to include `role: "admin"`.

---

## User Dashboard

Access the user dashboard at `/account` (requires authentication).

If the user is not signed in, they are redirected to `/login?redirect=/account` and returned after sign-in.

---

## Connecting to the Backend

The frontend is currently running with **mock/seed data** in `src/data/products.js` and `src/admin/data/mockData.js`. To connect to the live backend:

1. Set `VITE_API_URL=http://localhost:5000` in your `.env`
2. Replace mock data calls with `axios` requests to the backend API
3. Update `authStore` to call `POST /api/auth/login` and `POST /api/auth/register`
4. Store the JWT returned by the backend and attach it to requests via an Axios interceptor:

```js
// Example Axios setup
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Backend API Endpoints (expected)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user (protected) |
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Single product |
| `POST` | `/api/products` | Create product (admin) |
| `PUT` | `/api/products/:id` | Update product (admin) |
| `DELETE` | `/api/products/:id` | Delete product (admin) |
| `GET` | `/api/orders` | List orders (admin) |
| `POST` | `/api/orders` | Place order |
| `GET` | `/api/users` | List users (admin) |
| `DELETE` | `/api/users/:id` | Delete user (admin) |

---

## Team

This frontend was built as part of the **NextGen-EShop** team project.

- Repository: [github.com/NextGen-Eshop/EthioShop](https://github.com/NextGen-Eshop/EthioShop)
- Branch: `feature/auth-pages`

---

*© 2026 EthioShop. Built with React + Vite.*
