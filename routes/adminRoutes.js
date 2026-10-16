import { Router } from "express";
import { addProductStock, getAdminProducts, getDashboardSummary, updateProductInventory } from "../controllers/adminController.js";
import { createProduct } from "../controllers/productController.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();
router.get("/summary", requireAuth, requireAdmin, getDashboardSummary);
router.get("/products", requireAuth, requireAdmin, getAdminProducts);
router.post("/products", requireAuth, requireAdmin, createProduct);
router.post("/products/:id/stock", requireAuth, requireAdmin, addProductStock);
router.patch("/products/:id/inventory", requireAuth, requireAdmin, updateProductInventory);
export default router;
