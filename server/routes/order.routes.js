import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import Order from "../models/Order.model.js";

const router = express.Router();

// Place order
router.post("/", protect, async (req, res, next) => {
  try {
    const order = await Order.create({ ...req.body, buyer: req.user._id });
    res.status(201).json({ message: "Order placed.", order });
  } catch (err) { next(err); }
});

// My orders
router.get("/my-orders", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("orderItems.product", "title images")
      .sort("-createdAt");
    res.json({ orders });
  } catch (err) { next(err); }
});

// Get order by ID
router.get("/:id", protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("orderItems.product");
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.buyer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }
    res.json({ order });
  } catch (err) { next(err); }
});

// Admin: all orders
router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find().populate("buyer", "name email").sort("-createdAt");
    res.json({ orders });
  } catch (err) { next(err); }
});

export default router;
