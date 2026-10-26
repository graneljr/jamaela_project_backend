import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use((req, res) => res.status(404).json({ message: `No API route for ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must contain valid JSON." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large." });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "A record with these details already exists." });
  }
  if (["ValidationError", "CastError"].includes(error.name)) {
    return res.status(400).json({ message: "One or more submitted values are invalid." });
  }
  console.error(error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

export default app;
