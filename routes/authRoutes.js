import { Router } from "express";
import { getCurrentUser, login, register, updateProfile } from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.patch("/profile", requireAuth, updateProfile);
export default router;
