# 🛍️ EthioShop

> A modern full-stack e-commerce platform built for the Ethiopian market — featuring multi-role management, real-time notifications, and a seamless shopping experience.

🌐 **Live Demo:** [ethio-shop-nu.vercel.app](https://ethio-shop-nu.vercel.app)

---

## ✨ Features

- 🔐 **Authentication** — JWT-based auth with Google OAuth 2.0 sign-in
- 🛒 **Shopping** — Product browsing, cart, wishlist, and checkout
- 📦 **Order Management** — Full order lifecycle from placement to delivery
- 👥 **Multi-Role System** — Separate dashboards for Admin, Staff, and Users
- 🔔 **Role-Based Notifications** — Smart alerts per user role and action
- 💳 **Payment Methods** — Configurable payment options managed by admin
- 📣 **Promotions & Announcements** — Admin-driven campaigns and banners
- ⚙️ **System Configuration** — Live settings that affect the entire platform
- 🌙 **Dark / Light Mode** — Theme toggle with persistent preference

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite, Zustand, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT, Google OAuth 2.0 |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google OAuth credentials

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---


## 🔀 Routes

### 🖥️ Frontend Pages

| Route | Page |
|-------|------|
| `/` | 🏠 Home |
| `/products` | 🛍️ Products |
| `/products/:id` | 📄 Product Detail |
| `/cart` | 🛒 Cart |
| `/checkout` | 💳 Checkout |
| `/account` | 👤 My Account |
| `/announcements` | 📣 Announcements |
| `/contact` | 📬 Contact |
| `/admin/*` | ⚙️ Admin Dashboard |
| `/staff/*` | 🧑‍💼 Staff Dashboard |

### 🔌 Backend API

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | 🔐 Login / Register |
| `GET /api/auth/google` | 🔑 Google OAuth |
| `GET /api/user/products` | 📦 Browse products |
| `GET/POST /api/cart` | 🛒 Cart management |
| `POST /api/orders` | 📋 Place an order |
| `GET /api/notifications` | 🔔 Role-based notifications |
| `GET /api/settings` | ⚙️ System configuration |
| `GET /api/admin/*` | 🛡️ Admin operations |
| `GET /api/staff/*` | 🧑‍💼 Staff operations |

---

## 👤 Roles

| Role | Access |
|------|--------|
| **Admin** | Full control — settings, users, products, orders, reports |
| **Staff** | Order processing, product management, announcements |
| **User** | Browse, shop, track orders, manage profile |

---

## 📁 Project Structure

```
EthioShop/
├── backend/        # Express API, models, controllers, routes
└── frontend/       # React SPA with role-based views
```

---

## 📄 License

MIT © [EthioShop](https://ethio-shop-nu.vercel.app)
