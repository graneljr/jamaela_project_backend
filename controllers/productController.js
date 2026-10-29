import Product from "../models/Product.js";
import { saveUploadedProductImage } from "../utils/productUpload.js";

export async function getProducts(_req, res, next) {
  try {
    const products = await Product.find().sort({ id: 1 }).lean();
    res.json(products.map(({ _id, __v, ...product }) => product));
  } catch (error) { next(error); }
}

export async function createProduct(req, res, next) {
  try {
    const { name, category, description } = req.body || {};
    const rawPrice = req.body?.price;
    const rawStock = req.body?.stock;

    if (![name, category, description].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Complete all product details." });
    }
    if (name.trim().length < 2 || name.trim().length > 100) return res.status(400).json({ message: "Product name must be between 2 and 100 characters." });
    if (category.trim().length < 2 || category.trim().length > 40) return res.status(400).json({ message: "Category must be between 2 and 40 characters." });
    if (description.trim().length > 1000) return res.status(400).json({ message: "Product details must be 1,000 characters or fewer." });
    if (rawPrice === undefined || rawPrice === null || String(rawPrice).trim() === "" || rawStock === undefined || rawStock === null || String(rawStock).trim() === "") {
      return res.status(400).json({ message: "Enter both a price and starting stock." });
    }

    const parsedPrice = Number(rawPrice);
    const parsedStock = Number(rawStock);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || parsedPrice > 99999999 || !/^\d+(\.\d{1,2})?$/.test(String(rawPrice).trim())) {
      return res.status(400).json({ message: "Price must be a valid non-negative number." });
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0 || parsedStock > 1000000 || !/^\d+$/.test(String(rawStock).trim())) {
      return res.status(400).json({ message: "Stock must be a whole number from 0 to 1,000,000." });
    }

    let imagePath = "";
    if (req.file) {
      imagePath = await saveUploadedProductImage(req.file);
    } else if (typeof req.body?.image === "string" && req.body.image.trim()) {
      imagePath = req.body.image.trim();
    }

    if (!imagePath || typeof imagePath !== "string" || imagePath.length > 2048) {
      return res.status(400).json({ message: "Upload a product image before saving." });
    }

    const highestProduct = await Product.findOne().sort({ id: -1 }).select("id").lean();
    const product = await Product.create({
      id: (highestProduct?.id || 0) + 1,
      name: name.trim(),
      category: category.trim(),
      price: parsedPrice,
      stock: parsedStock,
      image: imagePath,
      description: description.trim(),
    });

    res.status(201).json(product);
  } catch (error) { next(error); }
}
