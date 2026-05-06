import asyncHandler from "express-async-handler";
import Product from "../models/Product.model.js";

// ─── GET /api/products ────────────────────────────────────
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    condition,
    minPrice,
    maxPrice,
    sort = "-createdAt",
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { status: "approved" };

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("seller", "name sellerProfile.storeName sellerProfile.rating")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    products,
  });
});

// ─── GET /api/products/:id ────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("seller", "name email sellerProfile phone");

  if (!product || product.status !== "approved") {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
});

// ─── POST /api/products ───────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, seller: req.user._id });
  res.status(201).json({ success: true, product });
});

// ─── PUT /api/products/:id ────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    seller: req.user._id,
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found or you are not the owner");
  }

  if (product.status === "sold") {
    res.status(400);
    throw new Error("Sold products cannot be edited");
  }

  Object.assign(product, req.body);
  product.status = "pending"; // Re-approve after edits
  await product.save();

  res.json({ success: true, product });
});

// ─── DELETE /api/products/:id ─────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    seller: req.user._id,
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found or you are not the owner");
  }

  res.json({ success: true, message: "Product deleted" });
});

// ─── GET /api/products/seller/my-listings ─────────────────
export const getMyListings = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id })
    .sort("-createdAt")
    .lean();
  res.json({ success: true, products });
});
