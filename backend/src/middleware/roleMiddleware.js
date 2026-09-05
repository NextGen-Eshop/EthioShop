export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required. One actor can only have one role at a time." });
  }

  next();
};

export const staffOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "staff") {
    return res.status(403).json({ message: "Staff access required. One actor can only have one role at a time." });
  }

  next();
};

export const userOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Customer user access required. One actor can only have one role at a time." });
  }

  next();
};

export const staffOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin" && req.user.role !== "staff") {
    return res.status(403).json({ message: "Staff or Admin access required" });
  }

  next();
};

