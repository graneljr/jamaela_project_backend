import Order from "../models/Order.js";
import Product from "../models/Product.js";

export async function getAdminProducts(_req, res, next) {
  try {
    res.json(await Product.find().sort({ id: 1 }).lean());
  } catch (error) { next(error); }
}

export async function addProductStock(req, res, next) {
  try {
    const quantity = Number(req.body.quantity);
    if (req.body.quantity === undefined || req.body.quantity === null || String(req.body.quantity).trim() === "" || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Stock to add must be a positive whole number." });
    }
    const product = await Product.findOneAndUpdate(
      { id: Number(req.params.id) },
      { $inc: { stock: quantity } },
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (error) { next(error); }
}

export async function updateProductInventory(req, res, next) {
  try {
    const changes = {};
    if (req.body.price !== undefined) {
      const price = Number(req.body.price);
      if (req.body.price === null || String(req.body.price).trim() === "" || !Number.isFinite(price) || price < 0) return res.status(400).json({ message: "Price must be a non-negative number." });
      changes.price = price;
    }
    if (req.body.stock !== undefined) {
      const stock = Number(req.body.stock);
      if (req.body.stock === null || String(req.body.stock).trim() === "" || !Number.isInteger(stock) || stock < 0) return res.status(400).json({ message: "Stock must be a non-negative whole number." });
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
