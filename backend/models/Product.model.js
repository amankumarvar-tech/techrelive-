import mongoose from "mongoose";

const CATEGORIES = ["Mobile", "Laptop", "Tablet", "Accessories", "Camera", "Audio", "Gaming", "Other"];
const CONDITIONS = ["A", "B", "C"]; // A=Like New, B=Good, C=Fair

const conditionDescriptions = {
  A: "Like New – Minimal to no signs of use, all original accessories included.",
  B: "Good – Light scratches or minor wear, fully functional.",
  C: "Fair – Visible wear and tear, may have cosmetic damage but works properly.",
};

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
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be at least ₹1"],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: "{VALUE} is not a valid category",
      },
    },
    condition: {
      type: String,
      required: [true, "Condition grade is required"],
      enum: {
        values: CONDITIONS,
        message: "Condition must be A, B, or C",
      },
    },
    conditionDetails: {
      type: String,
      default: function () {
        return conditionDescriptions[this.condition] || "";
      },
    },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 6,
        message: "Provide between 1 and 6 images",
      },
      default: [],
    },
    brand: { type: String, trim: true, default: "" },
    model: { type: String, trim: true, default: "" },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: { type: Date, default: null },
    location: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
    },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────
productSchema.virtual("discountPercent").get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

productSchema.virtual("conditionLabel").get(function () {
  const labels = { A: "Like New", B: "Good", C: "Fair" };
  return labels[this.condition] || this.condition;
});

// ─── Indexes ──────────────────────────────────────────────
productSchema.index({ title: "text", description: "text", brand: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model("Product", productSchema);
