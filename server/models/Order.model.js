import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String, enum: ["A", "B", "C"], required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer is required"],
    },
    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Order must have at least one item",
      },
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: "US" },
      phone: { type: String, required: true },
    },
    payment: {
      method: {
        type: String,
        enum: ["stripe", "paypal", "cod"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      transactionId: { type: String, default: "" },
      paidAt: { type: Date },
    },
    pricing: {
      itemsTotal: { type: Number, required: true, min: 0 },
      shippingCost: { type: Number, required: true, default: 0 },
      tax: { type: Number, required: true, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled", "returned"],
      default: "placed",
    },
    tracking: {
      carrier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      estimatedDelivery: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    cancellation: {
      reason: { type: String, default: "" },
      cancelledAt: { type: Date },
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    notes: { type: String, maxlength: 500, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ createdAt: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
orderSchema.virtual("isDelivered").get(function () {
  return this.orderStatus === "delivered";
});

orderSchema.virtual("isPaid").get(function () {
  return this.payment.status === "completed";
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
