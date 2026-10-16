import Product from "../models/Product.js";

const products = [
  { id: 1, name: "Cinnamoroll Plush", category: "Plushies", price: 599, stock: 20, image: "/products/plush.png", description: "A soft and cuddly puppy plush inspired by fluffy white clouds." },
  { id: 2, name: "Mini Cloud Plush", category: "Plushies", price: 399, stock: 20, image: "/products/plush.png", description: "A smaller cloud-soft friend that is easy to bring anywhere." },
  { id: 3, name: "Blue Tote Bag", category: "Accessories", price: 349, stock: 20, image: "/products/tote.png", description: "A roomy light-blue tote for school supplies and daily essentials." },
  { id: 4, name: "Cloud Keychain", category: "Accessories", price: 149, stock: 20, image: "/products/tote.png", description: "A simple and cute keychain for your bag, keys, or pencil case." },
  { id: 5, name: "Cloud Notebook", category: "Stationery", price: 199, stock: 20, image: "/products/stationery.png", description: "A spiral notebook for notes, doodles, and everyday ideas." },
  { id: 6, name: "Blue Pen Set", category: "Stationery", price: 129, stock: 20, image: "/products/stationery.png", description: "A set of smooth-writing pens in soft sky-blue colors." },
  { id: 7, name: "Cloud Mug", category: "Home", price: 299, stock: 20, image: "/products/mug.png", description: "A cheerful ceramic mug for milk, cocoa, or your favorite drink." },
  { id: 8, name: "Soft Blue Pillow", category: "Home", price: 449, stock: 20, image: "/products/plush.png", description: "A comfy decorative pillow with a soft and dreamy look." },
];

export async function seedProducts() {
  if (await Product.countDocuments() === 0) await Product.insertMany(products);
  await Product.updateMany({ stock: { $exists: false } }, { $set: { stock: 20 } });
}
