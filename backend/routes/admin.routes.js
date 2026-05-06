import { Router } from "express";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllUsers,
  verifySeller,
  getStats,
} from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

// All admin routes require auth + admin role
router.use(protect, restrictTo("admin"));

router.get("/stats", getStats);
router.get("/products/pending", getPendingProducts);
router.put("/products/:id/approve", approveProduct);
router.put("/products/:id/reject", rejectProduct);
router.get("/users", getAllUsers);
router.put("/users/:id/verify-seller", verifySeller);

export default router;
