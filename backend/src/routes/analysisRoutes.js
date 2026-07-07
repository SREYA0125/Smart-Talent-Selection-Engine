import express from "express";
import { analyzeResume, getAnalysis } from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/:resumeId", analyzeResume);
router.get("/:resumeId", getAnalysis);

export default router;
