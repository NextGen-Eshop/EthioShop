import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getPermissions } from "../config/roles.js";

/**
 * protect — verifies JWT, attaches req.user + req.permissions
 * Must run before any role/permission check.
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized — no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash -refreshToken");
    if (!user) {
      return res.status(401).json({ message: "Not authorized — user no longer exists" });
    }

    req.user = user;
    req.permissions = getPermissions(user.role); // attach derived permissions
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized — token invalid or expired" });
  }
};

/**
 * authorizeRoles(...roles)
 * Usage: router.delete('/:id', protect, authorizeRoles('admin'), handler)
 */
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied — requires role: ${roles.join(' or ')}`,
    });
  }
  next();
};

/**
 * authorizePermissions(...permissions)
 * Usage: router.post('/', protect, authorizePermissions('create_product'), handler)
 * More granular than role check — future-proof for multi-role systems.
 */
export const authorizePermissions = (...required) => (req, res, next) => {
  if (!req.permissions) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const hasAll = required.every((p) => req.permissions.includes(p));
  if (!hasAll) {
    return res.status(403).json({
      message: `Access denied — missing permission: ${required.join(', ')}`,
    });
  }
  next();
};

// Convenience aliases
export const adminOnly = authorizeRoles('admin');
