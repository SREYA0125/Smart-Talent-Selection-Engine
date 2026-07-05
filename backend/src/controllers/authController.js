import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { generateToken } from "../utils/generateToken.js";
import { logger } from "../utils/logger.js";

const SALT_ROUNDS = 10;

// Strips the password hash before a user object ever goes into a response.
// Defined once here so register/login/getMe can't accidentally leak it.
const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // `role` is intentionally never read from req.body — accepting a
    // client-supplied role would let anyone register themselves as ADMIN.
    // Every new user gets the schema's default (RECRUITER); promoting a
    // user to ADMIN is left as a deliberate, separate operation later.
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    logger.error("Register failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Same generic message whether the email doesn't exist or the password
    // is wrong — confirming "email not found" separately would let an
    // attacker enumerate registered accounts.
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    logger.error("Login failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// GET /api/auth/me  (protected)
// Included so the auth middleware has a real endpoint to verify against
// before any other module (jobs, resumes) exists to test it with.
export const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};
