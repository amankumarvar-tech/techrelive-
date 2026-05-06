import express from "express";
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, reviewListing, getMyListings, addReview,
} from "../controllers/product.controller.js";
import { protect, optionalAuth, adminOnly, sellerOrAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", optionalAuth, getProducts);
router.get("/:id", optionalAuth, getProduct);

// Seller
router.post("/", protect, sellerOrAdmin, createProduct);
router.get("/seller/my-listings", protect, sellerOrAdmin, getMyListings);
router.put("/:id", protect, sellerOrAdmin, updateProduct);
router.delete("/:id", protect, sellerOrAdmin, deleteProduct);

// Buyer
router.post("/:id/reviews", protect, addReview);

// Admin
router.patch("/:id/review", protect, adminOnly, reviewListing);

export default router;
