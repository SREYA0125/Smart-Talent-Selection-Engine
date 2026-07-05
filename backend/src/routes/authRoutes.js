import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

// Why this file exists: maps HTTP verb + path to a controller function only.
// No business logic lives here — that keeps the route table readable at a
// glance and easy to extend as new auth-related endpoints are added
// (e.g. password reset, refresh tokens) later.
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
