import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import { generateToken } from "../middleware/auth.middleware.js";

// ─── Register ─────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  // Only allow buyer/seller during self-registration
  const allowedRoles = ["buyer", "seller"];
  const assignedRole = allowedRoles.includes(role) ? role : "buyer";

  const user = await User.create({ name, email, password, role: assignedRole });
  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
});

// ─── Login ────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
});

// ─── Get current user ─────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

// ─── Update profile ───────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, sellerProfile } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address, sellerProfile },
    { new: true, runValidators: true }
  );

  res.json({ success: true, user: user.toPublicJSON() });
});

// ─── Change password ──────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});
