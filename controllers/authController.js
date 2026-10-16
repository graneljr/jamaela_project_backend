import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function publicUser(user) {
  return { id: user._id, fullName: user.fullName, email: user.email, contact: user.contact, role: user.role };
}

function createToken(user) {
  return jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res, next) {
  try {
    const { fullName, email, contact, password } = req.body;
    if (![fullName, email, contact, password].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Complete all fields to create your account." });
    }
    if (password.length < 8) return res.status(400).json({ message: "Use a password with at least 8 characters." });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      contact: contact.trim(),
      password: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ message: "Enter your email and password." });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export function getCurrentUser(req, res) {
  res.json(publicUser(req.user));
}

export async function updateProfile(req, res, next) {
  try {
    const { fullName, contact } = req.body;
    if (![fullName, contact].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Name and contact number are required." });
    }
    req.user.fullName = fullName.trim();
    req.user.contact = contact.trim();
    await req.user.save();
    res.json(publicUser(req.user));
  } catch (error) { next(error); }
}
