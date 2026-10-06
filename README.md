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

### Environment Variables (Backend)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=https://your-frontend-url.vercel.app
```

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
