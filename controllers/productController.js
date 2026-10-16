import Product from "../models/Product.js";

export async function getProducts(_req, res, next) {
  try {
    const products = await Product.find().sort({ id: 1 }).lean();
    res.json(products.map(({ _id, __v, ...product }) => product));
  } catch (error) { next(error); }
}

export async function createProduct(req, res, next) {
  try {
    const { name, category, price, stock, image, description } = req.body;
    if (![name, category, image, description].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Complete all product details." });
    }
    if (price === undefined || price === null || String(price).trim() === "" || stock === undefined || stock === null || String(stock).trim() === "") {
      return res.status(400).json({ message: "Enter both a price and starting stock." });
    }
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    let imageUrl;
    try { imageUrl = new URL(image); } catch { return res.status(400).json({ message: "Enter a valid image URL." }); }
    if (!["http:", "https:"].includes(imageUrl.protocol)) return res.status(400).json({ message: "Image URL must start with http or https." });
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isInteger(parsedStock) || parsedStock < 0) {
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
