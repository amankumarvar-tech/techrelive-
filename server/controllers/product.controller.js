import Product from "../models/Product.model.js";

// ─── GET ALL PRODUCTS (with filters, search, pagination) ──────────────────────
export const getProducts = async (req, res, next) => {
  try {
    const {
      search, category, condition, minPrice, maxPrice,
      sort = "-createdAt", page = 1, limit = 12, status,
    } = req.query;

    const query = {};

    // Non-admin users only see approved products
    if (!req.user || req.user.role !== "admin") {
      query.status = "approved";
    } else if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (condition) query.condition = { $in: condition.split(",") };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("seller", "name avatar sellerProfile.rating")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET SINGLE PRODUCT ───────────────────────────────────────────────────────
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name avatar email phone sellerProfile")
      .populate("reviews.user", "name avatar");

    if (!product) return res.status(404).json({ error: "Product not found." });

    // Track views (fire and forget)
    Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    res.json({ product });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE PRODUCT (Seller) ─────────────────────────────────────────────────
export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body, seller: req.user._id, status: "pending" };
    const product = await Product.create(productData);
    res.status(201).json({
      message: "Product submitted for review.",
      product,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(". ") });
    }
    next(err);
  }
};

// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });

    // Sellers can only edit their own draft/pending listings
    if (req.user.role !== "admin") {
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "You do not own this listing." });
      }
      if (product.status === "approved") {
        return res.status(400).json({
          error: "Approved listings cannot be edited. Contact support.",
        });
      }
      // Reset to pending on edit
      req.body.status = "pending";
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ message: "Product updated.", product: updated });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });

    if (req.user.role !== "admin" && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied." });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully." });
  } catch (err) {
    next(err);
  }
};

// ─── ADMIN: APPROVE / REJECT ──────────────────────────────────────────────────
export const reviewListing = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Action must be 'approve' or 'reject'." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (product.status !== "pending") {
      return res.status(400).json({ error: "Only pending listings can be reviewed." });
    }

    product.status = action === "approve" ? "approved" : "rejected";
    product.approvedBy = req.user._id;
    product.approvedAt = new Date();
    if (action === "reject") product.rejectionReason = rejectionReason || "Does not meet standards.";

    await product.save();
    res.json({
      message: `Listing ${action}d successfully.`,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// ─── SELLER: MY LISTINGS ──────────────────────────────────────────────────────
export const getMyListings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { seller: req.user._id };
    if (status) query.status = status;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ error: "You have already reviewed this product." });
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    await product.save();
    res.status(201).json({ message: "Review added.", product });
  } catch (err) {
    next(err);
  }
};
