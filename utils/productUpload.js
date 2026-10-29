import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const uploadDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../frontend/public/products");

export async function saveUploadedProductImage(file) {
  if (!file) throw new Error("Select a product image.");

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
  }

  const originalName = (file.originalname || "product-image").trim();
  const extension = extname(originalName).toLowerCase() || ".png";
  const baseName = originalName.replace(new RegExp(`${extension.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "") || "product-image";
  const sanitizedBaseName = baseName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "product-image";
  const filename = `${Date.now()}-${sanitizedBaseName}${extension}`;

  await mkdir(uploadDirectory, { recursive: true });
  const destination = join(uploadDirectory, filename);
  await writeFile(destination, file.buffer);

  return `/products/${filename}`;
}
