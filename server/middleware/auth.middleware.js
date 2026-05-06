import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// ─── Verify JWT Token ─────────────────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({ error: "Token invalid. User not found." });
    }

    if (user.isBanned) {
      return res.status(403).json({
        error: "Your account has been suspended. Contact support.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    next(err);
  }
};

// ─── Optional Auth (attach user if token present, don't block if not) ─────────
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (_) {
    // Silently ignore; unauthenticated access allowed
  }
  next();
};

// ─── Role-Based Access Control ────────────────────────────────────────────────
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};

// ─── Shorthand Role Guards ────────────────────────────────────────────────────
export const adminOnly = authorize("admin");
export const sellerOrAdmin = authorize("seller", "admin");
export const anyRole = authorize("buyer", "seller", "admin");

// ─── Ownership Guard (user owns resource OR is admin) ─────────────────────────
export const ownerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);
      const isOwner = resourceUserId?.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: "Access denied. You do not own this resource.",
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
