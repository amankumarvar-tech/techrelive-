import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import User from "../models/User.model.js";

const router = express.Router();

// Update profile
router.put("/profile", protect, async (req, res, next) => {
  try {
    const { name, phone, address, sellerProfile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, sellerProfile },
      { new: true, runValidators: true }
    );
    res.json({ user: user.toSafeObject() });
  } catch (err) { next(err); }
});

// Toggle wishlist
router.patch("/wishlist/:productId", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    const idx = user.wishlist.indexOf(pid);
    if (idx === -1) { user.wishlist.push(pid); }
    else { user.wishlist.splice(idx, 1); }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) { next(err); }
});

// Admin: all users
router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().sort("-createdAt");
    res.json({ users });
  } catch (err) { next(err); }
});

// Admin: ban/unban
router.patch("/:id/ban", protect, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: `User ${user.isBanned ? "banned" : "unbanned"}.` });
  } catch (err) { next(err); }
});

export default router;
