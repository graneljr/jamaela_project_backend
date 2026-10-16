import Order from "../models/Order.js";
import Product from "../models/Product.js";

export async function createOrder(req, res, next) {
  try {
    const { address, items } = req.body;
    if (typeof address !== "string" || !address.trim() || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Add a delivery address and at least one item." });
    }

    const quantities = new Map();
    for (const item of items) {
      if (!item || typeof item !== "object") return res.status(400).json({ message: "Order items are invalid." });
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ message: "Order items are invalid." });
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
      if (quantities.get(productId) > 99) return res.status(400).json({ message: "Maximum quantity per product is 99." });
    }
    const reservedProducts = [];
    try {
      const orderItems = [];
      for (const [productId, quantity] of [...quantities].sort(([a], [b]) => a - b)) {
        const product = await Product.findOneAndUpdate(
          { id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true },
        );
        if (!product) {
          await Promise.all(reservedProducts.map(({ id, quantity: reservedQuantity }) => Product.updateOne({ id }, { $inc: { stock: reservedQuantity } })));
          return res.status(409).json({ message: "One or more products do not have enough stock. Refresh the page and try again." });
        }
        reservedProducts.push({ id: productId, quantity });
        orderItems.push({ productId: product.id, name: product.name, price: product.price, quantity });
      }

      const order = await Order.create({
        user: req.user._id,
        customer: { fullName: req.user.fullName, email: req.user.email, contact: req.user.contact, address },
        items: orderItems,
        total: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      });
      res.status(201).json(order);
    } catch (error) {
      await Promise.all(reservedProducts.map(({ id, quantity }) => Product.updateOne({ id }, { $inc: { stock: quantity } })));
      throw error;
    }
  } catch (error) { next(error); }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) { next(error); }
}

export async function getOrders(_req, res, next) {
  try { res.json(await Order.find().sort({ createdAt: -1 }).lean()); }
  catch (error) { next(error); }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const allowedStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];
    if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: "Choose a valid order status." });
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: { $ne: "cancelled" } },
      { status: req.body.status },
      { new: true, runValidators: true },
    );
    if (!order) {
      const existing = await Order.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Order not found." });
      if (existing.status === "cancelled" && req.body.status === "cancelled") return res.json(existing);
      return res.status(400).json({ message: "Cancelled orders cannot be reopened." });
    }
    if (req.body.status === "cancelled") {
      await Promise.all(order.items.map((item) => Product.updateOne({ id: item.productId }, { $inc: { stock: item.quantity } })));
    }
    res.json(order);
  } catch (error) { next(error); }
}
