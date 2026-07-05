import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

// Why this file exists: every future protected route (jobs, resumes, and
// anything added later) needs the same check — a valid JWT, belonging to
// a user that still exists — before running its own logic. Centralizing it
// here means that logic is written once and route files stay declarative.
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token is invalid or expired",
      });
    }

    // Re-fetching the user on every request (rather than trusting the JWT
    // payload alone) ensures a deleted or since-modified user can't keep
    // acting on a still-valid token. The password hash is excluded via
    // `select` so it never ends up on req.user or accidentally in a response.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error("Auth middleware failure", { error: err.message });
    res.status(500).json({ success: false, message: "Server error during authentication" });
  }
};
