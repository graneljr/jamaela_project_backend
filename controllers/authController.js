import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function publicUser(user) {
  return { id: user._id, fullName: user.fullName, email: user.email, contact: user.contact, role: user.role };
}

function createToken(user) {
  return jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function validEmail(value) {
  const [local, domain, ...extraParts] = value.split("@");
  const domainLabels = (domain || "").split(".");
  const validLocal = local.length <= 64
    && /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)
    && !local.startsWith(".")
    && !local.endsWith(".")
    && !local.includes("..");
  const validDomain = domainLabels.length >= 2
    && domainLabels.every((label) => label.length <= 63 && /^[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/i.test(label));
  return value.length <= 254 && extraParts.length === 0 && validLocal && validDomain;
}

function validContact(value) {
  const digits = value.replace(/\D/g, "");
  return value.length <= 24 && /^[+\d() .-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
}

export async function register(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Authentication is not configured." });
    const { fullName, email, contact, password } = req.body || {};
    if (![fullName, email, contact, password].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Complete all fields to create your account." });
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 100) return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
    if (!validEmail(email.trim())) return res.status(400).json({ message: "Enter a valid email address." });
    if (!validContact(contact.trim())) return res.status(400).json({ message: "Enter a valid phone number with 7 to 15 digits." });
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ message: "Password must be at least 8 characters and no more than 72 bytes." });
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
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Authentication is not configured." });
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ message: "Enter your email and password." });
    if (!email.trim() || !password || !validEmail(email.trim())) return res.status(400).json({ message: "Enter a valid email and password." });
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
    const { fullName, contact } = req.body || {};
    if (![fullName, contact].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Name and contact number are required." });
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 100) return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
    if (!validContact(contact.trim())) return res.status(400).json({ message: "Enter a valid phone number with 7 to 15 digits." });
    req.user.fullName = fullName.trim();
    req.user.contact = contact.trim();
    await req.user.save();
    res.json(publicUser(req.user));
  } catch (error) { next(error); }
}
