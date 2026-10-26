import Order from "../models/Order.js";
import Product from "../models/Product.js";

export async function getAdminProducts(_req, res, next) {
  try {
    res.json(await Product.find().sort({ id: 1 }).lean());
  } catch (error) { next(error); }
}

export async function addProductStock(req, res, next) {
  try {
    const body = req.body || {};
    const quantity = body.quantity;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000000) {
      return res.status(400).json({ message: "Stock to add must be a positive whole number." });
    }
    const product = await Product.findOneAndUpdate(
      { id: Number(req.params.id), stock: { $lte: 1000000 - quantity } },
      { $inc: { stock: quantity } },
      { new: true, runValidators: true },
    );
    if (!product) {
      const existing = await Product.exists({ id: Number(req.params.id) });
      if (!existing) return res.status(404).json({ message: "Product not found." });
      return res.status(400).json({ message: "Available stock cannot exceed 1,000,000 units." });
    }
    res.json(product);
  } catch (error) { next(error); }
}

export async function updateProductInventory(req, res, next) {
  try {
    const body = req.body || {};
    const changes = {};
    if (body.price !== undefined) {
      const price = body.price;
      if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 99999999 || !/^\d+(\.\d{1,2})?$/.test(String(price))) return res.status(400).json({ message: "Price must be from 0 to 99,999,999 with up to 2 decimal places." });
      changes.price = price;
    }
    if (body.stock !== undefined) {
      const stock = body.stock;
      if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0 || stock > 1000000) return res.status(400).json({ message: "Stock must be a whole number from 0 to 1,000,000." });
      changes.stock = stock;
    }
    if (Object.keys(changes).length === 0) return res.status(400).json({ message: "Provide a price or stock quantity to update." });

    const product = await Product.findOneAndUpdate(
      { id: Number(req.params.id) },
      { $set: changes },
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (error) { next(error); }
}

export async function getDashboardSummary(_req, res, next) {
  try {
    const [totalOrders, pendingOrders, completedOrders, revenueRows, lowStockProducts] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "completed" }),
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Product.countDocuments({ stock: { $lte: 5 } }),
    ]);
    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      revenue: revenueRows[0]?.total || 0,
      lowStockProducts,
    });
  } catch (error) { next(error); }
}
