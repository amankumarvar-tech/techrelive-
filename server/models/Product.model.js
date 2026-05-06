import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Mobile", "Laptop", "Accessories", "Tablet", "Camera", "Audio", "Gaming", "Other"],
        message: "{VALUE} is not a valid category",
      },
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
      default: "",
    },
    // ─── Condition Grade System ──────────────────────────────────────────────
    // Grade A: Like New – minimal signs of use, all original accessories
    // Grade B: Good – light scratches/scuffs, fully functional, minor cosmetic wear
    // Grade C: Fair – visible wear, may have minor functional issues, discounted
    condition: {
      type: String,
      required: [true, "Condition grade is required"],
      enum: {
        values: ["A", "B", "C"],
        message: "Condition must be A (Like New), B (Good), or C (Fair)",
      },
    },
    conditionDetails: {
      type: String,
      maxlength: 500,
      default: "",
    },
    images: {
      type: [String],
      validate: {
        validator: (v) => v.length >= 1 && v.length <= 8,
        message: "Product must have between 1 and 8 images",
      },
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 1,
    },
    sold: {
      type: Number,
      default: 0,
    },
    // ─── Admin Approval Flow ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold", "draft"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    // ─── Shipping ────────────────────────────────────────────────────────────
    shippingOptions: {
      freeShipping: { type: Boolean, default: false },
      shippingCost: { type: Number, default: 0, min: 0 },
      estimatedDays: { type: String, default: "3-7 business days" },
    },
    location: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "US" },
    },
    // ─── Engagement ──────────────────────────────────────────────────────────
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ title: "text", description: "text", brand: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ condition: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, status: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
productSchema.virtual("discountPercent").get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

productSchema.virtual("conditionLabel").get(function () {
  const labels = { A: "Like New", B: "Good", C: "Fair" };
  return labels[this.condition] || this.condition;
});

productSchema.virtual("isAvailable").get(function () {
  return this.status === "approved" && this.stock > 0;
});

// ─── Pre-save: Recalculate Rating ─────────────────────────────────────────────
productSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = parseFloat((total / this.reviews.length).toFixed(1));
    this.numReviews = this.reviews.length;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
