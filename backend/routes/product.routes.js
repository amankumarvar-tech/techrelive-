import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyListings,
} from "../controllers/product.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/seller/my-listings", protect, restrictTo("seller", "admin"), getMyListings);
router.get("/:id", getProductById);
router.post("/", protect, restrictTo("seller", "admin"), createProduct);
router.put("/:id", protect, restrictTo("seller", "admin"), updateProduct);
router.delete("/:id", protect, restrictTo("seller", "admin"), deleteProduct);

export default router;
