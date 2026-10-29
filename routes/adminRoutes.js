import { Router } from "express";
import multer from "multer";
import { addProductStock, getAdminProducts, getDashboardSummary, updateProductInventory } from "../controllers/adminController.js";
import { createProduct } from "../controllers/productController.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/summary", requireAuth, requireAdmin, getDashboardSummary);
router.get("/products", requireAuth, requireAdmin, getAdminProducts);
router.post("/products", requireAuth, requireAdmin, upload.single("image"), createProduct);
router.post("/products/:id/stock", requireAuth, requireAdmin, addProductStock);
router.patch("/products/:id/inventory", requireAuth, requireAdmin, updateProductInventory);
export default router;
