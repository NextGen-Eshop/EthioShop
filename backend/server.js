import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import { errorHandler, notFound } from "./src/middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(path.join(uploadsDir, "payments"), { recursive: true });

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(uploadsDir));

app.get("/", (_req, res) => res.json({ status: "API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
