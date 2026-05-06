import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";

// ─── Protect: verify JWT ──────────────────────────────────
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorised – no token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password -refreshToken");

  if (!user) {
    res.status(401);
    throw new Error("User belonging to this token no longer exists");
  }

  req.user = user;
  next();
});

// ─── Restrict to specific roles ───────────────────────────
export const restrictTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied – requires role: ${roles.join(" or ")}`);
    }
    next();
  });

// ─── Token factory ────────────────────────────────────────
export const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
