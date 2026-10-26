import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  category: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
  price: { type: Number, required: true, min: 0, max: 99999999 },
  stock: { type: Number, required: true, min: 0, max: 1000000, default: 0 },
  image: { type: String, required: true, maxlength: 2048 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
});

export default mongoose.model("Product", productSchema);
