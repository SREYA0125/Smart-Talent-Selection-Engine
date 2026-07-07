import express from "express";
import { getRankings } from "../controllers/rankingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/:jobId", getRankings);

export default router;
