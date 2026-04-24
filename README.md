# EthioShop — Full-Stack E-Commerce Platform

A production-grade e-commerce web application built for the Ethiopian market. Features a customer storefront, admin dashboard, secure JWT authentication, role-based access control (RBAC), and Chapa payment integration.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [RBAC System](#rbac-system)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Frontend Routes](#frontend-routes)
- [Role-Based Routing](#role-based-routing)
- [Admin Dashboard](#admin-dashboard)
- [Payment Integration](#payment-integration)
- [Scripts](#scripts)
- [Team](#team)

---

## Overview

EthioShop is a full-stack e-commerce platform with:

- **Customer storefront** — browse products, manage cart, checkout, track orders
- **Admin dashboard** — manage products, orders, users, and view analytics
- **Secure authentication** — JWT access tokens + HTTP-only refresh token cookies
- **RBAC** — role-based access enforced on both backend and frontend
- **Chapa payments** — Ethiopian payment gateway integration

---

## Tech Stack

### Frontend
| | Library | Version |
|---|---|---|
| Framework | React | 19 |
| Build | Vite | 8 |
| Styling | Tailwind CSS | 4 |
| Routing | React Router DOM | 7 |
| State | Zustand (persist) | 5 |
| Animations | Framer Motion | 12 |
| HTTP | Axios | 1.15 |
| Forms | React Hook Form + Zod | 7 / 4 |
| Charts | Recharts | 3 |

### Backend
| | Library | Version |
|---|---|---|
| Runtime | Node.js | 18+ |
| Framework | Express | 4 |
| Database | MongoDB + Mongoose | 8 |
| Auth | jsonwebtoken + bcryptjs | 9 / 2 |
| Security | helmet, cors, cookie-parser | latest |
| Logging | morgan | 1 |
| Payments | Chapa API (axios) | — |

---

## Project Structure

```
EthioShop/
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── .env                         # Environment variables (not committed)
│   ├── .env.example                 # Template for env setup
│   └── src/
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── roles.js             # RBAC — roles, permissions, mapping
│       ├── controllers/
│       │   ├── authController.js    # register, login, Google, refresh, logout, profile
│       │   ├── productController.js # CRUD + reviews
│       │   ├── orderController.js   # create, list, update status
│       │   ├── cartController.js    # get, add, update, remove
│       │   ├── userController.js    # admin user management
│       │   └── paymentController.js # Chapa initiate + verify
│       ├── middleware/
│       │   ├── authMiddleware.js    # protect, authorizeRoles, authorizePermissions
│       │   ├── roleMiddleware.js    # re-exports from authMiddleware
│       │   └── errorMiddleware.js   # global error + 404 handler
│       ├── models/
│       │   ├── User.js              # firstName, lastName, email, passwordHash, role, refreshToken
│       │   ├── Product.js           # name, price, category, stock, reviews, isActive
│       │   ├── Order.js             # user, items, totalPrice, status, deliveryAddress
│       │   └── Cart.js              # user, items[]
│       ├── routes/
│       │   ├── authRoutes.js        # /api/auth/*
│       │   ├── userRoutes.js        # /api/users/* (admin)
│       │   ├── productRoutes.js     # /api/products/*
│       │   ├── cartRoutes.js        # /api/cart/*
│       │   ├── orderRoutes.js       # /api/orders/*
│       │   ├── paymentRoutes.js     # /api/payments/*
│       │   └── adminRoutes.js       # /api/admin/* (dashboard KPIs, role change)
│       ├── services/
│       │   └── paymentService.js    # Chapa API calls
│       ├── utils/
│       │   ├── generateToken.js     # generateAccessToken, generateRefreshToken
│       │   └── seedAdmin.js         # one-time admin seed script
│       └── validations/
│           └── app.js               # shared validation helpers
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── App.jsx                  # Root router with role-based route guards
        ├── main.jsx
        ├── index.css                # Global styles + Tailwind + design tokens
        ├── admin/
        │   ├── components/layout/
        │   │   ├── AdminLayout.jsx  # Sidebar + header wrapper
        │   │   ├── Sidebar.jsx      # Collapsible nav with user info + logout
        │   │   └── Header.jsx
        │   ├── data/
        │   │   └── mockData.js      # Fallback data when backend is offline
        │   └── pages/
        │       ├── Overview.jsx     # KPI dashboard (live API + chart)
        │       ├── Products.jsx     # Product CRUD
        │       ├── Orders.jsx       # Order management
        │       ├── Users.jsx        # User management + role change
        │       ├── Analytics.jsx    # Revenue & traffic metrics
        │       └── Settings.jsx     # Store settings
        ├── components/
        │   └── ProtectedRoute.jsx   # Auth + role + permission guard
        ├── data/
        │   └── products.js          # Storefront seed data (fallback)
        ├── hooks/
        │   ├── usePermission.js     # can(), isAdmin, canAny(), canAll()
        │   └── use-mobile.tsx
        ├── pages/
        │   ├── StorefrontLayout.jsx # Shared nav + footer + wishlist panel
        │   ├── Home.jsx             # Landing page
        │   ├── Products.jsx         # Product listing
        │   ├── ProductDetail.jsx    # Single product + reviews
        │   ├── Cart.jsx             # Shopping cart
        │   ├── Checkout.jsx         # 3-step checkout
        │   ├── Account.jsx          # User dashboard
        │   ├── Login.jsx            # Sign in (email + Google)
        │   ├── Register.jsx         # Create account
        │   ├── ForgotPassword.jsx   # Password reset
        │   ├── Support.jsx          # FAQ accordion
        │   ├── Contact.jsx          # Contact form
        │   ├── Privacy.jsx
        │   └── Terms.jsx
        ├── store/
        │   ├── authStore.js         # Zustand: user, token, permissions, login, signOut
        │   ├── cartStore.js         # Zustand: cart items (persisted)
        │   └── wishlistStore.js     # Zustand: wishlist (persisted)
        └── utils/
            ├── api.js               # Axios instance + token interceptor + auto-refresh
            └── googleSignIn.js      # Google Identity Services helper
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm 9+

### 1. Clone the repo
```bash
git clone https://github.com/NextGen-Eshop/EthioShop.git
cd EthioShop
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

### 4. Seed admin account (first time only)
```bash
cd backend
node src/utils/seedAdmin.js
```
This creates or resets the admin account:
- **Email:** `admin@shop.com`
- **Password:** `Admin@1234`

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ethioshop

# JWT
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRE=7d

# Chapa payment gateway
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxx

# URLs
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  React SPA (Vite)                                       │
│  ├── Zustand stores (auth, cart, wishlist)              │
│  ├── api.js (axios + Bearer token + cookie)             │
│  └── Role-based routing (ProtectedRoute, UserOnlyRoute) │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────────────┐
│                   Express API (port 5000)                │
│                                                         │
│  Middleware chain:                                      │
│  cors → helmet → morgan → cookieParser → routes         │
│                                                         │
│  Auth middleware:                                       │
│  protect → authorizePermissions(...)                    │
│                                                         │
│  Routes:                                                │
│  /api/auth  /api/products  /api/orders                  │
│  /api/cart  /api/users     /api/admin  /api/payments    │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────────────┐
│              MongoDB Atlas                              │
│  Collections: users, products, orders, carts            │
└─────────────────────────────────────────────────────────┘
```

---

## RBAC System

### Roles

| Role | Description |
|---|---|
| `admin` | Full access to everything |
| `manager` | Manage products, orders, view analytics — cannot delete users or change roles |
| `user` / `customer` | Browse products, place orders, view own orders |

### Permissions

| Permission | Admin | Manager | User |
|---|---|---|---|
| `create_product` | ✅ | ✅ | ❌ |
| `update_product` | ✅ | ✅ | ❌ |
| `delete_product` | ✅ | ❌ | ❌ |
| `view_products` | ✅ | ✅ | ✅ |
| `place_order` | ✅ | ✅ | ✅ |
| `view_own_orders` | ✅ | ✅ | ✅ |
| `view_all_orders` | ✅ | ✅ | ❌ |
| `update_order` | ✅ | ✅ | ❌ |
| `delete_order` | ✅ | ❌ | ❌ |
| `view_all_users` | ✅ | ✅ | ❌ |
| `update_user` | ✅ | ❌ | ❌ |
| `delete_user` | ✅ | ❌ | ❌ |
| `change_role` | ✅ | ❌ | ❌ |
| `view_analytics` | ✅ | ✅ | ❌ |

### Backend enforcement

```js
// Protect + permission check on every sensitive route
router.delete('/:id', protect, authorizePermissions('delete_product'), deleteProduct);

// protect    → verifies JWT, attaches req.user + req.permissions
// authorizePermissions → checks req.permissions array (derived from role in DB)
```

### Frontend enforcement

```jsx
// Route guard
<ProtectedRoute adminOnly>
  <AdminLayout />
</ProtectedRoute>

// Component-level
const { can, isAdmin } = usePermission();
{can('delete_product') && <button>Delete</button>}
{isAdmin && <Link to="/admin">Dashboard</Link>}
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Login, returns accessToken + sets refresh cookie |
| POST | `/google` | Public | Google OAuth sign-in |
| POST | `/refresh` | Cookie | Rotate access token using refresh cookie |
| POST | `/logout` | Cookie | Clear refresh token |
| GET | `/profile` | Bearer | Get current user profile |
| PUT | `/profile` | Bearer | Update profile |

**Login response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "permissions": ["view_products", "place_order", "view_own_orders"],
    "accessToken": "eyJ..."
  }
}
```

### Products — `/api/products`

| Method | Endpoint | Auth | Permission |
|---|---|---|---|
| GET | `/` | Public | — |
| GET | `/:id` | Public | — |
| GET | `/:id/reviews` | Public | — |
| POST | `/:id/reviews` | Bearer | `place_order` |
| POST | `/` | Bearer | `create_product` |
| PUT | `/:id` | Bearer | `update_product` |
| DELETE | `/:id` | Bearer | `delete_product` |

### Orders — `/api/orders`

| Method | Endpoint | Auth | Permission |
|---|---|---|---|
| POST | `/` | Bearer | `place_order` |
| GET | `/my` | Bearer | `view_own_orders` |
| GET | `/` | Bearer | `view_all_orders` |
| GET | `/:id` | Bearer | `view_own_orders` |
| PUT | `/:id` | Bearer | `update_order` |
| DELETE | `/:id` | Bearer | `delete_order` |

### Cart — `/api/cart`

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/` | Bearer |
| POST | `/` | Bearer |
| PUT | `/:id` | Bearer |
| DELETE | `/:id` | Bearer |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Permission |
|---|---|---|---|
| GET | `/dashboard` | Bearer | `view_analytics` |
| PUT | `/users/:id/role` | Bearer | `change_role` |

### Users — `/api/users`

| Method | Endpoint | Auth | Permission |
|---|---|---|---|
| GET | `/` | Bearer | `view_all_users` |
| GET | `/:id` | Bearer | `view_all_users` |
| PUT | `/:id` | Bearer | `update_user` |
| DELETE | `/:id` | Bearer | `delete_user` |

### Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/initiate` | Bearer | Start Chapa payment |
| GET | `/verify/:tx_ref` | Public | Chapa callback verification |

---

## Authentication Flow

```
1. User submits email + password
         │
2. POST /api/auth/login
         │
3. Backend verifies password (bcrypt)
         │
4. Backend generates:
   ├── accessToken  (JWT, 15min, returned in JSON)
   └── refreshToken (JWT, 7d, set as HTTP-only cookie)
         │
5. Frontend stores:
   ├── accessToken  → Zustand authStore (memory only, not localStorage)
   ├── user + role + permissions → Zustand (persisted to localStorage)
   └── refreshToken → HTTP-only cookie (browser handles automatically)
         │
6. Every API request:
   Authorization: Bearer <accessToken>
         │
7. accessToken expires (15min):
   api.js interceptor → POST /api/auth/refresh (sends cookie)
   Backend rotates both tokens
   New accessToken stored in Zustand
         │
8. Logout:
   POST /api/auth/logout → clears DB refreshToken + cookie
   Zustand cleared
```

---

## Frontend Routes

### Public (no login required)
| Route | Page |
|---|---|
| `/home` | Landing page |
| `/products` | Product listing |
| `/products/:id` | Product detail |
| `/support` | FAQ |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### Auth
| Route | Page |
|---|---|
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password reset |

### User only (redirects admin to `/admin/overview`)
| Route | Page |
|---|---|
| `/cart` | Shopping cart |
| `/checkout` | 3-step checkout |
| `/account` | User dashboard |

### Admin only (redirects users to `/home`)
| Route | Page |
|---|---|
| `/admin/overview` | KPI dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/users` | User management |
| `/admin/analytics` | Analytics |
| `/admin/settings` | Settings |

---

## Role-Based Routing

```
User signs in
    │
    ├── role === 'admin'  →  /admin/overview
    └── role === 'user'   →  /home

Admin visits /cart or /checkout
    └── Redirected to /admin/overview  (UserOnlyRoute)

User visits /admin/*
    └── Redirected to /home  (ProtectedRoute adminOnly)

Guest visits protected route
    └── Redirected to /login?redirect=<original path>
        After login → returned to original path
```

---

## Admin Dashboard

The admin dashboard at `/admin/overview` shows:

- **KPI cards** — Total Revenue, Active Orders, Customers, Products (live from `/api/admin/dashboard`)
- **Revenue chart** — Monthly bar chart (last 6 months)
- **Recent orders table** — live from `/api/orders`

Falls back to mock data if the backend is offline.

---

## Payment Integration

EthioShop uses [Chapa](https://chapa.co) — Ethiopia's leading payment gateway.

**Supported methods via Chapa:**
- Telebirr
- CBE Birr
- Bank cards (Visa, Mastercard)

**Flow:**
```
1. User clicks "Place Order" on checkout
2. POST /api/payments/initiate → Chapa returns checkout_url
3. User redirected to Chapa payment page
4. Chapa calls callback_url on success
5. GET /api/payments/verify/:tx_ref → mark order as paid
```

Set `CHAPA_SECRET_KEY` in `.env` to enable. Use `CHASECK_TEST-...` for development.

---

## Scripts

### Backend
```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Production start

# Utilities
node src/utils/seedAdmin.js   # Create/reset admin account
```

### Frontend
```bash
npm run dev      # Dev server → http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## Team

Built by the **NextGen-EShop** team as a full-stack project.

| Member | Role |
|---|---|
| Auth & Backend API | Backend team |
| Frontend & UI | Frontend team |
| Admin Dashboard | Dashboard team |
| Product & Order pages | Product team |

**Repository:** [github.com/NextGen-Eshop/EthioShop](https://github.com/NextGen-Eshop/EthioShop)

---

*© 2026 EthioShop. Built with React + Node.js + MongoDB.*
