import Product from "../models/Product.js";

export async function getProducts(_req, res, next) {
  try {
    const products = await Product.find().sort({ id: 1 }).lean();
    res.json(products.map(({ _id, __v, ...product }) => product));
  } catch (error) { next(error); }
}

export async function createProduct(req, res, next) {
  try {
    const { name, category, price, stock, image, description } = req.body || {};
    if (![name, category, image, description].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Complete all product details." });
    }
    if (name.trim().length < 2 || name.trim().length > 100) return res.status(400).json({ message: "Product name must be between 2 and 100 characters." });
    if (category.trim().length < 2 || category.trim().length > 40) return res.status(400).json({ message: "Category must be between 2 and 40 characters." });
    if (description.trim().length > 1000) return res.status(400).json({ message: "Product details must be 1,000 characters or fewer." });
    if (typeof image !== "string" || image.length > 2048) return res.status(400).json({ message: "Image URL must be 2,048 characters or fewer." });
    if (price === undefined || price === null || String(price).trim() === "" || stock === undefined || stock === null || String(stock).trim() === "") {
      return res.status(400).json({ message: "Enter both a price and starting stock." });
    }
    if (typeof price !== "number" || typeof stock !== "number") return res.status(400).json({ message: "Price and starting stock must be numbers." });
    const parsedPrice = price;
    const parsedStock = stock;
    let imageUrl;
    try { imageUrl = new URL(image); } catch { return res.status(400).json({ message: "Enter a valid image URL." }); }
    if (!["http:", "https:"].includes(imageUrl.protocol)) return res.status(400).json({ message: "Image URL must start with http or https." });
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || parsedPrice > 99999999 || !/^\d+(\.\d{1,2})?$/.test(String(price).trim()) || !/^\d+$/.test(String(stock).trim()) || !Number.isInteger(parsedStock) || parsedStock < 0 || parsedStock > 1000000) {
      return res.status(400).json({ message: "Price and stock must be valid non-negative numbers." });
    }

    const highestProduct = await Product.findOne().sort({ id: -1 }).select("id").lean();
    const product = await Product.create({
      id: (highestProduct?.id || 0) + 1,
      name: name.trim(), category: category.trim(), price: parsedPrice,
      stock: parsedStock, image: imageUrl.toString(), description: description.trim(),
    });
    res.status(201).json(product);
  } catch (error) { next(error); }
}
