import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
// Role-based route modules
import authRoutes from "./src/auth/routes/authRoutes.js";
import adminRoutes from "./src/admin/routes/adminRoutes.js";
import staffRoutes from "./src/staff/routes/staffRoutes.js";
import userRoutes from "./src/user/routes/userRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import announcementRoutes from "./src/routes/announcementRoutes.js";
import settingRoutes from "./src/routes/settingRoutes.js";

// Legacy route aliases for backward compatibility
import legacyUserRoutes from "./src/routes/userRoutes.js";
import legacyProductRoutes from "./src/routes/productRoutes.js";
import legacyCartRoutes from "./src/routes/cartRoutes.js";
import legacyOrderRoutes from "./src/routes/orderRoutes.js";
import legacyPaymentRoutes from "./src/routes/paymentRoutes.js";

import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFound } from "./src/middleware/errorMiddleware.js";

// Load env vars
dotenv.config();

connectDB();

const app = express();

// middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ethio-shop-nu.vercel.app',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((u) => u.trim()) : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true, // allow cookies (refresh token)
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API info endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EthioShop API is running (Role-Based Architecture)",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    roles: {
      auth: "/api/auth",
      admin: "/api/admin",
      staff: "/api/staff",
      user: "/api/user",
    },
    legacyEndpoints: {
      products: "/api/products",
      cart: "/api/cart",
      orders: "/api/orders",
      payments: "/api/payments",
      users: "/api/users",
    }
  });
});

// ─── ROLE-BASED ROUTES ───
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingRoutes);

// ─── BACKWARD-COMPATIBLE ALIASES ───
app.use("/api/users", legacyUserRoutes);
app.use("/api/products", legacyProductRoutes);
app.use("/api/cart", legacyCartRoutes);
app.use("/api/orders", legacyOrderRoutes);
app.use("/api/payment", legacyPaymentRoutes);
app.use("/api/payments", legacyPaymentRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// safe port fallback
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
