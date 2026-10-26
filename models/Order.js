import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  customer: {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    contact: { type: String, required: true, trim: true, maxlength: 24 },
    address: { type: String, required: true, trim: true, minlength: 8, maxlength: 300 },
  },
  items: [{
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0, max: 99999999 },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending", "processing", "shipped", "completed", "cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
