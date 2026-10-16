import { Router } from "express";
import { createOrder, getMyOrders, getOrders, updateOrderStatus } from "../controllers/orderController.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();
router.post("/", requireAuth, createOrder);
router.get("/mine", requireAuth, getMyOrders);
router.get("/", requireAuth, requireAdmin, getOrders);
router.patch("/:id/status", requireAuth, requireAdmin, updateOrderStatus);
export default router;
