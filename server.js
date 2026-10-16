import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedProducts } from "./config/seedProducts.js";

const PORT = process.env.PORT || 5000;

try {
  if (!process.env.JWT_SECRET) throw new Error("Set JWT_SECRET in backend/.env before starting the server.");
  await connectDB();
  await seedProducts();
  app.listen(PORT, () => console.log(`Cinnamoroll API running on port ${PORT}`));
} catch (error) {
  console.error("Could not start the API:", error.message);
  process.exit(1);
}
