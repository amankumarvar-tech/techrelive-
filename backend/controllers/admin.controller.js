import asyncHandler from "express-async-handler";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";

// ─── GET /api/admin/products/pending ─────────────────────
export const getPendingProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find({ status: "pending" })
    .populate("seller", "name email")
    .sort("-createdAt");
  res.json({ success: true, products });
});

// ─── PUT /api/admin/products/:id/approve ─────────────────
export const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      status: "approved",
      approvedBy: req.user._id,
      approvedAt: new Date(),
      adminNote: req.body.note || "",
    },
    { new: true }
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, message: "Product approved", product });
});

// ─── PUT /api/admin/products/:id/reject ──────────────────
export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      status: "rejected",
      approvedBy: req.user._id,
      approvedAt: new Date(),
      adminNote: req.body.note || "Listing rejected by admin",
    },
    { new: true }
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, message: "Product rejected", product });
});

// ─── GET /api/admin/users ─────────────────────────────────
export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password -refreshToken").sort("-createdAt");
  res.json({ success: true, users });
});

// ─── PUT /api/admin/users/:id/verify-seller ───────────────
export const verifySeller = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  ).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, message: "Seller verified", user });
});

// ─── GET /api/admin/stats ─────────────────────────────────
export const getStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalProducts, pendingProducts, approvedProducts] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Product.countDocuments({ status: "pending" }),
    Product.countDocuments({ status: "approved" }),
  ]);

  res.json({
    success: true,
    stats: { totalUsers, totalProducts, pendingProducts, approvedProducts },
  });
});
