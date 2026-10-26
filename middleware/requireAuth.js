import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function requireAuth(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Please log in to continue." });
  if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Authentication is not configured." });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Your login has expired. Please log in again." });
  }

  try {
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "Your account could not be verified. Please log in again." });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
