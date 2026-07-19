import express from "express";
import { analyzeResume, getAnalysis } from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.RECRUITER));

router.post("/:resumeId", analyzeResume);
router.get("/:resumeId", getAnalysis);

export default router;
