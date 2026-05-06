import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from "express-async-handler";
import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";

const router = Router();

// POST /api/orders – place an order
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { productId, shippingAddress, paymentMethod } = req.body;

    const product = await Product.findOne({ _id: productId, status: "approved" });
    if (!product) {
      res.status(404);
      throw new Error("Product not found or unavailable");
    }

    const order = await Order.create({
      buyer: req.user._id,
      product: productId,
      seller: product.seller,
      amount: product.price,
      shippingAddress,
      paymentMethod,
    });

    // Mark product as sold
    product.status = "sold";
    await product.save();

    res.status(201).json({ success: true, order });
  })
);

// GET /api/orders/my – buyer's orders
router.get(
  "/my",
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title images price")
      .sort("-createdAt");
    res.json({ success: true, orders });
  })
);

export default router;
