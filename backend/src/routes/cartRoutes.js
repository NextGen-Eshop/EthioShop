import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(501).json({ message: "Cart routes are not implemented yet." });
});

export default router;
